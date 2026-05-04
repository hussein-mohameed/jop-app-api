/**
 * @file Bonus repository — data layer for bonus operations.
 * All database access for bonuses goes through this repository.
 * NO business logic — only Prisma queries and projections.
 */

import 'server-only';
import prisma from '@/lib/prisma';
import type { ApprovalStatus } from '@prisma/client';

// ==================== TYPES ====================

export interface BonusFilters {
  search?: string;
  status?: ApprovalStatus;
  employeeId?: string;
}

export interface BonusSort {
  field: 'amount' | 'createdAt';
  order: 'asc' | 'desc';
}

/** Shared select projection for bonus queries */
const bonusSelectWithRelations = {
  id: true,
  employeeId: true,
  amount: true,
  reason: true,
  status: true,
  suggestedById: true,
  approvedById: true,
  approvedAt: true,
  approvalNotes: true,
  payrollMonth: true,
  payrollYear: true,
  isIncludedInPayroll: true,
  createdAt: true,
  updatedAt: true,
  suggestedBy: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
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
 * Find all bonuses with optional filters, pagination, and sorting.
 */
export async function findMany(
  filters: BonusFilters = {},
  page = 1,
  pageSize = 10,
  sort: BonusSort = { field: 'createdAt', order: 'desc' }
) {
  const where = buildWhereClause(filters);
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.bonus.findMany({
      where,
      select: bonusSelectWithRelations,
      skip,
      take: pageSize,
      orderBy: { [sort.field]: sort.order },
    }),
    prisma.bonus.count({ where }),
  ]);

  return { items, total };
}

/**
 * Find a single bonus by ID.
 */
export async function findById(id: string) {
  return prisma.bonus.findUnique({
    where: { id },
    select: bonusSelectWithRelations,
  });
}

/**
 * Create a new bonus suggestion.
 */
export async function create(data: {
  employeeId: string;
  amount: number;
  reason: string;
  suggestedById: string;
}) {
  return prisma.bonus.create({
    data,
    select: bonusSelectWithRelations,
  });
}

/**
 * Update bonus status (approve/reject).
 */
export async function updateStatus(
  id: string,
  status: ApprovalStatus,
  approvedById?: string,
  approvalNotes?: string
) {
  return prisma.bonus.update({
    where: { id },
    data: {
      status,
      approvedById: approvedById ?? null,
      approvedAt: approvedById ? new Date() : null,
      approvalNotes: approvalNotes ?? null,
    },
    select: bonusSelectWithRelations,
  });
}

/**
 * Mark bonus as included in a specific payroll run.
 */
export async function markAsIncludedInPayroll(
  id: string,
  month: number,
  year: number
) {
  return prisma.bonus.update({
    where: { id },
    data: {
      isIncludedInPayroll: true,
      payrollMonth: month,
      payrollYear: year,
    },
  });
}

/**
 * Find all approved bonuses not yet included in payroll for a given period.
 */
export async function findUnpaidApproved(month: number, year: number) {
  return prisma.bonus.findMany({
    where: {
      status: 'APPROVED',
      isIncludedInPayroll: false,
    },
    select: bonusSelectWithRelations,
  });
}

// ==================== HELPERS ====================

function buildWhereClause(filters: BonusFilters) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.employeeId) {
    where.employeeId = filters.employeeId;
  }

  if (filters.search) {
    const search = filters.search.trim();
    where.OR = [
      { reason: { contains: search, mode: 'insensitive' } },
      { suggestedBy: { firstName: { contains: search, mode: 'insensitive' } } },
      { suggestedBy: { lastName: { contains: search, mode: 'insensitive' } } },
    ];
  }

  return where;
}
