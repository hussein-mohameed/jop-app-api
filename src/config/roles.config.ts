/**
 * @file Role-based access control configuration.
 * Defines the complete permission matrix for all roles.
 */

import { Role, Permission } from '@/types/auth.types';

/** Complete permission mapping per role */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.EMPLOYEE]: [
    Permission.VIEW_OWN_PROFILE,
    Permission.EDIT_OWN_PROFILE,
    Permission.VIEW_OWN_SALARY,
    Permission.REQUEST_LEAVE,
    // POST_JOB is granted individually via hasJobPostingPermission flag
  ],

  [Role.MANAGER]: [
    Permission.VIEW_OWN_PROFILE,
    Permission.EDIT_OWN_PROFILE,
    Permission.VIEW_OWN_SALARY,
    Permission.REQUEST_LEAVE,
    Permission.APPROVE_DEPT_LEAVES,
    Permission.VIEW_DEPT_EMPLOYEES,
    Permission.REQUEST_NEW_EMPLOYEE,
    Permission.SUGGEST_BONUS,
    Permission.POST_JOB,
    Permission.VIEW_DEPT_REPORTS,
    Permission.MANAGE_WORK_SCHEDULES,
    Permission.VIEW_CAREER_HISTORY,
    Permission.MANAGE_CAREER_RECORDS,
  ],

  [Role.HR_STAFF]: [
    Permission.VIEW_OWN_PROFILE,
    Permission.EDIT_OWN_PROFILE,
    Permission.VIEW_OWN_SALARY,
    Permission.REQUEST_LEAVE,
    Permission.VIEW_ALL_EMPLOYEES,
    Permission.REQUEST_NEW_EMPLOYEE,
    Permission.APPROVE_NEW_EMPLOYEE,
    Permission.VIEW_ALL_SALARIES,
    Permission.MANAGE_ALL_SALARIES,
    Permission.MANAGE_PAYROLL,
    Permission.VIEW_PAYROLL,
    Permission.SUGGEST_BONUS,
    Permission.POST_JOB,
    Permission.VIEW_ALL_LEAVES,
    Permission.VIEW_ALL_REPORTS,
  ],

  [Role.HR_MANAGER]: [
    Permission.VIEW_OWN_PROFILE,
    Permission.EDIT_OWN_PROFILE,
    Permission.VIEW_OWN_SALARY,
    Permission.REQUEST_LEAVE,
    Permission.VIEW_ALL_EMPLOYEES,
    Permission.REQUEST_NEW_EMPLOYEE,
    Permission.APPROVE_NEW_EMPLOYEE,
    Permission.VIEW_ALL_SALARIES,
    Permission.MANAGE_ALL_SALARIES,
    Permission.MANAGE_PAYROLL,
    Permission.VIEW_PAYROLL,
    Permission.SUGGEST_BONUS,
    Permission.POST_JOB,
    Permission.APPROVE_JOB_POSTING,
    Permission.VIEW_ALL_LEAVES,
    Permission.VIEW_ALL_REPORTS,
    Permission.VIEW_CAREER_HISTORY,
    Permission.MANAGE_CAREER_RECORDS,
    // MANAGE_WORK_SCHEDULES granted individually via hasSchedulePermission flag
  ],

  [Role.COMPANY_ADMIN]: [
    Permission.VIEW_OWN_PROFILE,
    Permission.EDIT_OWN_PROFILE,
    Permission.VIEW_OWN_SALARY,
    Permission.REQUEST_LEAVE,
    Permission.APPROVE_DEPT_LEAVES,
    Permission.VIEW_ALL_EMPLOYEES,
    Permission.REQUEST_NEW_EMPLOYEE,
    Permission.APPROVE_NEW_EMPLOYEE,
    Permission.VIEW_ALL_SALARIES,
    Permission.VIEW_PAYROLL,
    Permission.APPROVE_BONUS,
    Permission.SUGGEST_BONUS,
    Permission.POST_JOB,
    Permission.APPROVE_JOB_POSTING,
    Permission.MANAGE_DEPARTMENTS,
    Permission.VIEW_ALL_REPORTS,
    Permission.MANAGE_ROLES,
    Permission.VIEW_AUDIT_LOGS,
    Permission.MANAGE_SETTINGS,
    Permission.MANAGE_WORK_SCHEDULES,
    Permission.VIEW_CAREER_HISTORY,
    Permission.MANAGE_CAREER_RECORDS,
  ],
} as const;

/** Dashboard route per role */
export const ROLE_DASHBOARD_ROUTES: Record<Role, string> = {
  [Role.EMPLOYEE]: '/employee',
  [Role.MANAGER]: '/manager',
  [Role.HR_STAFF]: '/hr',
  [Role.HR_MANAGER]: '/hr',
  [Role.COMPANY_ADMIN]: '/admin',
} as const;

/** Human-readable role labels */
export const ROLE_LABELS: Record<Role, string> = {
  [Role.EMPLOYEE]: 'Employee',
  [Role.MANAGER]: 'Manager',
  [Role.HR_STAFF]: 'HR Staff',
  [Role.HR_MANAGER]: 'HR Manager',
  [Role.COMPANY_ADMIN]: 'Company Admin',
} as const;
