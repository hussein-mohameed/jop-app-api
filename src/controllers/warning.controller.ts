/**
 * @file Warning controller — employee discipline endpoints.
 */

import 'server-only';
import * as warningService from '@/services/warnings/warning.service';
import { issueWarningSchema, updateWarningSchema, warningQuerySchema } from '@/schemas/warning.schema';
import { requireAuth } from '@/security/middleware/auth.middleware';
import { apiPermissionGuard } from '@/security/rbac/permission.guard';
import { containsXss } from '@/security/validation/xss-protection';
import { Permission } from '@/types/auth.types';

// ==================== LIST ====================

export async function handleListWarnings(request: Request): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.VIEW_WARNINGS);
    if (guard) return guard;

    const url = new URL(request.url);
    const rawParams = Object.fromEntries(url.searchParams);
    const validation = warningQuerySchema.safeParse(rawParams);
    if (!validation.success) {
      return Response.json(
        { success: false, error: 'Invalid query', data: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await warningService.listWarnings(
      { employeeId: validation.data.employeeId, status: validation.data.status as import('@prisma/client').WarningStatus | undefined },
      validation.data.page,
      validation.data.pageSize
    );
    return Response.json(result, { status: result.success ? 200 : 500 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ==================== ISSUE ====================

export async function handleIssueWarning(request: Request): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.ISSUE_WARNING);
    if (guard) return guard;

    const body = await request.json();
    const strings = Object.values(body).filter((v): v is string => typeof v === 'string');
    if (strings.some(containsXss)) {
      return Response.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    const validation = issueWarningSchema.safeParse(body);
    if (!validation.success) {
      return Response.json(
        { success: false, error: 'Validation failed', data: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await warningService.issueWarning(
      auth.session.sub,
      validation.data.employeeId,
      validation.data.reason,
      validation.data.description
    );
    return Response.json(result, { status: result.success ? 201 : 400 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ==================== UPDATE STATUS ====================

export async function handleUpdateWarning(request: Request, id: string): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.ISSUE_WARNING);
    if (guard) return guard;

    const body = await request.json();
    const validation = updateWarningSchema.safeParse(body);
    if (!validation.success) {
      return Response.json(
        { success: false, error: 'Validation failed', data: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await warningService.updateWarningStatus(
      id, validation.data.status, validation.data.appealNotes
    );
    return Response.json(result, { status: result.success ? 200 : 400 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
