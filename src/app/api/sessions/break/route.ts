/**
 * @file Break API route.
 * POST /api/sessions/break → Start a break
 */

import { handleStartBreak } from '@/controllers/session.controller';

export async function POST(request: Request): Promise<Response> {
  return handleStartBreak(request);
}
