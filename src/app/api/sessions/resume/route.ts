/**
 * @file Resume work API route.
 * POST /api/sessions/resume → Resume work after break
 */

import { handleResumeWork } from '@/controllers/session.controller';

export async function POST(): Promise<Response> {
  return handleResumeWork();
}
