/**
 * @file Work schedule controller — manages employee work schedule endpoints.
 *
 * Authorization:
 * - GET schedule: any authenticated user (own schedule)
 * - SET/RESET schedule: MANAGER (own dept), HR with hasSchedulePermission, COMPANY_ADMIN
 * - UPDATE defaults: COMPANY_ADMIN only (via settings API)
 */

import 'server-only';
import * as workScheduleService from '@/services/schedules/workSchedule.service';
import { setEmployeeScheduleSchema } from '@/schemas/workSchedule.schema';
import { requireAuth } from '@/security/middleware/auth.middleware';
import { apiPermissionGuard } from '@/security/rbac/permission.guard';
import { containsXss } from '@/security/validation/xss-protection';
import { Permission } from '@/types/auth.types';

// ==================== GET SCHEDULE ====================

/**
 * Handle GET /api/schedules/:employeeId — get employee's effective schedule.
 */
export async function handleGetSchedule(
  _request: Request,
  employeeId: string
): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;

    const result = await workScheduleService.getEmployeeSchedule(employeeId);
    return Response.json(result, { status: result.success ? 200 : 500 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ==================== SET CUSTOM SCHEDULE ====================

/**
 * Handle PUT /api/schedules/:employeeId — set a custom work schedule.
 * Requires MANAGE_WORK_SCHEDULES permission.
 */
export async function handleSetSchedule(
  request: Request,
  employeeId: string
): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.MANAGE_WORK_SCHEDULES);
    if (guard) return guard;

    const body = await request.json();

    // XSS check on string values
    const strings = Object.values(body).filter((v): v is string => typeof v === 'string');
    if (strings.some(containsXss)) {
      return Response.json({ success: false, error: 'Invalid input detected' }, { status: 400 });
    }

    const validation = setEmployeeScheduleSchema.safeParse({ ...body, employeeId });
    if (!validation.success) {
      return Response.json(
        { success: false, error: 'Validation failed', data: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await workScheduleService.setEmployeeSchedule(
      employeeId,
      {
        workStartTime: validation.data.workStartTime,
        workEndTime: validation.data.workEndTime,
        workDays: validation.data.workDays,
      },
      auth.session.sub
    );

    return Response.json(result, { status: result.success ? 200 : 400 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ==================== RESET TO DEFAULT ====================

/**
 * Handle DELETE /api/schedules/:employeeId — reset employee to company defaults.
 * Requires MANAGE_WORK_SCHEDULES permission.
 */
export async function handleResetSchedule(
  _request: Request,
  employeeId: string
): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.MANAGE_WORK_SCHEDULES);
    if (guard) return guard;

    const result = await workScheduleService.resetToDefault(employeeId);
    return Response.json(result, { status: result.success ? 200 : 400 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
