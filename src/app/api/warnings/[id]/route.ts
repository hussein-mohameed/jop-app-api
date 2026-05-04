/**
 * @file Warning by ID API route.
 * PATCH /api/warnings/[id] → Update warning status
 */

import { handleUpdateWarning } from '@/controllers/warning.controller';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  return handleUpdateWarning(request, id);
}
