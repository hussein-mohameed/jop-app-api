/**
 * @file Payroll run API route.
 * POST /api/payroll/run → Run payroll for a month/year
 */

import { handleRunPayroll } from '@/controllers/payroll.controller';

export async function POST(request: Request): Promise<Response> {
  return handleRunPayroll(request);
}
