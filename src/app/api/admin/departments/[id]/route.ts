/**
 * @file Admin department detail API route.
 * GET   /api/admin/departments/:id  → Get single department
 * PUT   /api/admin/departments/:id  → Update department
 * PATCH /api/admin/departments/:id  → Toggle status
 */

import {
  handleGetDepartment,
  handleUpdateDepartment,
  handleToggleDepartmentStatus,
} from '@/controllers/department.controller';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params): Promise<Response> {
  const { id } = await params;
  return handleGetDepartment(id);
}

export async function PUT(request: Request, { params }: Params): Promise<Response> {
  const { id } = await params;
  return handleUpdateDepartment(id, request);
}

export async function PATCH(request: Request, { params }: Params): Promise<Response> {
  const { id } = await params;
  return handleToggleDepartmentStatus(id, request);
}
