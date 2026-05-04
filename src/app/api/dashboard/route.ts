/**
 * @file Dashboard API route.
 * GET /api/dashboard — fetches all admin dashboard metrics.
 */

import { getDashboardData } from '@/services/dashboard/dashboard.service';
import { requireAuth } from '@/security/middleware/auth.middleware';
import { apiPermissionGuard } from '@/security/rbac/permission.guard';
import { Permission } from '@/types/auth.types';

export async function GET(): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.VIEW_ALL_REPORTS);
    if (guard) return guard;

    const result = await getDashboardData();
    return Response.json(result, { status: result.success ? 200 : 500 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
