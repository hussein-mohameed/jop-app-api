/**
 * @file Department controller — bridge between API routes and service layer.
 * Handles request parsing, auth guards, and response shaping.
 * NO business logic — delegates to department.service.
 */

import 'server-only';
import {
  listDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  toggleDepartmentStatus,
  getManagerOptions,
} from '@/services/departments/department.service';
import { requireAuth } from '@/security/middleware/auth.middleware';
import { apiPermissionGuard } from '@/security/rbac/permission.guard';
import { Permission } from '@/types/auth.types';
import { sanitizeObject } from '@/security/validation/input-sanitizer';

// ==================== HANDLERS ====================

/**
 * GET /api/admin/departments — List all departments.
 */
export async function handleListDepartments(
  request: Request
): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.MANAGE_DEPARTMENTS);
    if (guard) return guard;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') ?? undefined;
    const isActiveParam = searchParams.get('isActive');
    const isActive = isActiveParam === 'true' ? true : isActiveParam === 'false' ? false : undefined;

    const result = await listDepartments(search, isActive);
    return Response.json(result, { status: result.success ? 200 : 500 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/admin/departments/:id — Get single department.
 */
export async function handleGetDepartment(id: string): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.MANAGE_DEPARTMENTS);
    if (guard) return guard;

    const result = await getDepartment(id);
    return Response.json(result, { status: result.success ? 200 : 404 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/departments — Create department.
 */
export async function handleCreateDepartment(request: Request): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.MANAGE_DEPARTMENTS);
    if (guard) return guard;

    const body = await request.json();
    const sanitized = sanitizeInput(body);
    const result = await createDepartment(sanitized);

    return Response.json(result, { status: result.success ? 201 : 400 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/departments/:id — Update department.
 */
export async function handleUpdateDepartment(
  id: string,
  request: Request
): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.MANAGE_DEPARTMENTS);
    if (guard) return guard;

    const body = await request.json();
    const sanitized = sanitizeObject(body);
    const result = await updateDepartment(id, sanitized);

    return Response.json(result, { status: result.success ? 200 : 400 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/departments/:id — Toggle department status.
 */
export async function handleToggleDepartmentStatus(
  id: string,
  request: Request
): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.MANAGE_DEPARTMENTS);
    if (guard) return guard;

    const body = await request.json();
    const result = await toggleDepartmentStatus(id, body);

    return Response.json(result, { status: result.success ? 200 : 400 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/admin/departments/managers — Get potential managers.
 */
export async function handleListManagers(): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.MANAGE_DEPARTMENTS);
    if (guard) return guard;

    const result = await getManagerOptions();
    return Response.json(result, { status: result.success ? 200 : 500 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
