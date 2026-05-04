/**
 * @file Job applications API route.
 * GET  /api/jobs/:id/applications → List applications for a job
 * POST /api/jobs/:id/applications → Submit application (public)
 */

import { handleListApplications, handleCreateApplication } from '@/controllers/job.controller';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  return handleListApplications(request, id);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  return handleCreateApplication(request, id);
}
