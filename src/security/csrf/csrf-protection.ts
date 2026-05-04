/**
 * @file CSRF protection.
 * Generates and validates CSRF tokens for mutation requests.
 */

import { cookies } from 'next/headers';

const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generate a cryptographically secure CSRF token.
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Buffer.from(array).toString('hex');
}

/**
 * Set a CSRF token cookie.
 */
export async function setCsrfCookie(): Promise<string> {
  const token = generateCsrfToken();
  const cookieStore = await cookies();

  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Must be readable by client JS
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60, // 1 hour
  });

  return token;
}

/**
 * Validate CSRF token from request headers against cookie.
 */
export async function validateCsrf(request: Request): Promise<boolean> {
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  if (!headerToken || !cookieToken) return false;
  return headerToken === cookieToken;
}
