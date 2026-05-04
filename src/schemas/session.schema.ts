/**
 * @file Session Zod schemas for work session endpoints.
 */

import { z } from 'zod';

export const clockInSchema = z.object({
  notes: z.string().max(500).optional(),
});

export const startBreakSchema = z.object({
  type: z.enum(['REST', 'LUNCH', 'PRAYER', 'PERSONAL', 'OTHER']),
  slotName: z.string().max(100).optional(),
});

export const sessionHistorySchema = z.object({
  from: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  to: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});

export const sessionAnalyticsSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2100),
});

export type ClockInFormData = z.infer<typeof clockInSchema>;
export type StartBreakFormData = z.infer<typeof startBreakSchema>;
