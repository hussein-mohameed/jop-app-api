/**
 * @file Warning Zod schemas.
 */

import { z } from 'zod';

export const issueWarningSchema = z.object({
  employeeId: z.string().min(1),
  reason: z.string().min(3).max(500),
  description: z.string().max(2000).optional(),
});

export const updateWarningSchema = z.object({
  status: z.enum(['REVOKED', 'APPEALED']),
  appealNotes: z.string().max(1000).optional(),
});

export const warningQuerySchema = z.object({
  employeeId: z.string().optional(),
  status: z.enum(['ACTIVE', 'EXPIRED', 'APPEALED', 'REVOKED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type IssueWarningFormData = z.infer<typeof issueWarningSchema>;
export type UpdateWarningFormData = z.infer<typeof updateWarningSchema>;
export type WarningQueryParams = z.infer<typeof warningQuerySchema>;
