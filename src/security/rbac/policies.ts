/**
 * @file RBAC policies.
 * Defines resource-specific access policies that combine role + permission checks.
 */

import type { JwtPayload } from '@/types/auth.types';
import { Role, Permission } from '@/types/auth.types';
import { hasRole, hasAnyRole } from './role.guard';
import { hasPermission } from './permission.guard';

/**
 * Can the user view a specific employee's data?
 */
export function canViewEmployee(
  session: JwtPayload,
  employeeDepartmentId: string
): boolean {
  // Everyone can view their own profile (handled elsewhere)
  if (hasPermission(session, Permission.VIEW_ALL_EMPLOYEES)) return true;
  if (
    hasPermission(session, Permission.VIEW_DEPT_EMPLOYEES) &&
    session.departmentId === employeeDepartmentId
  ) {
    return true;
  }
  return false;
}

/**
 * Can the user approve leave requests?
 */
export function canApproveLeave(
  session: JwtPayload,
  leaveDepartmentId: string
): boolean {
  // Managers can approve their department's leaves
  if (
    session.role === Role.MANAGER &&
    session.departmentId === leaveDepartmentId
  ) {
    return true;
  }
  // Company admin can approve any
  if (session.role === Role.COMPANY_ADMIN) return true;
  return false;
}

/**
 * Can the user manage salary records?
 */
export function canManageSalaries(session: JwtPayload): boolean {
  return hasPermission(session, Permission.MANAGE_ALL_SALARIES);
}

/**
 * Can the user view salary records?
 */
export function canViewSalaries(session: JwtPayload): boolean {
  return hasPermission(session, Permission.VIEW_ALL_SALARIES);
}

/**
 * Can the user approve bonuses?
 */
export function canApproveBonus(session: JwtPayload): boolean {
  return session.role === Role.COMPANY_ADMIN;
}

/**
 * Can the user post a job?
 */
export function canPostJob(
  session: JwtPayload,
  hasJobPostingFlag: boolean
): boolean {
  if (hasRole(session.role, Role.MANAGER)) return true;
  if (session.role === Role.EMPLOYEE && hasJobPostingFlag) return true;
  return false;
}

/**
 * Can the user manage departments?
 */
export function canManageDepartments(session: JwtPayload): boolean {
  return session.role === Role.COMPANY_ADMIN;
}

/**
 * Can the user send announcements?
 * MANAGER, HR_MANAGER, and COMPANY_ADMIN can send announcements.
 */
export function canSendAnnouncement(session: JwtPayload): boolean {
  return hasAnyRole(session.role, [Role.MANAGER, Role.HR_MANAGER, Role.COMPANY_ADMIN]);
}

/**
 * Can the user send announcements to ALL employees?
 * Only COMPANY_ADMIN can target all employees.
 */
export function canSendToAllEmployees(session: JwtPayload): boolean {
  return session.role === Role.COMPANY_ADMIN;
}
