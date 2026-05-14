/**
 * @file Career current record API route.
 * GET /api/career/:employeeId/current → Get active career record
 */

import { handleGetCurrentRecord } from '@/controllers/careerRecord.controller';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ employeeId: string }> }
): Promise<Response> {
  const { employeeId } = await params;
  return handleGetCurrentRecord(request, employeeId);
}
