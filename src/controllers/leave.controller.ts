/**
 * @file Leave controller — bridge between API routes and leave service.
 * Handles: authentication, authorization, request parsing, Zod validation,
 * input sanitization, and response formatting.
 * NO business logic — delegates everything to the service layer.
 */

import 'server-only';
import * as leaveService from '@/services/leaves/leave.service';
import { requestLeaveSchema, reviewLeaveSchema, leaveQuerySchema } from '@/schemas/leave.schema';
import { requireAuth } from '@/security/middleware/auth.middleware';
import { apiPermissionGuard } from '@/security/rbac/permission.guard';
import { containsXss } from '@/security/validation/xss-protection';
import { Permission } from '@/types/auth.types';

// ==================== LIST ====================

export async function handleListLeaves(request: Request): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.VIEW_ALL_LEAVES);
    if (guard) return guard;

    const url = new URL(request.url);
    const rawParams = Object.fromEntries(url.searchParams);
    const validation = leaveQuerySchema.safeParse(rawParams);

    if (!validation.success) {
      return Response.json(
        { success: false, error: 'Invalid query parameters', data: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await leaveService.listLeaves(validation.data);
    return Response.json(result, { status: result.success ? 200 : 500 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ==================== GET ====================

export async function handleGetLeave(_request: Request, id: string): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;

    const result = await leaveService.getLeave(id);
    return Response.json(result, { status: result.success ? 200 : 404 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ==================== REQUEST LEAVE ====================

export async function handleRequestLeave(request: Request): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.REQUEST_LEAVE);
    if (guard) return guard;

    const body = await request.json();

    const strings = Object.values(body).filter((v): v is string => typeof v === 'string');
    if (strings.some(containsXss)) {
      return Response.json({ success: false, error: 'Invalid input detected' }, { status: 400 });
    }

    const validation = requestLeaveSchema.safeParse(body);
    if (!validation.success) {
      return Response.json(
        { success: false, error: 'Validation failed', data: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await leaveService.requestLeave(auth.session.sub, validation.data);
    return Response.json(result, { status: result.success ? 201 : 400 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ==================== REVIEW LEAVE ====================

export async function handleReviewLeave(request: Request, id: string): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.APPROVE_DEPT_LEAVES);
    if (guard) return guard;

    const body = await request.json();

    const strings = Object.values(body).filter((v): v is string => typeof v === 'string');
    if (strings.some(containsXss)) {
      return Response.json({ success: false, error: 'Invalid input detected' }, { status: 400 });
    }

    const validation = reviewLeaveSchema.safeParse(body);
    if (!validation.success) {
      return Response.json(
        { success: false, error: 'Validation failed', data: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await leaveService.reviewLeave(
      id, auth.session.sub, validation.data.status, validation.data.approvalNotes || undefined
    );
    return Response.json(result, { status: result.success ? 200 : 400 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ==================== LEAVE TYPES ====================

export async function handleListLeaveTypes(): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;

    const result = await leaveService.getLeaveTypes();
    return Response.json(result, { status: result.success ? 200 : 500 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
