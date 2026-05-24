/**
 * @file Unread stats API route.
 * GET /api/announcements/unread-stats → Get unread announcement statistics
 */

import { handleUnreadStats } from '@/controllers/announcement.controller';

export async function GET(): Promise<Response> {
  return handleUnreadStats();
}
