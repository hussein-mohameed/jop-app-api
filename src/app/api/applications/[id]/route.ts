/**
 * @file Application review API route.
 * PATCH /api/applications/:id → Review application status
 */

import { handleReviewApplication } from '@/controllers/job.controller';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  return handleReviewApplication(request, id);
}
