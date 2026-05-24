/**
 * @file Recent unread announcements API route.
 * GET /api/announcements/recent → Get recent unread announcements for dropdown
 */

import { handleRecentUnread } from '@/controllers/announcement.controller';

export async function GET(): Promise<Response> {
  return handleRecentUnread();
}
