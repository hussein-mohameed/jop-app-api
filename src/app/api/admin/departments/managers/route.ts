/**
 * @file Admin departments managers route.
 * GET /api/admin/departments/managers → List potential managers
 */

import { handleListManagers } from '@/controllers/department.controller';

export async function GET(): Promise<Response> {
  return handleListManagers();
}
