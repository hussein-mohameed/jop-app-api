/**
 * @file Zod validation schemas for bonus operations.
 *
 * Design decisions:
 * - Only managers+ can suggest bonuses — the suggestedById is set server-side from session.
 * - Only company admins can approve — review schema is separate.
 * - Amount must be positive.
 */

import { z } from 'zod';

/** Valid approval statuses for review actions */
const approvalStatuses = ['APPROVED', 'REJECTED'] as const;

/**
 * Suggest bonus validation schema.
 * Managers suggest bonuses for their team members.
 */
export const suggestBonusSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  amount: z.coerce
    .number()
    .positive('Amount must be a positive number')
    .max(1_000_000, 'Amount exceeds maximum allowed'),
  reason: z
    .string()
    .min(3, 'Reason must be at least 3 characters')
    .max(500, 'Reason must be at most 500 characters')
    .transform((v) => v.trim()),
});

export type SuggestBonusFormData = z.infer<typeof suggestBonusSchema>;

/**
 * Review bonus validation schema.
 * Company admins approve or reject bonus suggestions.
 */
export const reviewBonusSchema = z.object({
  status: z.enum(approvalStatuses),
  approvalNotes: z
    .string()
    .max(500, 'Notes must be at most 500 characters')
    .transform((v) => v.trim())
    .optional()
    .or(z.literal('')),
});

export type ReviewBonusFormData = z.infer<typeof reviewBonusSchema>;

/** Query parameters for bonus list */
export const bonusQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']).optional(),
  employeeId: z.string().optional(),
  sortBy: z.enum(['amount', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type BonusQueryParams = z.infer<typeof bonusQuerySchema>;
