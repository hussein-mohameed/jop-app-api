/**
 * @file Sent announcements API route.
 * GET /api/announcements/sent → List announcements sent by the current user
 */

import { handleListSent } from '@/controllers/announcement.controller';

export async function GET(request: Request): Promise<Response> {
  return handleListSent(request);
}
