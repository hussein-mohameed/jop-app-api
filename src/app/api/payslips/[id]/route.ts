/**
 * @file Single payslip API route.
 * GET /api/payslips/:id → Get payslip details
 */

import { handleGetPayslip } from '@/controllers/payroll.controller';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  return handleGetPayslip(request, id);
}
