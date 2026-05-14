/**
 * @file Career record Zod schemas for validation.
 */

import { z } from 'zod';

/**
 * Schema for manually creating a career record (promotion/transfer).
 */
export const createCareerRecordSchema = z.object({
  position: z.string().min(2, 'Position must be at least 2 characters').max(100),
  departmentId: z.string().min(1, 'Department is required'),
  baseSalary: z.number().min(0, 'Salary cannot be negative'),
  workingHoursPerDay: z.number().min(1).max(24).default(8),
  reason: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
});

export type CreateCareerRecordData = z.infer<typeof createCareerRecordSchema>;

/**
 * Schema for career history query params.
 */
export const careerHistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CareerHistoryQueryParams = z.infer<typeof careerHistoryQuerySchema>;
