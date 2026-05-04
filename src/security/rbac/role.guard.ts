/**
 * @file Role-based access control guard.
 * Middleware factory to restrict route access by role.
 */

import 'server-only';
import { Role, ROLE_HIERARCHY } from '@/types/auth.types';
import type { JwtPayload } from '@/types/auth.types';

/**
 * Check if a user has the required role or higher.
 */
export function hasRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if a user has any of the required roles.
 */
export function hasAnyRole(userRole: Role, roles: Role[]): boolean {
  return roles.some((role) => userRole === role);
}

/**
 * Guard function that throws if user doesn't have required role.
 */
export function requireRole(
  session: JwtPayload | null,
  requiredRole: Role
): asserts session is JwtPayload {
  if (!session) {
    throw new Error('Authentication required');
  }

  if (!hasRole(session.role, requiredRole)) {
    throw new Error(
      `Access denied. Required role: ${requiredRole}, current: ${session.role}`
    );
  }
}

/**
 * Guard function that throws if user doesn't have any of the required roles.
 */
export function requireAnyRole(
  session: JwtPayload | null,
  roles: Role[]
): asserts session is JwtPayload {
  if (!session) {
    throw new Error('Authentication required');
  }

  if (!hasAnyRole(session.role, roles)) {
    throw new Error(
      `Access denied. Required roles: ${roles.join(', ')}, current: ${session.role}`
    );
  }
}

/**
 * Create a role guard for API routes.
 * Returns a Response if access denied, null if allowed.
 */
export function apiRoleGuard(
  session: JwtPayload | null,
  requiredRole: Role
): Response | null {
  if (!session) {
    return Response.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  if (!hasRole(session.role, requiredRole)) {
    return Response.json(
      { success: false, error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  return null;
}
