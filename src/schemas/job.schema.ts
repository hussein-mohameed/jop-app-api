/**
 * @file Zod validation schemas for job posting and application operations.
 *
 * Design decisions:
 * - Job lifecycle: DRAFT → PENDING_APPROVAL → PUBLISHED → CLOSED.
 * - Requirements, responsibilities, and benefits are string arrays.
 * - Applications can only be submitted for PUBLISHED jobs (validated in service).
 */

import { z } from 'zod';

/** Valid job statuses */
const jobStatuses = ['DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'CLOSED', 'CANCELLED'] as const;
const jobTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE'] as const;

/** Valid application statuses for review */
const applicationReviewStatuses = [
  'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED',
  'OFFERED', 'HIRED', 'REJECTED',
] as const;

/**
 * Create job posting validation schema.
 */
export const createJobSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be at most 200 characters')
    .transform((v) => v.trim()),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description must be at most 5000 characters')
    .transform((v) => v.trim()),
  departmentId: z.string().min(1, 'Department is required'),
  location: z
    .string()
    .min(2, 'Location must be at least 2 characters')
    .max(200)
    .transform((v) => v.trim()),
  jobType: z.enum(jobTypes),
  salaryMin: z.coerce.number().positive().optional(),
  salaryMax: z.coerce.number().positive().optional(),
  requirements: z.array(z.string().min(1).max(500)).default([]),
  responsibilities: z.array(z.string().min(1).max(500)).default([]),
  benefits: z.array(z.string().min(1).max(500)).default([]),
  closingDate: z.coerce.date().optional(),
}).refine(
  (data) => !data.salaryMin || !data.salaryMax || data.salaryMax >= data.salaryMin,
  { message: 'Maximum salary must be ≥ minimum salary', path: ['salaryMax'] }
);

export type CreateJobFormData = z.infer<typeof createJobSchema>;

/**
 * Update job posting validation schema (partial).
 */
export const updateJobSchema = z.object({
  title: z.string().min(3).max(200).transform((v) => v.trim()).optional(),
  description: z.string().min(20).max(5000).transform((v) => v.trim()).optional(),
  departmentId: z.string().min(1).optional(),
  location: z.string().min(2).max(200).transform((v) => v.trim()).optional(),
  jobType: z.enum(jobTypes).optional(),
  salaryMin: z.coerce.number().positive().optional().nullable(),
  salaryMax: z.coerce.number().positive().optional().nullable(),
  requirements: z.array(z.string().min(1).max(500)).optional(),
  responsibilities: z.array(z.string().min(1).max(500)).optional(),
  benefits: z.array(z.string().min(1).max(500)).optional(),
  closingDate: z.coerce.date().optional().nullable(),
});

export type UpdateJobFormData = z.infer<typeof updateJobSchema>;

/**
 * Review job posting validation schema (status transition).
 */
export const reviewJobSchema = z.object({
  status: z.enum(jobStatuses),
});

export type ReviewJobFormData = z.infer<typeof reviewJobSchema>;

/**
 * Submit job application validation schema.
 */
export const createApplicationSchema = z.object({
  applicantName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100)
    .transform((v) => v.trim()),
  applicantEmail: z
    .string()
    .email('Please enter a valid email')
    .transform((v) => v.trim().toLowerCase()),
  applicantPhone: z.string().max(20).optional().or(z.literal('')),
  coverLetter: z.string().max(3000).optional().or(z.literal('')),
  resumeUrl: z.string().url().optional().or(z.literal('')),
});

export type CreateApplicationFormData = z.infer<typeof createApplicationSchema>;

/**
 * Review application validation schema (status change).
 */
export const reviewApplicationSchema = z.object({
  status: z.enum(applicationReviewStatuses),
  notes: z
    .string()
    .max(500)
    .transform((v) => v.trim())
    .optional()
    .or(z.literal('')),
});

export type ReviewApplicationFormData = z.infer<typeof reviewApplicationSchema>;

/** Query parameters for job list */
export const jobQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.enum(jobStatuses).optional(),
  jobType: z.enum(jobTypes).optional(),
  departmentId: z.string().optional(),
  sortBy: z.enum(['title', 'publishedAt', 'closingDate', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type JobQueryParams = z.infer<typeof jobQuerySchema>;

/** Query parameters for application list */
export const applicationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.enum([
    'RECEIVED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED',
    'OFFERED', 'HIRED', 'REJECTED', 'WITHDRAWN',
  ]).optional(),
  sortBy: z.enum(['applicantName', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ApplicationQueryParams = z.infer<typeof applicationQuerySchema>;
