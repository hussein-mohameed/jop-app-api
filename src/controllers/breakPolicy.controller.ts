/**
 * @file Break policy controller — department rest schedule endpoints.
 */

import 'server-only';
import * as breakPolicyService from '@/services/sessions/breakPolicy.service';
import { requireAuth } from '@/security/middleware/auth.middleware';
import { apiPermissionGuard } from '@/security/rbac/permission.guard';
import { Permission } from '@/types/auth.types';

export async function handleGetBreakPolicy(_request: Request, departmentId: string): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;

    const result = await breakPolicyService.getByDepartment(departmentId);
    return Response.json(result, { status: result.success ? 200 : 500 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function handleUpsertBreakPolicy(request: Request, departmentId: string): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.MANAGE_DEPARTMENTS);
    if (guard) return guard;

    const body = await request.json();
    const { mode, totalBreakMin = 60, slots = [] } = body;

    if (!mode || !['FIXED', 'FLEXIBLE', 'NONE'].includes(mode)) {
      return Response.json({ success: false, error: 'Invalid mode. Must be FIXED, FLEXIBLE, or NONE' }, { status: 400 });
    }

    const result = await breakPolicyService.upsertPolicy(departmentId, mode, totalBreakMin, slots);
    return Response.json(result, { status: result.success ? 200 : 400 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
