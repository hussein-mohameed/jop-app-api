/**
 * @file Job repository — data layer for job posting and application operations.
 * NO business logic — only Prisma queries and projections.
 */

import 'server-only';
import prisma from '@/lib/prisma';
import type { JobStatus, JobType, ApplicationStatus } from '@prisma/client';

// ==================== TYPES ====================

export interface JobFilters {
  search?: string;
  status?: JobStatus;
  jobType?: JobType;
  departmentId?: string;
}

export interface JobSort {
  field: 'title' | 'publishedAt' | 'closingDate' | 'createdAt';
  order: 'asc' | 'desc';
}

export interface ApplicationFilters {
  search?: string;
  status?: ApplicationStatus;
}

export interface ApplicationSort {
  field: 'applicantName' | 'createdAt';
  order: 'asc' | 'desc';
}

const jobSelect = {
  id: true, title: true, description: true, departmentId: true,
  location: true, jobType: true, salaryMin: true, salaryMax: true,
  requirements: true, responsibilities: true, benefits: true,
  status: true, postedById: true, approvedById: true,
  publishedAt: true, closingDate: true, createdAt: true, updatedAt: true,
  department: { select: { id: true, name: true, code: true } },
  postedBy: { select: { id: true, firstName: true, lastName: true } },
  approvedBy: { select: { id: true, firstName: true, lastName: true } },
  _count: { select: { applications: true } },
} as const;

const applicationSelect = {
  id: true, jobId: true, applicantName: true, applicantEmail: true,
  applicantPhone: true, resumeUrl: true, coverLetter: true,
  status: true, notes: true, reviewedById: true,
  createdAt: true, updatedAt: true,
  job: { select: { id: true, title: true } },
  reviewedBy: { select: { id: true, firstName: true, lastName: true } },
} as const;

// ==================== JOB QUERIES ====================

export async function findMany(
  filters: JobFilters = {}, page = 1, pageSize = 10,
  sort: JobSort = { field: 'createdAt', order: 'desc' }
) {
  const where = buildJobWhere(filters);
  const skip = (page - 1) * pageSize;
  const [items, total] = await Promise.all([
    prisma.job.findMany({ where, select: jobSelect, skip, take: pageSize, orderBy: { [sort.field]: sort.order } }),
    prisma.job.count({ where }),
  ]);
  return { items, total };
}

export async function findById(id: string) {
  return prisma.job.findUnique({ where: { id }, select: jobSelect });
}

export async function create(data: {
  title: string; description: string; departmentId: string;
  location: string; jobType: JobType; salaryMin?: number; salaryMax?: number;
  requirements: string[]; responsibilities: string[]; benefits: string[];
  postedById: string; closingDate?: Date;
}) {
  return prisma.job.create({
    data: {
      ...data,
      requirements: data.requirements as object,
      responsibilities: data.responsibilities as object,
      benefits: data.benefits as object,
    },
    select: jobSelect,
  });
}

export async function update(id: string, data: {
  title?: string; description?: string; departmentId?: string;
  location?: string; jobType?: JobType; salaryMin?: number | null;
  salaryMax?: number | null; requirements?: string[];
  responsibilities?: string[]; benefits?: string[]; closingDate?: Date | null;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = { ...data };
  if (data.requirements) updateData.requirements = data.requirements as object;
  if (data.responsibilities) updateData.responsibilities = data.responsibilities as object;
  if (data.benefits) updateData.benefits = data.benefits as object;

  return prisma.job.update({ where: { id }, data: updateData, select: jobSelect });
}

export async function updateStatus(id: string, status: JobStatus, approvedById?: string) {
  return prisma.job.update({
    where: { id },
    data: {
      status,
      ...(approvedById && { approvedById }),
      ...(status === 'PUBLISHED' && { publishedAt: new Date() }),
    },
    select: jobSelect,
  });
}

// ==================== APPLICATION QUERIES ====================

export async function findApplications(
  jobId: string, filters: ApplicationFilters = {}, page = 1, pageSize = 10,
  sort: ApplicationSort = { field: 'createdAt', order: 'desc' }
) {
  const where = { jobId, ...buildApplicationWhere(filters) };
  const skip = (page - 1) * pageSize;
  const [items, total] = await Promise.all([
    prisma.jobApplication.findMany({ where, select: applicationSelect, skip, take: pageSize, orderBy: { [sort.field]: sort.order } }),
    prisma.jobApplication.count({ where }),
  ]);
  return { items, total };
}

export async function findApplicationById(id: string) {
  return prisma.jobApplication.findUnique({ where: { id }, select: applicationSelect });
}

export async function createApplication(data: {
  jobId: string; applicantName: string; applicantEmail: string;
  applicantPhone?: string; coverLetter?: string; resumeUrl?: string;
}) {
  return prisma.jobApplication.create({ data, select: applicationSelect });
}

export async function updateApplicationStatus(
  id: string, status: ApplicationStatus, reviewedById?: string, notes?: string
) {
  return prisma.jobApplication.update({
    where: { id },
    data: { status, ...(reviewedById && { reviewedById }), ...(notes && { notes }) },
    select: applicationSelect,
  });
}

// ==================== HELPERS ====================

function buildJobWhere(filters: JobFilters) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (filters.status) where.status = filters.status;
  if (filters.jobType) where.jobType = filters.jobType;
  if (filters.departmentId) where.departmentId = filters.departmentId;
  if (filters.search) {
    const s = filters.search.trim();
    where.OR = [
      { title: { contains: s, mode: 'insensitive' } },
      { location: { contains: s, mode: 'insensitive' } },
      { department: { name: { contains: s, mode: 'insensitive' } } },
    ];
  }
  return where;
}

function buildApplicationWhere(filters: ApplicationFilters) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (filters.status) where.status = filters.status;
  if (filters.search) {
    const s = filters.search.trim();
    where.OR = [
      { applicantName: { contains: s, mode: 'insensitive' } },
      { applicantEmail: { contains: s, mode: 'insensitive' } },
    ];
  }
  return where;
}
