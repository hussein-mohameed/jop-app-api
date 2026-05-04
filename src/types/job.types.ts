/**
 * @file Job posting and application type definitions.
 */

import type { BaseEntity } from './common.types';

/** Job posting status */
export type JobStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'CLOSED' | 'CANCELLED';

/** Job type */
export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'REMOTE';

/** Application status */
export type ApplicationStatus =
  | 'RECEIVED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW_SCHEDULED'
  | 'OFFERED'
  | 'HIRED'
  | 'REJECTED'
  | 'WITHDRAWN';

/** Job posting entity */
export interface Job extends BaseEntity {
  title: string;
  description: string;
  departmentId: string;
  departmentName?: string;
  location: string;
  jobType: JobType;
  salaryMin?: number;
  salaryMax?: number;
  requirements: string[];
  responsibilities: string[];
  benefits?: string[];
  status: JobStatus;
  postedById: string;
  postedByName: string;
  approvedById?: string;
  approvedByName?: string;
  publishedAt?: Date;
  closingDate?: Date;
  applicationCount?: number;
}

/** Job application entity */
export interface JobApplication extends BaseEntity {
  jobId: string;
  jobTitle: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  resumeUrl?: string;
  coverLetter?: string;
  status: ApplicationStatus;
  notes?: string;
  reviewedById?: string;
  reviewedByName?: string;
}

/** Create job posting data */
export interface CreateJobData {
  title: string;
  description: string;
  departmentId: string;
  location: string;
  jobType: JobType;
  salaryMin?: number;
  salaryMax?: number;
  requirements: string[];
  responsibilities: string[];
  benefits?: string[];
  closingDate?: Date;
}

/** Job summary for listings */
export interface JobSummary {
  id: string;
  title: string;
  department: string;
  location: string;
  jobType: JobType;
  status: JobStatus;
  applicationCount: number;
  publishedAt?: Date;
  closingDate?: Date;
}
