/**
 * @file Permission-based access control guard.
 * Fine-grained permission checking beyond role hierarchy.
 */

import 'server-only';
import type { Permission, JwtPayload } from '@/types/auth.types';

/**
 * Check if a user has a specific permission.
 */
export function hasPermission(
  session: JwtPayload | null,
  permission: Permission
): boolean {
  if (!session) return false;
  return session.permissions.includes(permission);
}

/**
 * Check if a user has ALL of the required permissions.
 */
export function hasAllPermissions(
  session: JwtPayload | null,
  permissions: Permission[]
): boolean {
  if (!session) return false;
  return permissions.every((p) => session.permissions.includes(p));
}

/**
 * Check if a user has ANY of the required permissions.
 */
export function hasAnyPermission(
  session: JwtPayload | null,
  permissions: Permission[]
): boolean {
  if (!session) return false;
  return permissions.some((p) => session.permissions.includes(p));
}

/**
 * Guard function that throws if user doesn't have the required permission.
 */
export function requirePermission(
  session: JwtPayload | null,
  permission: Permission
): asserts session is JwtPayload {
  if (!session) {
    throw new Error('Authentication required');
  }

  if (!hasPermission(session, permission)) {
    throw new Error(`Access denied. Required permission: ${permission}`);
  }
}

/**
 * Create a permission guard for API routes.
 * Returns a Response if access denied, null if allowed.
 */
export function apiPermissionGuard(
  session: JwtPayload | null,
  permission: Permission
): Response | null {
  if (!session) {
    return Response.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  if (!hasPermission(session, permission)) {
    return Response.json(
      { success: false, error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  return null;
}
