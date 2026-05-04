/**
 * @file Single employee API route.
 * GET   /api/employees/:id → Get employee details
 * PUT   /api/employees/:id → Update employee profile
 * PATCH /api/employees/:id → Change employee status (activate, deactivate, terminate)
 *
 * Note: No DELETE — employees are never removed. Use PATCH to change status instead.
 */

import {
  handleGetEmployee,
  handleUpdateEmployee,
  handleChangeStatus,
} from '@/controllers/employee.controller';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  return handleGetEmployee(request, id);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  return handleUpdateEmployee(request, id);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  return handleChangeStatus(request, id);
}
