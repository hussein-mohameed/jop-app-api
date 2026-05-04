/**
 * @file Payslips collection API route.
 * GET /api/payslips → List payslips
 */

import { handleListPayslips } from '@/controllers/payroll.controller';

export async function GET(request: Request): Promise<Response> {
  return handleListPayslips(request);
}
