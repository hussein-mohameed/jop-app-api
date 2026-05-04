/**
 * @file Warnings collection API route.
 * GET  /api/warnings → List warnings
 * POST /api/warnings → Issue warning
 */

import { handleListWarnings, handleIssueWarning } from '@/controllers/warning.controller';

export async function GET(request: Request): Promise<Response> {
  return handleListWarnings(request);
}

export async function POST(request: Request): Promise<Response> {
  return handleIssueWarning(request);
}
