/**
 * @file Login API route handler.
 */

import { handleLogin } from '@/controllers/auth.controller';

export async function POST(request: Request): Promise<Response> {
  return handleLogin(request);
}
