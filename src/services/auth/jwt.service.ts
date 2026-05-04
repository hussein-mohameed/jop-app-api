/**
 * @file JWT service — bridge between security layer and business logic.
 */

import 'server-only';
import { createToken, verifyToken } from '@/security/auth/jwt.security';
import type { JwtPayload, Role, Permission } from '@/types/auth.types';

/**
 * Generate a JWT token for a user.
 */
export async function generateToken(data: {
  userId: string;
  email: string;
  role: Role;
  departmentId?: string;
  permissions: Permission[];
}): Promise<string> {
  return createToken({
    sub: data.userId,
    email: data.email,
    role: data.role,
    departmentId: data.departmentId,
    permissions: data.permissions,
  });
}

/**
 * Validate a JWT token and return the payload.
 */
export async function validateToken(
  token: string
): Promise<JwtPayload | null> {
  return verifyToken(token);
}
