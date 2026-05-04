/**
 * @file Department break policy API route.
 * GET /api/departments/[id]/break-policy → Get policy
 * PUT /api/departments/[id]/break-policy → Set/update policy
 */

import { handleGetBreakPolicy, handleUpsertBreakPolicy } from '@/controllers/breakPolicy.controller';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  return handleGetBreakPolicy(request, id);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  return handleUpsertBreakPolicy(request, id);
}
