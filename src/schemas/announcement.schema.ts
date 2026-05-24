/**
 * @file Zod validation schemas for announcement operations.
 *
 * Covers:
 * - Creating announcements (with flexible targeting)
 * - Querying announcements (received / sent)
 */

import { z } from 'zod';

// ==================== TARGET SCHEMA ====================

/** Single target rule */
const announcementTargetSchema = z
  .object({
    type: z.enum(['ALL_EMPLOYEES', 'DEPARTMENT', 'SPECIFIC_EMPLOYEES']),
    departmentId: z.string().min(1).optional(),
    employeeId: z.string().min(1).optional(),
  })
  .refine(
    (data) => {
      if (data.type === 'DEPARTMENT') return !!data.departmentId;
      if (data.type === 'SPECIFIC_EMPLOYEES') return !!data.employeeId;
      return true;
    },
    { message: 'departmentId required for DEPARTMENT target, employeeId required for SPECIFIC_EMPLOYEES target' }
  );

// ==================== CREATE SCHEMA ====================

/** Create announcement request body */
export const createAnnouncementSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less'),
  content: z
    .string()
    .min(1, 'Content is required')
    .max(5000, 'Content must be 5000 characters or less'),
  priority: z.enum(['NORMAL', 'CRITICAL']).default('NORMAL'),
  targets: z
    .array(announcementTargetSchema)
    .min(1, 'At least one target is required'),
});

export type CreateAnnouncementFormData = z.infer<typeof createAnnouncementSchema>;

// ==================== QUERY SCHEMA ====================

/** Query parameters for announcement list */
export const announcementQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  priority: z.enum(['NORMAL', 'CRITICAL']).optional(),
  isRead: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
});

export type AnnouncementQueryParams = z.infer<typeof announcementQuerySchema>;
