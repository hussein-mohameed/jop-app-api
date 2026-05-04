/**
 * @file Single bonus API route.
 * PATCH /api/bonuses/:id → Review (approve/reject) bonus
 */

import { handleReviewBonus } from '@/controllers/bonus.controller';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  return handleReviewBonus(request, id);
}
