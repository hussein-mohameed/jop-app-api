/**
 * @file Leave repository — data layer for leave operations.
 * All database access for leaves goes through this repository.
 * NO business logic — only Prisma queries and projections.
 *
 * Design: Leave balance is updated atomically within transactions
 * to prevent race conditions on concurrent leave requests.
 */

import 'server-only';
import prisma from '@/lib/prisma';
import type { ApprovalStatus } from '@prisma/client';

// ==================== TYPES ====================

/** Filters for leave list queries */
export interface LeaveFilters {
  search?: string;
  status?: ApprovalStatus;
  leaveTypeId?: string;
  employeeId?: string;
}

/** Sorting for leave list queries */
export interface LeaveSort {
  field: 'startDate' | 'totalDays' | 'createdAt';
  order: 'asc' | 'desc';
}

/** Shared select projection for leave queries */
const leaveSelectWithRelations = {
  id: true,
  employeeId: true,
  leaveTypeId: true,
  startDate: true,
  endDate: true,
  totalDays: true,
  reason: true,
  status: true,
  approvedById: true,
  approvedAt: true,
  approvalNotes: true,
  createdAt: true,
  updatedAt: true,
  employee: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  },
  leaveType: {
    select: {
      id: true,
      name: true,
      code: true,
      color: true,
    },
  },
  approvedBy: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  },
} as const;

// ==================== QUERIES ====================

/**
 * Find all leaves with optional filters, pagination, and sorting.
 */
export async function findMany(
  filters: LeaveFilters = {},
  page = 1,
  pageSize = 10,
  sort: LeaveSort = { field: 'createdAt', order: 'desc' }
) {
  const where = buildWhereClause(filters);
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.leave.findMany({
      where,
      select: leaveSelectWithRelations,
      skip,
      take: pageSize,
      orderBy: { [sort.field]: sort.order },
    }),
    prisma.leave.count({ where }),
  ]);

  return { items, total };
}

/**
 * Find a single leave by ID with full details.
 */
export async function findById(id: string) {
  return prisma.leave.findUnique({
    where: { id },
    select: leaveSelectWithRelations,
  });
}

/**
 * Create a new leave request.
 */
export async function create(data: {
  employeeId: string;
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason: string;
}) {
  return prisma.leave.create({
    data,
    select: leaveSelectWithRelations,
  });
}

/**
 * Update leave status (approve/reject/cancel).
 */
export async function updateStatus(
  id: string,
  status: ApprovalStatus,
  approvedById?: string,
  approvalNotes?: string
) {
  return prisma.leave.update({
    where: { id },
    data: {
      status,
      approvedById: approvedById ?? null,
      approvedAt: approvedById ? new Date() : null,
      approvalNotes: approvalNotes ?? null,
    },
    select: leaveSelectWithRelations,
  });
}

/**
 * Check for overlapping leave requests for an employee.
 * Overlaps with PENDING or APPROVED leaves are considered conflicts.
 */
export async function findOverlapping(
  employeeId: string,
  startDate: Date,
  endDate: Date,
  excludeId?: string
) {
  return prisma.leave.findMany({
    where: {
      employeeId,
      status: { in: ['PENDING', 'APPROVED'] },
      startDate: { lte: endDate },
      endDate: { gte: startDate },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true, startDate: true, endDate: true, status: true },
  });
}

// ==================== LEAVE BALANCES ====================

/**
 * Get leave balances for an employee for a specific year.
 */
export async function findLeaveBalances(employeeId: string, year: number) {
  return prisma.leaveBalance.findMany({
    where: { employeeId, year },
    include: {
      leaveType: {
        select: { id: true, name: true, code: true, color: true },
      },
    },
  });
}

/**
 * Get a specific leave balance (employee + type + year).
 */
export async function findLeaveBalance(
  employeeId: string,
  leaveTypeId: string,
  year: number
) {
  return prisma.leaveBalance.findUnique({
    where: {
      employeeId_leaveTypeId_year: { employeeId, leaveTypeId, year },
    },
  });
}

/**
 * Increment pending days on a leave balance.
 * Used when a new leave request is created.
 */
export async function incrementPendingDays(
  employeeId: string,
  leaveTypeId: string,
  year: number,
  days: number
) {
  return prisma.leaveBalance.update({
    where: {
      employeeId_leaveTypeId_year: { employeeId, leaveTypeId, year },
    },
    data: { pendingDays: { increment: days } },
  });
}

/**
 * Move pending days to used days on approval.
 */
export async function approveLeaveDays(
  employeeId: string,
  leaveTypeId: string,
  year: number,
  days: number
) {
  return prisma.leaveBalance.update({
    where: {
      employeeId_leaveTypeId_year: { employeeId, leaveTypeId, year },
    },
    data: {
      pendingDays: { decrement: days },
      usedDays: { increment: days },
    },
  });
}

/**
 * Release pending days on rejection or cancellation.
 */
export async function releasePendingDays(
  employeeId: string,
  leaveTypeId: string,
  year: number,
  days: number
) {
  return prisma.leaveBalance.update({
    where: {
      employeeId_leaveTypeId_year: { employeeId, leaveTypeId, year },
    },
    data: { pendingDays: { decrement: days } },
  });
}

/**
 * Get all active leave types.
 */
export async function findActiveLeaveTypes() {
  return prisma.leaveType.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
}

// ==================== HELPERS ====================

function buildWhereClause(filters: LeaveFilters) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.leaveTypeId) {
    where.leaveTypeId = filters.leaveTypeId;
  }

  if (filters.employeeId) {
    where.employeeId = filters.employeeId;
  }

  if (filters.search) {
    const search = filters.search.trim();
    where.OR = [
      { reason: { contains: search, mode: 'insensitive' } },
      { employee: { firstName: { contains: search, mode: 'insensitive' } } },
      { employee: { lastName: { contains: search, mode: 'insensitive' } } },
    ];
  }

  return where;
}
