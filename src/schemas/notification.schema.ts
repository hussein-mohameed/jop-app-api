/**
 * @file Zod validation schemas for notification operations.
 *
 * Notifications are primarily created server-side by other services.
 * These schemas cover read/query operations and bulk mark-as-read.
 */

import { z } from 'zod';

/** Query parameters for notification list */
export const notificationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  isRead: z.coerce.boolean().optional(),
  type: z.enum(['INFO', 'SUCCESS', 'WARNING', 'ERROR']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type NotificationQueryParams = z.infer<typeof notificationQuerySchema>;

/** Bulk mark notifications as read */
export const markReadSchema = z.object({
  notificationIds: z
    .array(z.string().min(1))
    .min(1, 'At least one notification ID is required'),
});

export type MarkReadFormData = z.infer<typeof markReadSchema>;
