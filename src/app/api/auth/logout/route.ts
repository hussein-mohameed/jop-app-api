/**
 * @file Logout API route handler.
 */

import { handleLogout } from '@/controllers/auth.controller';

export async function POST(): Promise<Response> {
  return handleLogout();
}
