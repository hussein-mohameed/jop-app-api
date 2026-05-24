/**
 * @file Announcements collection API route.
 * GET  /api/announcements → List received announcements
 * POST /api/announcements → Send a new announcement
 */

import { handleListReceived, handleSendAnnouncement } from '@/controllers/announcement.controller';

export async function GET(request: Request): Promise<Response> {
  return handleListReceived(request);
}

export async function POST(request: Request): Promise<Response> {
  return handleSendAnnouncement(request);
}
