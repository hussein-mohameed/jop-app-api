/**
 * @file Work schedule Zod schemas for validation.
 */

import { z } from 'zod';

const timeRegex = /^\d{2}:\d{2}$/;
const workDaysArray = z.array(z.number().int().min(0).max(6)).min(1).max(7);

/**
 * Schema for setting a custom work schedule for an employee.
 */
export const setEmployeeScheduleSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  workStartTime: z.string().regex(timeRegex, 'Format must be HH:mm'),
  workEndTime: z.string().regex(timeRegex, 'Format must be HH:mm'),
  workDays: workDaysArray,
});

export type SetEmployeeScheduleData = z.infer<typeof setEmployeeScheduleSchema>;

/**
 * Schema for updating company-wide default work schedule.
 */
export const updateDefaultScheduleSchema = z.object({
  defaultWorkStartTime: z.string().regex(timeRegex, 'Format must be HH:mm').optional(),
  defaultWorkEndTime: z.string().regex(timeRegex, 'Format must be HH:mm').optional(),
  defaultWorkDays: workDaysArray.optional(),
});

export type UpdateDefaultScheduleData = z.infer<typeof updateDefaultScheduleSchema>;
