/**
 * @file Register API route handler.
 */

import { handleRegister } from '@/controllers/auth.controller';

export async function POST(request: Request): Promise<Response> {
  return handleRegister(request);
}
