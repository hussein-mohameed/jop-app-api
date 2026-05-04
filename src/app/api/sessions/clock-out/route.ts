/**
 * @file Clock out API route.
 * POST /api/sessions/clock-out → End work session
 */

import { handleClockOut } from '@/controllers/session.controller';

export async function POST(): Promise<Response> {
  return handleClockOut();
}
