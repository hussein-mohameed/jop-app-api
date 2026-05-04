/**
 * @file Notification unread count API route.
 * GET /api/notifications/count → Get unread notification count
 */

import { handleGetUnreadCount } from '@/controllers/notification.controller';

export async function GET(): Promise<Response> {
  return handleGetUnreadCount();
}
