/**
 * @file Payroll controller — bridge between API routes and payroll service.
 * NO business logic — delegates everything to the service layer.
 */

import 'server-only';
import * as payrollService from '@/services/payroll/payroll.service';
import {
  createSalarySchema, updateSalarySchema, runPayrollSchema,
  salaryQuerySchema, payslipQuerySchema,
} from '@/schemas/payroll.schema';
import { requireAuth } from '@/security/middleware/auth.middleware';
import { apiPermissionGuard } from '@/security/rbac/permission.guard';
import { containsXss } from '@/security/validation/xss-protection';
import { Permission } from '@/types/auth.types';

// ==================== SALARIES ====================

export async function handleListSalaries(request: Request): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.VIEW_ALL_SALARIES);
    if (guard) return guard;

    const url = new URL(request.url);
    const validation = salaryQuerySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!validation.success) {
      return Response.json({ success: false, error: 'Invalid query', data: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const result = await payrollService.listSalaries(validation.data);
    return Response.json(result, { status: result.success ? 200 : 500 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function handleCreateSalary(request: Request): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.MANAGE_ALL_SALARIES);
    if (guard) return guard;

    const body = await request.json();
    const strings = Object.values(body).filter((v): v is string => typeof v === 'string');
    if (strings.some(containsXss)) {
      return Response.json({ success: false, error: 'Invalid input detected' }, { status: 400 });
    }

    const validation = createSalarySchema.safeParse(body);
    if (!validation.success) {
      return Response.json({ success: false, error: 'Validation failed', data: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const result = await payrollService.createSalary(validation.data);
    return Response.json(result, { status: result.success ? 201 : 400 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function handleUpdateSalary(request: Request, id: string): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.MANAGE_ALL_SALARIES);
    if (guard) return guard;

    const body = await request.json();
    const strings = Object.values(body).filter((v): v is string => typeof v === 'string');
    if (strings.some(containsXss)) {
      return Response.json({ success: false, error: 'Invalid input detected' }, { status: 400 });
    }

    const validation = updateSalarySchema.safeParse(body);
    if (!validation.success) {
      return Response.json({ success: false, error: 'Validation failed', data: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const result = await payrollService.updateSalary(id, validation.data);
    return Response.json(result, { status: result.success ? 200 : 400 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ==================== PAYSLIPS ====================

export async function handleListPayslips(request: Request): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.VIEW_PAYROLL);
    if (guard) return guard;

    const url = new URL(request.url);
    const validation = payslipQuerySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!validation.success) {
      return Response.json({ success: false, error: 'Invalid query', data: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const result = await payrollService.listPayslips(validation.data);
    return Response.json(result, { status: result.success ? 200 : 500 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function handleGetPayslip(_request: Request, id: string): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.VIEW_PAYROLL);
    if (guard) return guard;

    const result = await payrollService.getPayslip(id);
    return Response.json(result, { status: result.success ? 200 : 404 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ==================== PAYROLL RUN ====================

export async function handleRunPayroll(request: Request): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.MANAGE_PAYROLL);
    if (guard) return guard;

    const body = await request.json();
    const validation = runPayrollSchema.safeParse(body);
    if (!validation.success) {
      return Response.json({ success: false, error: 'Validation failed', data: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const result = await payrollService.runPayroll(validation.data);
    return Response.json(result, { status: result.success ? 200 : 400 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
