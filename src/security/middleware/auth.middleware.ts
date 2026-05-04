/**
 * @file Authentication middleware for API routes.
 * Extracts and verifies JWT from session cookie.
 */

import 'server-only';
import { getSession } from '@/security/auth/session.security';
import type { JwtPayload } from '@/types/auth.types';

/**
 * Authenticate the current request by reading the session cookie.
 * @returns JWT payload if authenticated, null otherwise
 */
export async function authenticate(): Promise<JwtPayload | null> {
  return getSession();
}

/**
 * Require authentication — returns the session or a 401 Response.
 */
export async function requireAuth(): Promise<
  { session: JwtPayload } | { response: Response }
> {
  const session = await authenticate();

  if (!session) {
    return {
      response: Response.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  return { session };
}

/**
 * Extract client IP address from request headers.
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

/**
 * Extract user agent from request headers.
 */
export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') ?? 'unknown';
}
