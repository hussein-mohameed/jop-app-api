/**
 * @file Salaries collection API route.
 * GET  /api/salaries → List salaries
 * POST /api/salaries → Create salary
 */

import { handleListSalaries, handleCreateSalary } from '@/controllers/payroll.controller';

export async function GET(request: Request): Promise<Response> {
  return handleListSalaries(request);
}

export async function POST(request: Request): Promise<Response> {
  return handleCreateSalary(request);
}
