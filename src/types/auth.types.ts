/**
 * @file Authentication and authorization type definitions.
 */

/** System roles ordered by hierarchy (lowest to highest) */
export enum Role {
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER',
  HR_STAFF = 'HR_STAFF',
  HR_MANAGER = 'HR_MANAGER',
  COMPANY_ADMIN = 'COMPANY_ADMIN',
}

/** Role hierarchy level (higher number = more authority) */
export const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.EMPLOYEE]: 1,
  [Role.MANAGER]: 2,
  [Role.HR_STAFF]: 3,
  [Role.HR_MANAGER]: 4,
  [Role.COMPANY_ADMIN]: 5,
} as const;

/** All available permissions in the system */
export enum Permission {
  // Profile
  VIEW_OWN_PROFILE = 'VIEW_OWN_PROFILE',
  EDIT_OWN_PROFILE = 'EDIT_OWN_PROFILE',
  VIEW_OWN_SALARY = 'VIEW_OWN_SALARY',

  // Employees
  VIEW_DEPT_EMPLOYEES = 'VIEW_DEPT_EMPLOYEES',
  VIEW_ALL_EMPLOYEES = 'VIEW_ALL_EMPLOYEES',
  REQUEST_NEW_EMPLOYEE = 'REQUEST_NEW_EMPLOYEE',
  APPROVE_NEW_EMPLOYEE = 'APPROVE_NEW_EMPLOYEE',

  // Leaves
  REQUEST_LEAVE = 'REQUEST_LEAVE',
  APPROVE_DEPT_LEAVES = 'APPROVE_DEPT_LEAVES',
  VIEW_ALL_LEAVES = 'VIEW_ALL_LEAVES',

  // Salaries
  VIEW_ALL_SALARIES = 'VIEW_ALL_SALARIES',
  MANAGE_ALL_SALARIES = 'MANAGE_ALL_SALARIES',

  // Payroll
  MANAGE_PAYROLL = 'MANAGE_PAYROLL',
  VIEW_PAYROLL = 'VIEW_PAYROLL',

  // Bonuses
  SUGGEST_BONUS = 'SUGGEST_BONUS',
  APPROVE_BONUS = 'APPROVE_BONUS',

  // Jobs
  POST_JOB = 'POST_JOB',
  APPROVE_JOB_POSTING = 'APPROVE_JOB_POSTING',

  // Departments
  MANAGE_DEPARTMENTS = 'MANAGE_DEPARTMENTS',

  // Reports
  VIEW_DEPT_REPORTS = 'VIEW_DEPT_REPORTS',
  VIEW_ALL_REPORTS = 'VIEW_ALL_REPORTS',

  // Attendance / Sessions
  VIEW_OWN_ATTENDANCE = 'VIEW_OWN_ATTENDANCE',
  MANAGE_ATTENDANCE = 'MANAGE_ATTENDANCE',

  // Warnings / Discipline
  ISSUE_WARNING = 'ISSUE_WARNING',
  VIEW_WARNINGS = 'VIEW_WARNINGS',

  // Company Settings
  MANAGE_SETTINGS = 'MANAGE_SETTINGS',

  // Admin
  MANAGE_ROLES = 'MANAGE_ROLES',
  VIEW_AUDIT_LOGS = 'VIEW_AUDIT_LOGS',
}

/** JWT token payload structure */
export interface JwtPayload {
  sub: string;          // User ID
  email: string;
  role: Role;
  departmentId?: string;
  permissions: Permission[];
  iat: number;
  exp: number;
}

/** Session data stored in cookie */
export interface SessionData {
  userId: string;
  email: string;
  role: Role;
  departmentId?: string;
  expiresAt: Date;
}

/** Login request body */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Login response */
export interface LoginResponse {
  user: AuthUser;
  token: string;
}

/** Authenticated user (safe to expose to client) */
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  departmentId?: string;
  departmentName?: string;
  avatarUrl?: string;
}

/** Registration request body */
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  departmentId?: string;
}
