/**
 * @file Session security — cookie-based stateless sessions.
 * Uses the Next.js cookies() API (async in Next.js 16+).
 */

import 'server-only';
import { cookies } from 'next/headers';
import { createToken, verifyToken } from './jwt.security';
import { AUTH } from '@/lib/constants';
import type { JwtPayload, SessionData } from '@/types/auth.types';
import type { Role, Permission } from '@/types/auth.types';

/**
 * Create a new session by setting an HttpOnly cookie with a JWT.
 */
export async function createSession(data: {
  userId: string;
  email: string;
  role: Role;
  departmentId?: string;
  permissions: Permission[];
}): Promise<void> {
  try {
    const token = await createToken({
      sub: data.userId,
      email: data.email,
      role: data.role,
      departmentId: data.departmentId,
      permissions: data.permissions,
    });

    const expiresAt = new Date(Date.now() + AUTH.TOKEN_EXPIRY_MS);
    const cookieStore = await cookies();

    cookieStore.set(AUTH.SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
    });
  } catch (error) {
    throw new Error(`Failed to create session: ${String(error)}`);
  }
}

/**
 * Get the current session from cookies.
 * @returns Session data or null if not authenticated
 */
export async function getSession(): Promise<JwtPayload | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(AUTH.SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) {
      return null;
    }

    return await verifyToken(sessionCookie.value);
  } catch {
    return null;
  }
}

/**
 * Delete the current session (logout).
 */
export async function deleteSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH.SESSION_COOKIE_NAME);
  } catch (error) {
    throw new Error(`Failed to delete session: ${String(error)}`);
  }
}

/**
 * Refresh the session with a new expiry.
 */
export async function refreshSession(): Promise<void> {
  try {
    const session = await getSession();
    if (!session) return;

    await createSession({
      userId: session.sub,
      email: session.email,
      role: session.role,
      departmentId: session.departmentId,
      permissions: session.permissions,
    });
  } catch (error) {
    throw new Error(`Failed to refresh session: ${String(error)}`);
  }
}

/**
 * Convert JWT payload to SessionData format.
 */
export function toSessionData(payload: JwtPayload): SessionData {
  return {
    userId: payload.sub,
    email: payload.email,
    role: payload.role,
    departmentId: payload.departmentId,
    expiresAt: new Date(payload.exp * 1000),
  };
}
