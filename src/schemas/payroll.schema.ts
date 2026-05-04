/**
 * @file Zod validation schemas for payroll and salary operations.
 *
 * Design decisions:
 * - Salary components support both flat amounts and percentage-based values.
 * - Payroll run is for a specific month/year — duplicates are prevented server-side.
 * - Creating a new salary auto-deactivates the previous one (handled in service).
 */

import { z } from 'zod';

/** Valid component types */
const componentTypes = ['ALLOWANCE', 'DEDUCTION', 'BONUS', 'TAX'] as const;

/** Salary component sub-schema (reused in create/update) */
const salaryComponentSchema = z.object({
  name: z
    .string()
    .min(2, 'Component name must be at least 2 characters')
    .max(100)
    .transform((v) => v.trim()),
  type: z.enum(componentTypes),
  amount: z.coerce.number().min(0, 'Amount must be non-negative'),
  isPercentage: z.boolean().default(false),
  description: z
    .string()
    .max(200)
    .transform((v) => v.trim())
    .optional()
    .or(z.literal('')),
});

/**
 * Create salary validation schema.
 */
export const createSalarySchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  baseSalary: z.coerce
    .number()
    .positive('Base salary must be a positive number'),
  effectiveDate: z.coerce.date({ error: 'Effective date is required' }),
  components: z.array(salaryComponentSchema).default([]),
});

export type CreateSalaryFormData = z.infer<typeof createSalarySchema>;

/**
 * Update salary validation schema (partial).
 */
export const updateSalarySchema = z.object({
  baseSalary: z.coerce.number().positive().optional(),
  components: z.array(salaryComponentSchema).optional(),
});

export type UpdateSalaryFormData = z.infer<typeof updateSalarySchema>;

/**
 * Run payroll validation schema.
 * Processes all active employees for a given month/year.
 */
export const runPayrollSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2100),
});

export type RunPayrollFormData = z.infer<typeof runPayrollSchema>;

/** Query parameters for salary list */
export const salaryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  employeeId: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(['baseSalary', 'effectiveDate', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type SalaryQueryParams = z.infer<typeof salaryQuerySchema>;

/** Query parameters for payslip list */
export const payslipQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  employeeId: z.string().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2020).max(2100).optional(),
  isPaid: z.coerce.boolean().optional(),
  sortBy: z.enum(['month', 'netPay', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type PayslipQueryParams = z.infer<typeof payslipQuerySchema>;
