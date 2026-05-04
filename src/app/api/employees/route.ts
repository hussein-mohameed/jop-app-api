/**
 * @file Employees collection API route.
 * GET  /api/employees     → List employees
 * POST /api/employees     → Create employee
 */

import { handleListEmployees, handleCreateEmployee } from '@/controllers/employee.controller';

export async function GET(request: Request): Promise<Response> {
  return handleListEmployees(request);
}

export async function POST(request: Request): Promise<Response> {
  return handleCreateEmployee(request);
}
