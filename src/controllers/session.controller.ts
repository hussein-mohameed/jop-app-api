/**
 * @file Session controller — work sessions, breaks, clock in/out.
 */

import 'server-only';
import * as sessionService from '@/services/sessions/session.service';
import { clockInSchema, startBreakSchema, sessionHistorySchema, sessionAnalyticsSchema } from '@/schemas/session.schema';
import { requireAuth } from '@/security/middleware/auth.middleware';
import { getClientIp } from '@/security/middleware/auth.middleware';
import { containsXss } from '@/security/validation/xss-protection';

// ==================== CLOCK IN ====================

export async function handleClockIn(request: Request): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;

    const body = await request.json().catch(() => ({}));
    const validation = clockInSchema.safeParse(body);
    if (!validation.success) {
      return Response.json(
        { success: false, error: 'Validation failed', data: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    if (validation.data.notes && containsXss(validation.data.notes)) {
      return Response.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    const ip = getClientIp(request);
    const result = await sessionService.clockIn(auth.session.sub, ip, validation.data.notes);
    return Response.json(result, { status: result.success ? 201 : 400 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ==================== CLOCK OUT ====================

export async function handleClockOut(): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;

    const result = await sessionService.clockOut(auth.session.sub);
    return Response.json(result, { status: result.success ? 200 : 400 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ==================== START BREAK ====================

export async function handleStartBreak(request: Request): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;

    const body = await request.json();
    const validation = startBreakSchema.safeParse(body);
    if (!validation.success) {
      return Response.json(
        { success: false, error: 'Validation failed', data: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await sessionService.startBreak(
      auth.session.sub,
      validation.data.type as import('@prisma/client').BreakType,
      validation.data.slotName
    );
    return Response.json(result, { status: result.success ? 200 : 400 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ==================== RESUME WORK ====================

export async function handleResumeWork(): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;

    const result = await sessionService.resumeWork(auth.session.sub);
    return Response.json(result, { status: result.success ? 200 : 400 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ==================== GET TODAY SESSION ====================

export async function handleGetTodaySession(): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;

    const result = await sessionService.getTodaySession(auth.session.sub);
    return Response.json(result, { status: result.success ? 200 : 500 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ==================== HISTORY ====================

export async function handleGetSessionHistory(request: Request): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;

    const url = new URL(request.url);
    const rawParams = Object.fromEntries(url.searchParams);
    const validation = sessionHistorySchema.safeParse(rawParams);
    if (!validation.success) {
      return Response.json(
        { success: false, error: 'Invalid query', data: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await sessionService.getSessionHistory(
      auth.session.sub, validation.data.from, validation.data.to
    );
    return Response.json(result, { status: result.success ? 200 : 500 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ==================== ANALYTICS ====================

export async function handleGetAnalytics(request: Request): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;

    const url = new URL(request.url);
    const rawParams = Object.fromEntries(url.searchParams);
    const validation = sessionAnalyticsSchema.safeParse(rawParams);
    if (!validation.success) {
      return Response.json(
        { success: false, error: 'Invalid query', data: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await sessionService.getAnalytics(
      auth.session.sub, validation.data.month, validation.data.year
    );
    return Response.json(result, { status: result.success ? 200 : 500 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
