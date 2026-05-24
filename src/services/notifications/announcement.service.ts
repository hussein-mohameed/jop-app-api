/**
 * @file Announcement service — business logic for the announcement system.
 *
 * Authorization rules:
 * - MANAGER: can send to their own department only
 * - HR_MANAGER: can send to any department or specific employees
 * - COMPANY_ADMIN: can send to anyone (including ALL_EMPLOYEES)
 * - ALL_EMPLOYEES target is restricted to COMPANY_ADMIN only
 */

import 'server-only';
import * as announcementRepo from '@/repositories/announcement.repository';
import type { JwtPayload } from '@/types/auth.types';
import { Role } from '@/types/auth.types';
import type { ApiResponse, PaginatedResponse } from '@/types/common.types';
import type { AnnouncementPriority } from '@prisma/client';

// ==================== TYPES ====================

interface AnnouncementTargetInput {
  type: 'ALL_EMPLOYEES' | 'DEPARTMENT' | 'SPECIFIC_EMPLOYEES';
  departmentId?: string;
  employeeId?: string;
}

interface CreateAnnouncementInput {
  title: string;
  content: string;
  priority: AnnouncementPriority;
  targets: AnnouncementTargetInput[];
}

// ==================== MUTATIONS ====================

/**
 * Send an announcement — validates authorization before creation.
 */
export async function sendAnnouncement(
  session: JwtPayload,
  input: CreateAnnouncementInput
): Promise<ApiResponse<{ id: string; recipientCount: number }>> {
  try {
    // Authorization: only MANAGER, HR_MANAGER, COMPANY_ADMIN can send
    const allowedRoles: string[] = [Role.MANAGER, Role.HR_MANAGER, Role.COMPANY_ADMIN];
    if (!allowedRoles.includes(session.role)) {
      return { success: false, error: 'Only managers and admins can send announcements' };
    }

    // Authorization: ALL_EMPLOYEES target is COMPANY_ADMIN only
    const hasAllTarget = input.targets.some((t) => t.type === 'ALL_EMPLOYEES');
    if (hasAllTarget && session.role !== Role.COMPANY_ADMIN) {
      return {
        success: false,
        error: 'Only company admin can send announcements to all employees',
      };
    }

    // Authorization: MANAGER can only target their own department
    if (session.role === Role.MANAGER) {
      for (const target of input.targets) {
        if (target.type === 'DEPARTMENT' && target.departmentId !== session.departmentId) {
          return {
            success: false,
            error: 'Managers can only send announcements to their own department',
          };
        }
      }
    }

    const result = await announcementRepo.create({
      senderId: session.sub,
      title: input.title,
      content: input.content,
      priority: input.priority,
      targets: input.targets.map((t) => ({
        type: t.type,
        departmentId: t.departmentId,
        employeeId: t.employeeId,
      })),
    });

    return {
      success: true,
      data: {
        id: result.id,
        recipientCount: result._count.recipients,
      },
      message: `Announcement sent to ${result._count.recipients} recipients`,
    };
  } catch (error) {
    return { success: false, error: `Failed to send announcement: ${String(error)}` };
  }
}

// ==================== QUERIES (Recipient) ====================

/**
 * List received announcements for the current user.
 */
export async function getReceivedAnnouncements(
  userId: string,
  params: { page?: number; pageSize?: number; priority?: AnnouncementPriority; isRead?: boolean }
): Promise<ApiResponse<PaginatedResponse<unknown>>> {
  try {
    const { items, total } = await announcementRepo.findReceivedByUserId(
      userId,
      { priority: params.priority, isRead: params.isRead },
      params.page ?? 1,
      params.pageSize ?? 20
    );

    // Flatten the nested structure for the client
    const flatItems = items.map((r) => ({
      id: r.announcement.id,
      title: r.announcement.title,
      content: r.announcement.content,
      priority: r.announcement.priority,
      sender: r.announcement.sender,
      targets: r.announcement.targets,
      isRead: r.isRead,
      readAt: r.readAt,
      createdAt: r.announcement.createdAt,
    }));

    const pageSize = params.pageSize ?? 20;
    return {
      success: true,
      data: {
        items: flatItems,
        total,
        page: params.page ?? 1,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    return { success: false, error: `Failed to fetch announcements: ${String(error)}` };
  }
}

// ==================== QUERIES (Sender) ====================

/**
 * List sent announcements for the current user.
 */
export async function getSentAnnouncements(
  userId: string,
  params: { page?: number; pageSize?: number }
): Promise<ApiResponse<PaginatedResponse<unknown>>> {
  try {
    const { items, total } = await announcementRepo.findSentByUserId(
      userId,
      params.page ?? 1,
      params.pageSize ?? 20
    );

    const flatItems = items.map((a) => ({
      id: a.id,
      title: a.title,
      content: a.content,
      priority: a.priority,
      targets: a.targets,
      recipientCount: a._count.recipients,
      readCount: a.recipients.length,
      createdAt: a.createdAt,
    }));

    const pageSize = params.pageSize ?? 20;
    return {
      success: true,
      data: {
        items: flatItems,
        total,
        page: params.page ?? 1,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    return { success: false, error: `Failed to fetch sent announcements: ${String(error)}` };
  }
}

// ==================== READ STATUS ====================

/**
 * Mark a single announcement as read.
 */
export async function markAsRead(
  announcementId: string,
  userId: string
): Promise<ApiResponse<void>> {
  try {
    await announcementRepo.markAsRead(announcementId, userId);
    return { success: true, message: 'Announcement marked as read' };
  } catch (error) {
    return { success: false, error: `Failed to mark announcement: ${String(error)}` };
  }
}

/**
 * Mark all announcements as read for a user.
 */
export async function markAllAsRead(userId: string): Promise<ApiResponse<void>> {
  try {
    await announcementRepo.markAllAsRead(userId);
    return { success: true, message: 'All announcements marked as read' };
  } catch (error) {
    return { success: false, error: `Failed to mark all announcements: ${String(error)}` };
  }
}

// ==================== STATS ====================

/**
 * Get unread statistics: total unread + unread today.
 */
export async function getUnreadStats(
  userId: string
): Promise<ApiResponse<{ unreadToday: number; unreadTotal: number }>> {
  try {
    const [unreadTotal, unreadToday] = await Promise.all([
      announcementRepo.countUnread(userId),
      announcementRepo.countUnreadToday(userId),
    ]);

    return {
      success: true,
      data: { unreadToday, unreadTotal },
    };
  } catch (error) {
    return { success: false, error: `Failed to get unread stats: ${String(error)}` };
  }
}

/**
 * Get recent unread announcements for header dropdown preview.
 */
export async function getRecentUnread(
  userId: string
): Promise<ApiResponse<unknown[]>> {
  try {
    const items = await announcementRepo.findRecentUnread(userId, 5);

    const flatItems = items.map((r) => ({
      id: r.announcement.id,
      title: r.announcement.title,
      content: r.announcement.content,
      priority: r.announcement.priority,
      sender: r.announcement.sender,
      isRead: r.isRead,
      createdAt: r.announcement.createdAt,
    }));

    return { success: true, data: flatItems };
  } catch (error) {
    return { success: false, error: `Failed to get recent announcements: ${String(error)}` };
  }
}
