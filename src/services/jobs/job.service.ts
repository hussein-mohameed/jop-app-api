/**
 * @file Job service — business logic for job posting and application operations.
 * NO direct database calls — delegates to repository.
 *
 * Business rules:
 * - Job lifecycle: DRAFT → PENDING_APPROVAL → PUBLISHED → CLOSED
 * - Only DRAFT jobs can be edited
 * - Only PUBLISHED jobs accept applications
 * - Published date is auto-set on status transition
 */

import 'server-only';
import * as jobRepo from '@/repositories/job.repository';
import * as departmentRepo from '@/repositories/department.repository';
import { notify } from '@/services/notifications/notification.service';
import type { ApiResponse, PaginatedResponse } from '@/types/common.types';
import type {
  CreateJobFormData, UpdateJobFormData, JobQueryParams,
  CreateApplicationFormData, ApplicationQueryParams,
} from '@/schemas/job.schema';

// ==================== JOB QUERIES ====================

export async function listJobs(
  params: JobQueryParams
): Promise<ApiResponse<PaginatedResponse<unknown>>> {
  try {
    const { items, total } = await jobRepo.findMany(
      {
        search: params.search,
        status: params.status as import('@prisma/client').JobStatus | undefined,
        jobType: params.jobType as import('@prisma/client').JobType | undefined,
        departmentId: params.departmentId,
      },
      params.page, params.pageSize,
      { field: params.sortBy, order: params.sortOrder }
    );
    return {
      success: true,
      data: { items, total, page: params.page, pageSize: params.pageSize, totalPages: Math.ceil(total / params.pageSize) },
    };
  } catch (error) {
    return { success: false, error: `Failed to list jobs: ${String(error)}` };
  }
}

export async function getJob(id: string): Promise<ApiResponse<unknown>> {
  try {
    const job = await jobRepo.findById(id);
    if (!job) return { success: false, error: 'Job not found' };
    return { success: true, data: job };
  } catch (error) {
    return { success: false, error: `Failed to get job: ${String(error)}` };
  }
}

// ==================== JOB MUTATIONS ====================

export async function createJob(
  postedById: string,
  data: CreateJobFormData
): Promise<ApiResponse<unknown>> {
  try {
    const deptExists = await departmentRepo.existsById(data.departmentId);
    if (!deptExists) return { success: false, error: 'Department not found' };

    const job = await jobRepo.create({
      title: data.title,
      description: data.description,
      departmentId: data.departmentId,
      location: data.location,
      jobType: data.jobType as import('@prisma/client').JobType,
      salaryMin: data.salaryMin,
      salaryMax: data.salaryMax,
      requirements: data.requirements,
      responsibilities: data.responsibilities,
      benefits: data.benefits,
      postedById,
      closingDate: data.closingDate,
    });

    return { success: true, data: job, message: 'Job posting created as draft' };
  } catch (error) {
    return { success: false, error: `Failed to create job: ${String(error)}` };
  }
}

export async function updateJob(
  id: string,
  data: UpdateJobFormData
): Promise<ApiResponse<unknown>> {
  try {
    const existing = await jobRepo.findById(id);
    if (!existing) return { success: false, error: 'Job not found' };
    if (existing.status !== 'DRAFT') {
      return { success: false, error: 'Only draft jobs can be edited' };
    }

    if (data.departmentId) {
      const deptExists = await departmentRepo.existsById(data.departmentId);
      if (!deptExists) return { success: false, error: 'Department not found' };
    }

    const job = await jobRepo.update(id, data as Parameters<typeof jobRepo.update>[1]);
    return { success: true, data: job, message: 'Job posting updated' };
  } catch (error) {
    return { success: false, error: `Failed to update job: ${String(error)}` };
  }
}

export async function reviewJob(
  id: string,
  reviewerId: string,
  status: string
): Promise<ApiResponse<unknown>> {
  try {
    const existing = await jobRepo.findById(id);
    if (!existing) return { success: false, error: 'Job not found' };

    // Validate transitions
    const validTransitions: Record<string, string[]> = {
      DRAFT: ['PENDING_APPROVAL', 'CANCELLED'],
      PENDING_APPROVAL: ['PUBLISHED', 'DRAFT', 'CANCELLED'],
      PUBLISHED: ['CLOSED'],
      CLOSED: [],
      CANCELLED: [],
    };

    const allowed = validTransitions[existing.status] ?? [];
    if (!allowed.includes(status)) {
      return { success: false, error: `Cannot transition from ${existing.status} to ${status}` };
    }

    const job = await jobRepo.updateStatus(
      id,
      status as import('@prisma/client').JobStatus,
      ['PUBLISHED'].includes(status) ? reviewerId : undefined
    );

    // Notify the poster
    notify({
      userId: existing.postedById,
      title: `Job posting ${status.toLowerCase().replace('_', ' ')}`,
      message: `Your job posting "${existing.title}" has been ${status.toLowerCase().replace('_', ' ')}.`,
      type: status === 'PUBLISHED' ? 'SUCCESS' : 'INFO',
      link: `/admin/jobs/${id}`,
    });

    return { success: true, data: job, message: `Job status updated to ${status}` };
  } catch (error) {
    return { success: false, error: `Failed to review job: ${String(error)}` };
  }
}

// ==================== APPLICATION QUERIES ====================

export async function listApplications(
  jobId: string,
  params: ApplicationQueryParams
): Promise<ApiResponse<PaginatedResponse<unknown>>> {
  try {
    const { items, total } = await jobRepo.findApplications(
      jobId,
      { search: params.search, status: params.status as import('@prisma/client').ApplicationStatus | undefined },
      params.page, params.pageSize,
      { field: params.sortBy, order: params.sortOrder }
    );
    return {
      success: true,
      data: { items, total, page: params.page, pageSize: params.pageSize, totalPages: Math.ceil(total / params.pageSize) },
    };
  } catch (error) {
    return { success: false, error: `Failed to list applications: ${String(error)}` };
  }
}

// ==================== APPLICATION MUTATIONS ====================

export async function submitApplication(
  jobId: string,
  data: CreateApplicationFormData
): Promise<ApiResponse<unknown>> {
  try {
    const job = await jobRepo.findById(jobId);
    if (!job) return { success: false, error: 'Job not found' };
    if (job.status !== 'PUBLISHED') {
      return { success: false, error: 'This job is not accepting applications' };
    }

    const application = await jobRepo.createApplication({
      jobId,
      applicantName: data.applicantName,
      applicantEmail: data.applicantEmail,
      applicantPhone: data.applicantPhone || undefined,
      coverLetter: data.coverLetter || undefined,
      resumeUrl: data.resumeUrl || undefined,
    });

    return { success: true, data: application, message: 'Application submitted successfully' };
  } catch (error) {
    return { success: false, error: `Failed to submit application: ${String(error)}` };
  }
}

export async function reviewApplication(
  applicationId: string,
  reviewerId: string,
  status: string,
  notes?: string
): Promise<ApiResponse<unknown>> {
  try {
    const existing = await jobRepo.findApplicationById(applicationId);
    if (!existing) return { success: false, error: 'Application not found' };

    const application = await jobRepo.updateApplicationStatus(
      applicationId,
      status as import('@prisma/client').ApplicationStatus,
      reviewerId,
      notes
    );

    return { success: true, data: application, message: `Application status updated to ${status}` };
  } catch (error) {
    return { success: false, error: `Failed to review application: ${String(error)}` };
  }
}
