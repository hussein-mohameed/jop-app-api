/**
 * @file Announcement repository — data layer for the announcement system.
 * NO business logic — only Prisma queries.
 *
 * Design:
 * - Announcements are created by managers/admins with flexible targeting.
 * - Recipients are materialized at creation time for fast read-status queries.
 * - Supports combined targets (all + department + specific employees).
 */

import 'server-only';
import prisma from '@/lib/prisma';
import type { AnnouncementPriority, AnnouncementTargetType } from '@prisma/client';

// ==================== TYPES ====================

export interface CreateAnnouncementData {
  senderId: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  targets: {
    type: AnnouncementTargetType;
    departmentId?: string;
    employeeId?: string;
  }[];
}

export interface AnnouncementFilters {
  priority?: AnnouncementPriority;
  isRead?: boolean;
}

// ==================== SELECT SHAPES ====================

const recipientAnnouncementSelect = {
  id: true,
  announcementId: true,
  isRead: true,
  readAt: true,
  announcement: {
    select: {
      id: true,
      title: true,
      content: true,
      priority: true,
      createdAt: true,
      sender: {
        select: { id: true, firstName: true, lastName: true, role: true },
      },
      targets: {
        select: { id: true, targetType: true, departmentId: true, employeeId: true },
      },
    },
  },
} as const;

const sentAnnouncementSelect = {
  id: true,
  title: true,
  content: true,
  priority: true,
  createdAt: true,
  targets: {
    select: { id: true, targetType: true, departmentId: true, employeeId: true },
  },
  _count: {
    select: {
      recipients: true,
    },
  },
  recipients: {
    where: { isRead: true },
    select: { id: true },
  },
} as const;

// ==================== MUTATIONS ====================

/**
 * Create an announcement with targets and materialized recipient rows.
 * Resolves all target groups into individual AnnouncementRecipient rows.
 */
export async function create(data: CreateAnnouncementData) {
  // Step 1: Resolve all unique recipient user IDs from targets
  const recipientUserIds = new Set<string>();

  for (const target of data.targets) {
    switch (target.type) {
      case 'ALL_EMPLOYEES': {
        const allUsers = await prisma.user.findMany({
          where: { isActive: true },
          select: { id: true },
        });
        allUsers.forEach((u) => recipientUserIds.add(u.id));
        break;
      }
      case 'DEPARTMENT': {
        if (!target.departmentId) break;
        const deptEmployees = await prisma.employee.findMany({
          where: { departmentId: target.departmentId, employmentStatus: 'ACTIVE' },
          select: { userId: true },
        });
        deptEmployees.forEach((e) => recipientUserIds.add(e.userId));
        break;
      }
      case 'SPECIFIC_EMPLOYEES': {
        if (!target.employeeId) break;
        // employeeId here is the Employee.id — resolve to userId
        const emp = await prisma.employee.findUnique({
          where: { id: target.employeeId },
          select: { userId: true },
        });
        if (emp) recipientUserIds.add(emp.userId);
        break;
      }
    }
  }

  // Exclude the sender from receiving their own announcement
  recipientUserIds.delete(data.senderId);

  // Step 2: Create announcement + targets + recipients in a transaction
  return prisma.announcement.create({
    data: {
      senderId: data.senderId,
      title: data.title,
      content: data.content,
      priority: data.priority,
      targets: {
        create: data.targets.map((t) => ({
          targetType: t.type,
          departmentId: t.departmentId ?? null,
          employeeId: t.employeeId ?? null,
        })),
      },
      recipients: {
        create: Array.from(recipientUserIds).map((userId) => ({
          userId,
        })),
      },
    },
    select: {
      id: true,
      title: true,
      priority: true,
      createdAt: true,
      _count: { select: { recipients: true } },
    },
  });
}

// ==================== QUERIES (Recipient) ====================

/**
 * Find announcements received by a user (paginated).
 */
export async function findReceivedByUserId(
  userId: string,
  filters: AnnouncementFilters = {},
  page = 1,
  pageSize = 20
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { userId };
  if (filters.isRead !== undefined) where.isRead = filters.isRead;
  if (filters.priority) {
    where.announcement = { priority: filters.priority };
  }

  const skip = (page - 1) * pageSize;
  const [items, total] = await Promise.all([
    prisma.announcementRecipient.findMany({
      where,
      select: recipientAnnouncementSelect,
      skip,
      take: pageSize,
      orderBy: { announcement: { createdAt: 'desc' } },
    }),
    prisma.announcementRecipient.count({ where }),
  ]);

  return { items, total };
}

// ==================== QUERIES (Sender) ====================

/**
 * Find announcements sent by a user (paginated).
 */
export async function findSentByUserId(
  userId: string,
  page = 1,
  pageSize = 20
) {
  const where = { senderId: userId };
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      select: sentAnnouncementSelect,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.announcement.count({ where }),
  ]);

  return { items, total };
}

// ==================== READ STATUS ====================

/**
 * Mark a single announcement as read for a user.
 */
export async function markAsRead(announcementId: string, userId: string) {
  return prisma.announcementRecipient.updateMany({
    where: { announcementId, userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
}

/**
 * Mark all announcements as read for a user.
 */
export async function markAllAsRead(userId: string) {
  return prisma.announcementRecipient.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
}

// ==================== STATS ====================

/**
 * Count total unread announcements for a user.
 */
export async function countUnread(userId: string): Promise<number> {
  return prisma.announcementRecipient.count({
    where: { userId, isRead: false },
  });
}

/**
 * Count unread announcements created today for a user.
 */
export async function countUnreadToday(userId: string): Promise<number> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  return prisma.announcementRecipient.count({
    where: {
      userId,
      isRead: false,
      announcement: {
        createdAt: { gte: todayStart },
      },
    },
  });
}

/**
 * Get recent unread announcements for dropdown preview (max 5).
 */
export async function findRecentUnread(userId: string, limit = 5) {
  return prisma.announcementRecipient.findMany({
    where: { userId, isRead: false },
    select: recipientAnnouncementSelect,
    orderBy: { announcement: { createdAt: 'desc' } },
    take: limit,
  });
}
