/**
 * @file Employee controller — bridge between API routes and employee service.
 * Handles: authentication, authorization, request parsing, Zod validation,
 *          input sanitization, and response formatting.
 * NO business logic — delegates everything to the service layer.
 *
 * Design decisions:
 * - No DELETE endpoint — employees are deactivated/terminated via PATCH status change.
 * - Password is auto-generated on create — never accepted from client.
 * - Status changes require a reason for audit trail.
 */

import 'server-only';
import * as employeeService from '@/services/employees/employee.service';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  changeEmployeeStatusSchema,
  employeeQuerySchema,
} from '@/schemas/employee.schema';
import { requireAuth } from '@/security/middleware/auth.middleware';
import { apiPermissionGuard } from '@/security/rbac/permission.guard';
import { containsXss } from '@/security/validation/xss-protection';
import { Permission } from '@/types/auth.types';

// ==================== LIST ====================

/**
 * Handle GET /api/employees — list employees with filters.
 */
export async function handleListEmployees(request: Request): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.VIEW_ALL_EMPLOYEES);
    if (guard) return guard;

    const url = new URL(request.url);
    const rawParams = Object.fromEntries(url.searchParams);
    const validation = employeeQuerySchema.safeParse(rawParams);

    if (!validation.success) {
      return Response.json(
        { success: false, error: 'Invalid query parameters', data: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await employeeService.listEmployees(validation.data);
    return Response.json(result, { status: result.success ? 200 : 500 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ==================== GET ====================

/**
 * Handle GET /api/employees/:id — get single employee.
 */
export async function handleGetEmployee(
  _request: Request,
  id: string
): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.VIEW_ALL_EMPLOYEES);
    if (guard) return guard;

    const result = await employeeService.getEmployee(id);
    return Response.json(result, { status: result.success ? 200 : 404 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ==================== CREATE ====================

/**
 * Handle POST /api/employees — create new employee.
 * Password is auto-generated and returned once in the response.
 */
export async function handleCreateEmployee(request: Request): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.APPROVE_NEW_EMPLOYEE);
    if (guard) return guard;

    const body = await request.json();

    // XSS check on string values
    const strings = Object.values(body).filter((v): v is string => typeof v === 'string');
    if (strings.some(containsXss)) {
      return Response.json({ success: false, error: 'Invalid input detected' }, { status: 400 });
    }

    // Validate (password is NOT in the schema — it's auto-generated)
    const validation = createEmployeeSchema.safeParse(body);
    if (!validation.success) {
      return Response.json(
        { success: false, error: 'Validation failed', data: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await employeeService.createEmployee(validation.data);
    return Response.json(result, { status: result.success ? 201 : 400 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ==================== UPDATE ====================

/**
 * Handle PUT /api/employees/:id — update employee profile.
 * Does NOT handle status changes — use PATCH for that.
 */
export async function handleUpdateEmployee(
  request: Request,
  id: string
): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.APPROVE_NEW_EMPLOYEE);
    if (guard) return guard;

    const body = await request.json();

    // XSS check
    const strings = Object.values(body).filter((v): v is string => typeof v === 'string');
    if (strings.some(containsXss)) {
      return Response.json({ success: false, error: 'Invalid input detected' }, { status: 400 });
    }

    const validation = updateEmployeeSchema.safeParse(body);
    if (!validation.success) {
      return Response.json(
        { success: false, error: 'Validation failed', data: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await employeeService.updateEmployee(id, validation.data);
    return Response.json(result, { status: result.success ? 200 : 400 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ==================== CHANGE STATUS ====================

/**
 * Handle PATCH /api/employees/:id — change employee status.
 * Replaces the DELETE operation — employees are never removed.
 * Requires a reason for audit trail.
 */
export async function handleChangeStatus(
  request: Request,
  id: string
): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.APPROVE_NEW_EMPLOYEE);
    if (guard) return guard;

    // Safety: prevent self-deactivation
    if (auth.session.sub === id) {
      return Response.json(
        { success: false, error: 'You cannot change your own status' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // XSS check
    const strings = Object.values(body).filter((v): v is string => typeof v === 'string');
    if (strings.some(containsXss)) {
      return Response.json({ success: false, error: 'Invalid input detected' }, { status: 400 });
    }

    const validation = changeEmployeeStatusSchema.safeParse(body);
    if (!validation.success) {
      return Response.json(
        { success: false, error: 'Validation failed', data: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await employeeService.changeEmployeeStatus(id, validation.data);
    return Response.json(result, { status: result.success ? 200 : 400 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ==================== DEPARTMENTS ====================

/**
 * Handle GET /api/departments — list departments for dropdowns.
 */
export async function handleListDepartments(): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;

    const result = await employeeService.getDepartments();
    return Response.json(result, { status: result.success ? 200 : 500 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
