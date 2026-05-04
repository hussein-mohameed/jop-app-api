/**
 * @file Single job API route.
 * GET   /api/jobs/:id → Get job details
 * PUT   /api/jobs/:id → Update job (draft only)
 * PATCH /api/jobs/:id → Review job (status transition)
 */

import { handleGetJob, handleUpdateJob, handleReviewJob } from '@/controllers/job.controller';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  return handleGetJob(request, id);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  return handleUpdateJob(request, id);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  return handleReviewJob(request, id);
}
