/**
 * @file Leaves collection API route.
 * GET  /api/leaves → List leaves
 * POST /api/leaves → Request leave
 */

import { handleListLeaves, handleRequestLeave } from '@/controllers/leave.controller';

export async function GET(request: Request): Promise<Response> {
  return handleListLeaves(request);
}

export async function POST(request: Request): Promise<Response> {
  return handleRequestLeave(request);
}
