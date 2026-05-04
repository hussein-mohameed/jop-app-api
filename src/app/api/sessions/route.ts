/**
 * @file Sessions collection API route.
 * GET  /api/sessions → Get today's session
 * POST /api/sessions → Clock in
 */

import { handleGetTodaySession, handleClockIn } from '@/controllers/session.controller';

export async function GET(): Promise<Response> {
  return handleGetTodaySession();
}

export async function POST(request: Request): Promise<Response> {
  return handleClockIn(request);
}
