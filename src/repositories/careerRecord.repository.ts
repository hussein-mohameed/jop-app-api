/**
 * @file Career record repository — data layer for employee career history.
 * Tracks every position/role change with salary, hours, and department info.
 *
 * Design: Each position change creates a new record. The previous active
 * record is closed (endDate set) before the new one is created.
 */

import 'server-only';
import prisma from '@/lib/prisma';

const careerSelect = {
  id: true,
  employeeId: true,
  position: true,
  departmentId: true,
  baseSalary: true,
  workingHoursPerDay: true,
  startDate: true,
  endDate: true,
  isActive: true,
  reason: true,
  changedById: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  department: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
  changedBy: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  },
} as const;

// ==================== QUERIES ====================

/**
 * Find all career records for an employee, newest first.
 */
export async function findByEmployeeId(
  employeeId: string,
  page = 1,
  pageSize = 20
) {
  const where = { employeeId };
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.careerRecord.findMany({
      where,
      select: careerSelect,
      skip,
      take: pageSize,
      orderBy: { startDate: 'desc' },
    }),
    prisma.careerRecord.count({ where }),
  ]);

  return { items, total };
}

/**
 * Find the currently active career record for an employee.
 */
export async function findActiveByEmployeeId(employeeId: string) {
  return prisma.careerRecord.findFirst({
    where: { employeeId, isActive: true },
    select: careerSelect,
  });
}

/**
 * Get full career history (no pagination) for summary views.
 */
export async function getFullHistory(employeeId: string) {
  return prisma.careerRecord.findMany({
    where: { employeeId },
    select: careerSelect,
    orderBy: { startDate: 'asc' },
  });
}

// ==================== MUTATIONS ====================

/**
 * Create a new career record.
 */
export async function create(data: {
  employeeId: string;
  position: string;
  departmentId: string;
  baseSalary: number;
  workingHoursPerDay: number;
  startDate: Date;
  reason?: string;
  changedById?: string;
  notes?: string;
}) {
  return prisma.careerRecord.create({
    data,
    select: careerSelect,
  });
}

/**
 * Close the currently active career record by setting endDate and isActive=false.
 * Called before creating a new record for the same employee.
 */
export async function closeActive(employeeId: string, endDate: Date) {
  const active = await prisma.careerRecord.findFirst({
    where: { employeeId, isActive: true },
    select: { id: true },
  });

  if (!active) return null;

  return prisma.careerRecord.update({
    where: { id: active.id },
    data: { endDate, isActive: false },
    select: careerSelect,
  });
}
