/**
 * @file Department Zod schemas — validation rules for department operations.
 * Separates create, update, and toggle schemas for type safety.
 */

import { z } from 'zod';

/**
 * Schema for creating a new department.
 */
export const createDepartmentSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .trim(),
  code: z
    .string()
    .min(2, 'Code must be at least 2 characters')
    .max(20, 'Code must be at most 20 characters')
    .regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase letters, numbers, hyphens, or underscores')
    .trim(),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .optional()
    .or(z.literal('')),
  managerId: z.string().cuid().optional().or(z.literal('')),
  parentId: z.string().cuid().optional().or(z.literal('')),
});

/**
 * Schema for updating a department.
 */
export const updateDepartmentSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .trim()
    .optional(),
  code: z
    .string()
    .min(2, 'Code must be at least 2 characters')
    .max(20, 'Code must be at most 20 characters')
    .regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase letters, numbers, hyphens, or underscores')
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .optional()
    .nullable(),
  managerId: z.string().cuid().optional().nullable(),
  parentId: z.string().cuid().optional().nullable(),
});

/**
 * Schema for toggling department status.
 */
export const toggleDepartmentStatusSchema = z.object({
  isActive: z.boolean(),
});

/** Inferred types */
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type ToggleDepartmentStatusInput = z.infer<typeof toggleDepartmentStatusSchema>;
