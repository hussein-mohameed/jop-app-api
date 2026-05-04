/**
 * @file Notification service — reusable helper for sending in-app notifications.
 * Imported by other services to notify users about actions.
 * Fire-and-forget — notification failures should never block the main operation.
 */

import 'server-only';
import * as notificationRepo from '@/repositories/notification.repository';
import type { NotificationType } from '@prisma/client';
import type { ApiResponse, PaginatedResponse } from '@/types/common.types';

// ==================== HELPERS (for other services to import) ====================

/**
 * Send a notification to a single user. Fire-and-forget.
 */
export async function notify(data: {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
  metadata?: object;
}): Promise<void> {
  try {
    await notificationRepo.create(data);
  } catch {
    console.error('[NotificationService] Failed to send notification:', data.title);
  }
}

/**
 * Send notifications to multiple users. Fire-and-forget.
 */
export async function notifyMany(
  notifications: {
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
    link?: string;
  }[]
): Promise<void> {
  try {
    await notificationRepo.createMany(notifications);
  } catch {
    console.error('[NotificationService] Failed to send bulk notifications');
  }
}

// ==================== QUERIES ====================

/**
 * List notifications for the current user.
 */
export async function listNotifications(
  userId: string,
  params: { page?: number; pageSize?: number; isRead?: boolean; type?: NotificationType }
): Promise<ApiResponse<PaginatedResponse<unknown>>> {
  try {
    const { items, total } = await notificationRepo.findByUserId(
      userId,
      { isRead: params.isRead, type: params.type },
      params.page ?? 1,
      params.pageSize ?? 20
    );

    const pageSize = params.pageSize ?? 20;
    return {
      success: true,
      data: {
        items,
        total,
        page: params.page ?? 1,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    return { success: false, error: `Failed to list notifications: ${String(error)}` };
  }
}

/**
 * Mark a single notification as read.
 */
export async function markAsRead(
  notificationId: string,
  userId: string
): Promise<ApiResponse<void>> {
  try {
    await notificationRepo.markAsRead(notificationId, userId);
    return { success: true, message: 'Notification marked as read' };
  } catch (error) {
    return { success: false, error: `Failed to mark notification: ${String(error)}` };
  }
}

/**
 * Mark all notifications as read for a user.
 */
export async function markAllAsRead(userId: string): Promise<ApiResponse<void>> {
  try {
    await notificationRepo.markAllAsRead(userId);
    return { success: true, message: 'All notifications marked as read' };
  } catch (error) {
    return { success: false, error: `Failed to mark all notifications: ${String(error)}` };
  }
}

/**
 * Get unread notification count for badge display.
 */
export async function getUnreadCount(userId: string): Promise<ApiResponse<{ count: number }>> {
  try {
    const count = await notificationRepo.countUnread(userId);
    return { success: true, data: { count } };
  } catch (error) {
    return { success: false, error: `Failed to get unread count: ${String(error)}` };
  }
}
