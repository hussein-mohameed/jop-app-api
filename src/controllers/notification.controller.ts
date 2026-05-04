/**
 * @file Notification controller — bridge between API routes and notification service.
 * Users can only access their own notifications.
 */

import 'server-only';
import * as notificationService from '@/services/notifications/notification.service';
import { notificationQuerySchema } from '@/schemas/notification.schema';
import { requireAuth } from '@/security/middleware/auth.middleware';

export async function handleListNotifications(request: Request): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;

    const url = new URL(request.url);
    const validation = notificationQuerySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!validation.success) {
      return Response.json({ success: false, error: 'Invalid query', data: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const result = await notificationService.listNotifications(auth.session.sub, validation.data);
    return Response.json(result, { status: result.success ? 200 : 500 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function handleMarkAsRead(_request: Request, id: string): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;

    const result = await notificationService.markAsRead(id, auth.session.sub);
    return Response.json(result, { status: result.success ? 200 : 400 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function handleMarkAllAsRead(): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;

    const result = await notificationService.markAllAsRead(auth.session.sub);
    return Response.json(result, { status: result.success ? 200 : 400 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function handleGetUnreadCount(): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;

    const result = await notificationService.getUnreadCount(auth.session.sub);
    return Response.json(result, { status: result.success ? 200 : 500 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
