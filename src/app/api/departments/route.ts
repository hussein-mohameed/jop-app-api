/**
 * @file Departments API route (for dropdowns).
 * GET /api/departments → List active departments
 */

import { handleListDepartments } from '@/controllers/employee.controller';

export async function GET(): Promise<Response> {
  return handleListDepartments();
}
