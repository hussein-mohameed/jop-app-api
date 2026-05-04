/**
 * @file Session history API route.
 * GET /api/sessions/history?from=...&to=... → Get session history
 */

import { handleGetSessionHistory } from '@/controllers/session.controller';

export async function GET(request: Request): Promise<Response> {
  return handleGetSessionHistory(request);
}
