/**
 * @file Single notification API route.
 * PATCH /api/notifications/:id → Mark notification as read
 */

import { handleMarkAsRead } from '@/controllers/notification.controller';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  return handleMarkAsRead(request, id);
}
