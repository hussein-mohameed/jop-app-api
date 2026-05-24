/**
 * @file Announcement controller — bridge between API routes and announcement service.
 *
 * Handles:
 * - POST   /api/announcements          → Send announcement
 * - GET    /api/announcements          → List received announcements
 * - GET    /api/announcements/sent     → List sent announcements
 * - GET    /api/announcements/unread-stats → Unread statistics
 * - GET    /api/announcements/recent   → Recent unread for dropdown
 * - PATCH  /api/announcements/:id/read → Mark as read
 * - PATCH  /api/announcements/read-all → Mark all as read
 */

import 'server-only';
import * as announcementService from '@/services/notifications/announcement.service';
import { createAnnouncementSchema, announcementQuerySchema } from '@/schemas/announcement.schema';
import { requireAuth } from '@/security/middleware/auth.middleware';

// ==================== CREATE ====================

export async function handleSendAnnouncement(request: Request): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;

    const body = await request.json();
    const validation = createAnnouncementSchema.safeParse(body);
    if (!validation.success) {
      return Response.json(
        { success: false, error: 'Invalid request data', data: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await announcementService.sendAnnouncement(auth.session, validation.data);
    return Response.json(result, { status: result.success ? 201 : 403 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ==================== RECEIVED ====================

export async function handleListReceived(request: Request): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;

    const url = new URL(request.url);
    const validation = announcementQuerySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!validation.success) {
      return Response.json(
        { success: false, error: 'Invalid query', data: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await announcementService.getReceivedAnnouncements(
      auth.session.sub,
      validation.data
    );
    return Response.json(result, { status: result.success ? 200 : 500 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ==================== SENT ====================

export async function handleListSent(request: Request): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;

    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '20');

    const result = await announcementService.getSentAnnouncements(
      auth.session.sub,
      { page, pageSize }
    );
    return Response.json(result, { status: result.success ? 200 : 500 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ==================== UNREAD STATS ====================

export async function handleUnreadStats(): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;

    const result = await announcementService.getUnreadStats(auth.session.sub);
    return Response.json(result, { status: result.success ? 200 : 500 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ==================== RECENT UNREAD (for dropdown) ====================

export async function handleRecentUnread(): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;

    const result = await announcementService.getRecentUnread(auth.session.sub);
    return Response.json(result, { status: result.success ? 200 : 500 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ==================== READ STATUS ====================

export async function handleMarkAsRead(_request: Request, id: string): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;

    const result = await announcementService.markAsRead(id, auth.session.sub);
    return Response.json(result, { status: result.success ? 200 : 400 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function handleMarkAllAsRead(): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;

    const result = await announcementService.markAllAsRead(auth.session.sub);
    return Response.json(result, { status: result.success ? 200 : 400 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
