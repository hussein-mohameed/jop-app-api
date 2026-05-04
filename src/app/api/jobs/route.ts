/**
 * @file Jobs collection API route.
 * GET  /api/jobs → List jobs
 * POST /api/jobs → Create job posting
 */

import { handleListJobs, handleCreateJob } from '@/controllers/job.controller';

export async function GET(request: Request): Promise<Response> {
  return handleListJobs(request);
}

export async function POST(request: Request): Promise<Response> {
  return handleCreateJob(request);
}
