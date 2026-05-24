/**
 * @file Single announcement read API route.
 * PATCH /api/announcements/:id/read → Mark announcement as read
 */

import { handleMarkAsRead } from '@/controllers/announcement.controller';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  return handleMarkAsRead(request, id);
}
