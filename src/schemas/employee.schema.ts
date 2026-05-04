/**
 * @file Zod validation schemas for employee operations.
 *
 * Design decisions:
 * - Password is NOT part of the create schema — it's auto-generated server-side.
 * - No delete operation — employees are deactivated/terminated, never removed.
 * - Status changes have their own dedicated schema for clear intent.
 */

import { z } from 'zod';

/** Valid enum values for validation */
const employmentTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'] as const;
const employmentStatuses = ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED', 'PROBATION'] as const;
const genders = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'] as const;
const roles = ['EMPLOYEE', 'MANAGER', 'HR_STAFF', 'HR_MANAGER', 'COMPANY_ADMIN'] as const;

/**
 * Create employee validation schema.
 * Password is intentionally excluded — the system generates a secure password automatically.
 */
export const createEmployeeSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be at most 50 characters')
    .transform((v) => v.trim()),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be at most 50 characters')
    .transform((v) => v.trim()),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .transform((v) => v.trim().toLowerCase()),
  phone: z
    .string()
    .max(20, 'Phone number is too long')
    .optional()
    .or(z.literal('')),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.enum(genders).optional(),
  nationalId: z.string().max(30).optional().or(z.literal('')),
  address: z.string().max(200).optional().or(z.literal('')),
  departmentId: z.string().min(1, 'Department is required'),
  position: z
    .string()
    .min(2, 'Position must be at least 2 characters')
    .max(100, 'Position must be at most 100 characters')
    .transform((v) => v.trim()),
  role: z.enum(roles).default('EMPLOYEE'),
  employmentType: z.enum(employmentTypes).default('FULL_TIME'),
  hireDate: z.coerce.date({ error: 'Hire date is required' }),
  managerId: z.string().optional().or(z.literal('')),
});

export type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>;

/** Update employee validation schema (all fields optional) */
export const updateEmployeeSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50)
    .transform((v) => v.trim())
    .optional(),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50)
    .transform((v) => v.trim())
    .optional(),
  phone: z.string().max(20).optional().nullable(),
  dateOfBirth: z.coerce.date().optional().nullable(),
  gender: z.enum(genders).optional().nullable(),
  nationalId: z.string().max(30).optional().nullable(),
  address: z.string().max(200).optional().nullable(),
  departmentId: z.string().min(1).optional(),
  position: z
    .string()
    .min(2)
    .max(100)
    .transform((v) => v.trim())
    .optional(),
  role: z.enum(roles).optional(),
  employmentType: z.enum(employmentTypes).optional(),
  hireDate: z.coerce.date().optional(),
  managerId: z.string().optional().nullable(),
  hasJobPostingPermission: z.boolean().optional(),
});

export type UpdateEmployeeFormData = z.infer<typeof updateEmployeeSchema>;

/**
 * Employee status change schema — dedicated schema for status transitions.
 * Separated from updateEmployeeSchema for clear intent and audit trail.
 */
export const changeEmployeeStatusSchema = z.object({
  employmentStatus: z.enum(employmentStatuses),
  reason: z
    .string()
    .min(3, 'Reason must be at least 3 characters')
    .max(500, 'Reason must be at most 500 characters')
    .transform((v) => v.trim()),
});

export type ChangeEmployeeStatusData = z.infer<typeof changeEmployeeStatusSchema>;

/** Query parameters validation */
export const employeeQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  departmentId: z.string().optional(),
  employmentStatus: z.enum(employmentStatuses).optional(),
  employmentType: z.enum(employmentTypes).optional(),
  sortBy: z.enum(['employeeId', 'hireDate', 'position', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type EmployeeQueryParams = z.infer<typeof employeeQuerySchema>;
