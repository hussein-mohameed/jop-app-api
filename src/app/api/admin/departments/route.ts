/**
 * @file Admin departments API route.
 * GET  /api/admin/departments       → List all departments
 * POST /api/admin/departments       → Create department
 */

import {
  handleListDepartments,
  handleCreateDepartment,
} from '@/controllers/department.controller';

export async function GET(request: Request): Promise<Response> {
  return handleListDepartments(request);
}

export async function POST(request: Request): Promise<Response> {
  return handleCreateDepartment(request);
}
