/**
 * @file Permission service — resolves permissions for a given user.
 */

import 'server-only';
import { ROLE_PERMISSIONS } from '@/config/roles.config';
import type { Role, Permission } from '@/types/auth.types';

/**
 * Get all permissions for a role.
 */
export function getPermissionsForRole(role: Role): Permission[] {
  return [...(ROLE_PERMISSIONS[role] ?? [])];
}

/**
 * Check if a role has a specific permission.
 */
export function roleHasPermission(
  role: Role,
  permission: Permission
): boolean {
  const permissions = ROLE_PERMISSIONS[role] ?? [];
  return permissions.includes(permission);
}
