/**
 * @file Mark all notifications as read API route.
 * PATCH /api/notifications/read-all → Mark all as read
 */

import { handleMarkAllAsRead } from '@/controllers/notification.controller';

export async function PATCH(): Promise<Response> {
  return handleMarkAllAsRead();
}
