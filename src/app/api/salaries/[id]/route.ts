/**
 * @file Single salary API route.
 * PUT /api/salaries/:id → Update salary
 */

import { handleUpdateSalary } from '@/controllers/payroll.controller';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  return handleUpdateSalary(request, id);
}
