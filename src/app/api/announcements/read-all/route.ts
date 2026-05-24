/**
 * @file Mark all announcements as read API route.
 * PATCH /api/announcements/read-all → Mark all as read
 */

import { handleMarkAllAsRead } from '@/controllers/announcement.controller';

export async function PATCH(): Promise<Response> {
  return handleMarkAllAsRead();
}
