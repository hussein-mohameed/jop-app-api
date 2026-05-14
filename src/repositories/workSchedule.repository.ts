/**
 * @file Work schedule repository — data layer for employee work schedules.
 * Handles custom per-employee schedule CRUD.
 * Falls back to company defaults when no custom schedule exists.
 */

import 'server-only';
import prisma from '@/lib/prisma';

const scheduleSelect = {
  id: true,
  employeeId: true,
  workStartTime: true,
  workEndTime: true,
  workDays: true,
  setById: true,
  createdAt: true,
  updatedAt: true,
} as const;

// ==================== QUERIES ====================

/**
 * Find a custom work schedule for an employee.
 * Returns null if the employee uses company defaults.
 */
export async function findByEmployeeId(employeeId: string) {
  return prisma.employeeWorkSchedule.findUnique({
    where: { employeeId },
    select: scheduleSelect,
  });
}

// ==================== MUTATIONS ====================

/**
 * Create or update a custom work schedule for an employee.
 * Uses upsert to ensure at most one schedule per employee.
 */
export async function upsert(data: {
  employeeId: string;
  workStartTime: string;
  workEndTime: string;
  workDays: number[];
  setById: string;
}) {
  return prisma.employeeWorkSchedule.upsert({
    where: { employeeId: data.employeeId },
    create: {
      employeeId: data.employeeId,
      workStartTime: data.workStartTime,
      workEndTime: data.workEndTime,
      workDays: data.workDays,
      setById: data.setById,
    },
    update: {
      workStartTime: data.workStartTime,
      workEndTime: data.workEndTime,
      workDays: data.workDays,
      setById: data.setById,
    },
    select: scheduleSelect,
  });
}

/**
 * Delete a custom schedule — employee reverts to company defaults.
 */
export async function deleteByEmployeeId(employeeId: string) {
  return prisma.employeeWorkSchedule.delete({
    where: { employeeId },
  });
}
