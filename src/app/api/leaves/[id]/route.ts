/**
 * @file Single leave API route.
 * GET   /api/leaves/:id → Get leave details
 * PATCH /api/leaves/:id → Review (approve/reject) leave
 */

import { handleGetLeave, handleReviewLeave } from '@/controllers/leave.controller';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  return handleGetLeave(request, id);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  return handleReviewLeave(request, id);
}
