/**
 * @file Zod validation schemas for leave operations.
 *
 * Design decisions:
 * - Leave requests require a future start date to prevent backdating.
 * - Review actions (approve/reject) use a dedicated schema for clear intent.
 * - totalDays is computed server-side from startDate/endDate — never client-provided.
 */

import { z } from 'zod';

/** Valid approval statuses for review actions */
const approvalStatuses = ['APPROVED', 'REJECTED'] as const;

/**
 * Request leave validation schema.
 * Employees submit leave requests with these fields.
 */
export const requestLeaveSchema = z.object({
  leaveTypeId: z.string().min(1, 'Leave type is required'),
  startDate: z.coerce.date({ error: 'Start date is required' }),
  endDate: z.coerce.date({ error: 'End date is required' }),
  reason: z
    .string()
    .min(3, 'Reason must be at least 3 characters')
    .max(500, 'Reason must be at most 500 characters')
    .transform((v) => v.trim()),
}).refine(
  (data) => data.endDate >= data.startDate,
  { message: 'End date must be on or after start date', path: ['endDate'] }
);

export type RequestLeaveFormData = z.infer<typeof requestLeaveSchema>;

/**
 * Review leave validation schema.
 * Managers/HR approve or reject leave requests.
 */
export const reviewLeaveSchema = z.object({
  status: z.enum(approvalStatuses),
  approvalNotes: z
    .string()
    .max(500, 'Notes must be at most 500 characters')
    .transform((v) => v.trim())
    .optional()
    .or(z.literal('')),
});

export type ReviewLeaveFormData = z.infer<typeof reviewLeaveSchema>;

/** Query parameters for leave list */
export const leaveQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']).optional(),
  leaveTypeId: z.string().optional(),
  employeeId: z.string().optional(),
  sortBy: z.enum(['startDate', 'totalDays', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type LeaveQueryParams = z.infer<typeof leaveQuerySchema>;
