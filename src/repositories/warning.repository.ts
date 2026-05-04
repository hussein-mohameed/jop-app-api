/**
 * @file Warning repository — data layer for employee discipline records.
 * Tracks progressive warnings and provides data for payroll deduction calculation.
 */

import 'server-only';
import prisma from '@/lib/prisma';
import type { WarningStatus } from '@prisma/client';

const warningSelect = {
  id: true, employeeId: true, issuedById: true,
  stepNumber: true, stepName: true,
  reason: true, description: true,
  deductionPct: true, isTermination: true,
  status: true, issuedAt: true, expiresAt: true,
  appealNotes: true,
  payrollMonth: true, payrollYear: true,
  createdAt: true, updatedAt: true,
  employee: {
    select: {
      id: true, employeeId: true,
      user: { select: { firstName: true, lastName: true } },
    },
  },
  issuedBy: {
    select: { id: true, firstName: true, lastName: true },
  },
} as const;

// ==================== QUERIES ====================

export async function findMany(
  filters: { employeeId?: string; status?: WarningStatus } = {},
  page = 1,
  pageSize = 20
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (filters.employeeId) where.employeeId = filters.employeeId;
  if (filters.status) where.status = filters.status;

  const skip = (page - 1) * pageSize;
  const [items, total] = await Promise.all([
    prisma.employeeWarning.findMany({
      where, select: warningSelect, skip, take: pageSize,
      orderBy: { issuedAt: 'desc' },
    }),
    prisma.employeeWarning.count({ where }),
  ]);

  return { items, total };
}

export async function findById(id: string) {
  return prisma.employeeWarning.findUnique({
    where: { id }, select: warningSelect,
  });
}

/**
 * Count active warnings for an employee (determines next step).
 */
export async function countActiveWarnings(employeeId: string): Promise<number> {
  return prisma.employeeWarning.count({
    where: { employeeId, status: 'ACTIVE' },
  });
}

/**
 * Find active warnings for payroll deduction calculation.
 */
export async function findActiveForPayroll(
  employeeId: string,
  month: number,
  year: number
) {
  return prisma.employeeWarning.findMany({
    where: {
      employeeId,
      status: 'ACTIVE',
      OR: [
        { payrollMonth: month, payrollYear: year },
        { payrollMonth: null }, // Ongoing warnings
      ],
    },
    select: { id: true, deductionPct: true, stepName: true },
  });
}

// ==================== MUTATIONS ====================

export async function create(data: {
  employeeId: string;
  issuedById: string;
  stepNumber: number;
  stepName: string;
  reason: string;
  description?: string;
  deductionPct: number;
  isTermination: boolean;
  payrollMonth?: number;
  payrollYear?: number;
  expiresAt?: Date;
}) {
  return prisma.employeeWarning.create({
    data,
    select: warningSelect,
  });
}

export async function updateStatus(
  id: string,
  status: WarningStatus,
  appealNotes?: string
) {
  return prisma.employeeWarning.update({
    where: { id },
    data: { status, ...(appealNotes && { appealNotes }) },
    select: warningSelect,
  });
}
