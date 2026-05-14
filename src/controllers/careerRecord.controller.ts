/**
 * @file Career record controller — manages career history endpoints.
 *
 * Authorization:
 * - GET history: any authenticated user (own history), MANAGER+ (any employee)
 * - POST record: MANAGER+, HR with permission, COMPANY_ADMIN
 */

import 'server-only';
import * as careerService from '@/services/career/careerRecord.service';
import { createCareerRecordSchema, careerHistoryQuerySchema } from '@/schemas/careerRecord.schema';
import { requireAuth } from '@/security/middleware/auth.middleware';
import { apiPermissionGuard } from '@/security/rbac/permission.guard';
import { containsXss } from '@/security/validation/xss-protection';
import { Permission } from '@/types/auth.types';

// ==================== GET CAREER HISTORY ====================

/**
 * Handle GET /api/career/:employeeId — get employee's career history.
 */
export async function handleGetCareerHistory(
  request: Request,
  employeeId: string
): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;

    const url = new URL(request.url);
    const rawParams = Object.fromEntries(url.searchParams);

    // Check for timeline mode (full enriched view)
    if (rawParams.timeline === 'true') {
      const result = await careerService.getFullCareerTimeline(employeeId);
      return Response.json(result, { status: result.success ? 200 : 500 });
    }

    const validation = careerHistoryQuerySchema.safeParse(rawParams);
    if (!validation.success) {
      return Response.json(
        { success: false, error: 'Invalid query', data: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await careerService.getCareerHistory(
      employeeId,
      validation.data.page,
      validation.data.pageSize
    );
    return Response.json(result, { status: result.success ? 200 : 500 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ==================== GET CURRENT RECORD ====================

/**
 * Handle GET /api/career/:employeeId/current — get active career record.
 */
export async function handleGetCurrentRecord(
  _request: Request,
  employeeId: string
): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;

    const result = await careerService.getCurrentRecord(employeeId);
    return Response.json(result, { status: result.success ? 200 : 500 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ==================== CREATE CAREER RECORD ====================

/**
 * Handle POST /api/career/:employeeId — manually create a career record.
 * Used for promotions, transfers, and role changes.
 * Requires MANAGE_CAREER_RECORDS permission.
 */
export async function handleCreateCareerRecord(
  request: Request,
  employeeId: string
): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.MANAGE_CAREER_RECORDS);
    if (guard) return guard;

    const body = await request.json();

    // XSS check
    const strings = Object.values(body).filter((v): v is string => typeof v === 'string');
    if (strings.some(containsXss)) {
      return Response.json({ success: false, error: 'Invalid input detected' }, { status: 400 });
    }

    const validation = createCareerRecordSchema.safeParse(body);
    if (!validation.success) {
      return Response.json(
        { success: false, error: 'Validation failed', data: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await careerService.createCareerRecord(
      employeeId,
      validation.data,
      auth.session.sub
    );
    return Response.json(result, { status: result.success ? 201 : 400 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
