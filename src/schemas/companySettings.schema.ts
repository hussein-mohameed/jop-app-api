/**
 * @file Company settings Zod schemas.
 */

import { z } from 'zod';

const disciplineStepSchema = z.object({
  step: z.number().int().min(1),
  name: z.string().min(1).max(100),
  deductionPct: z.number().min(0).max(100),
  isTermination: z.boolean(),
});

export const updateSettingsSchema = z.object({
  companyName: z.string().min(1).max(200).optional(),
  salaryDaySystem: z.number().int().refine(v => v === 22 || v === 30, {
    message: 'Must be 22 or 30',
  }).optional(),
  defaultVacationDays: z.number().int().min(0).max(365).optional(),
  workingHoursPerDay: z.number().min(1).max(24).optional(),
  lateGraceMinutes: z.number().int().min(0).max(120).optional(),
  overtimeMultiplier: z.number().min(1).max(5).optional(),
  disciplineSteps: z.array(disciplineStepSchema).min(2).optional(),
  // Work schedule defaults
  defaultWorkStartTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format must be HH:mm').optional(),
  defaultWorkEndTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format must be HH:mm').optional(),
  defaultWorkDays: z.array(z.number().int().min(0).max(6)).min(1).max(7).optional(),
});

export type UpdateSettingsFormData = z.infer<typeof updateSettingsSchema>;

