/**
 * @file Career API route — employee career history.
 * GET  /api/career/:employeeId → Get career history (or ?timeline=true for enriched)
 * POST /api/career/:employeeId → Create career record (promotion/transfer)
 */

import {
  handleGetCareerHistory,
  handleCreateCareerRecord,
} from '@/controllers/careerRecord.controller';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ employeeId: string }> }
): Promise<Response> {
  const { employeeId } = await params;
  return handleGetCareerHistory(request, employeeId);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ employeeId: string }> }
): Promise<Response> {
  const { employeeId } = await params;
  return handleCreateCareerRecord(request, employeeId);
}
