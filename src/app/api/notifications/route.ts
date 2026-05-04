/**
 * @file Notifications collection API route.
 * GET /api/notifications → List user's notifications
 */

import { handleListNotifications } from '@/controllers/notification.controller';

export async function GET(request: Request): Promise<Response> {
  return handleListNotifications(request);
}
