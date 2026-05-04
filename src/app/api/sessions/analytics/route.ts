/**
 * @file Session analytics API route.
 * GET /api/sessions/analytics?month=...&year=... → Monthly analytics
 */

import { handleGetAnalytics } from '@/controllers/session.controller';

export async function GET(request: Request): Promise<Response> {
  return handleGetAnalytics(request);
}
