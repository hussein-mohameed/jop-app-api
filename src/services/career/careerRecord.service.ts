/**
 * @file Career record service — business logic for employee career tracking.
 * 
 * Manages the complete career history of employees, including:
 * - Job title (position) changes
 * - Salary per position
 * - Working hours per position  
 * - Department transfers
 *
 * When an employee's position changes, the active record is closed
 * and a new one is created automatically.
 */

import 'server-only';
import * as careerRepo from '@/repositories/careerRecord.repository';
import prisma from '@/lib/prisma';
import type { ApiResponse, PaginatedResponse } from '@/types/common.types';

// ==================== QUERIES ====================

/**
 * Get paginated career history for an employee.
 */
export async function getCareerHistory(
  employeeId: string,
  page = 1,
  pageSize = 20
): Promise<ApiResponse<PaginatedResponse<unknown>>> {
  try {
    const { items, total } = await careerRepo.findByEmployeeId(employeeId, page, pageSize);
    return {
      success: true,
      data: {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    return { success: false, error: `Failed to get career history: ${String(error)}` };
  }
}

/**
 * Get the currently active career record for an employee.
 */
export async function getCurrentRecord(
  employeeId: string
): Promise<ApiResponse<unknown>> {
  try {
    const record = await careerRepo.findActiveByEmployeeId(employeeId);
    return { success: true, data: record };
  } catch (error) {
    return { success: false, error: `Failed to get current record: ${String(error)}` };
  }
}

/**
 * Get full career history with related data (bonuses, leaves, warnings)
 * for each career period.
 */
export async function getFullCareerTimeline(
  employeeId: string
): Promise<ApiResponse<unknown>> {
  try {
    const records = await careerRepo.getFullHistory(employeeId);

    // Enrich each career period with bonuses, warnings, and leaves
    const enrichedRecords = await Promise.all(
      records.map(async (record) => {
        const dateFilter = {
          gte: record.startDate,
          ...(record.endDate ? { lte: record.endDate } : {}),
        };

        const [bonuses, warnings, leaves] = await Promise.all([
          prisma.bonus.findMany({
            where: {
              employeeId: record.employeeId,
              createdAt: dateFilter,
              status: 'APPROVED',
            },
            select: {
              id: true, amount: true, reason: true,
              createdAt: true, payrollMonth: true, payrollYear: true,
            },
            orderBy: { createdAt: 'asc' },
          }),
          prisma.employeeWarning.findMany({
            where: {
              employeeId,
              issuedAt: dateFilter,
            },
            select: {
              id: true, stepNumber: true, stepName: true,
              reason: true, status: true, issuedAt: true,
              deductionPct: true,
            },
            orderBy: { issuedAt: 'asc' },
          }),
          prisma.leave.findMany({
            where: {
              employee: { employee: { id: employeeId } },
              createdAt: dateFilter,
            },
            select: {
              id: true, startDate: true, endDate: true,
              totalDays: true, reason: true, status: true,
              leaveType: { select: { name: true, code: true } },
            },
            orderBy: { startDate: 'asc' },
          }),
        ]);

        return {
          ...record,
          bonuses,
          warnings,
          leaves,
          summary: {
            totalBonuses: bonuses.reduce((s, b) => s + b.amount, 0),
            totalWarnings: warnings.length,
            totalLeaveDays: leaves
              .filter((l) => l.status === 'APPROVED')
              .reduce((s, l) => s + l.totalDays, 0),
          },
        };
      })
    );

    return { success: true, data: enrichedRecords };
  } catch (error) {
    return { success: false, error: `Failed to get career timeline: ${String(error)}` };
  }
}

// ==================== MUTATIONS ====================

/**
 * Create a new career record for an employee.
 * Closes the currently active record before creating the new one.
 *
 * Called automatically when an employee's position changes,
 * or manually by managers/admins for promotions and transfers.
 */
export async function createCareerRecord(
  employeeId: string,
  data: {
    position: string;
    departmentId: string;
    baseSalary: number;
    workingHoursPerDay: number;
    reason?: string;
    notes?: string;
  },
  changedById?: string
): Promise<ApiResponse<unknown>> {
  try {
    const now = new Date();

    // Close the currently active record
    await careerRepo.closeActive(employeeId, now);

    // Create the new active record
    const record = await careerRepo.create({
      employeeId,
      position: data.position,
      departmentId: data.departmentId,
      baseSalary: data.baseSalary,
      workingHoursPerDay: data.workingHoursPerDay,
      startDate: now,
      reason: data.reason,
      changedById,
      notes: data.notes,
    });

    return {
      success: true,
      data: record,
      message: `تم إنشاء سجل وظيفي جديد: ${data.position}`,
    };
  } catch (error) {
    return { success: false, error: `Failed to create career record: ${String(error)}` };
  }
}

/**
 * Initialize the first career record for a newly created employee.
 * Called once during employee creation.
 */
export async function initializeCareerRecord(
  employeeId: string,
  data: {
    position: string;
    departmentId: string;
    baseSalary: number;
    workingHoursPerDay?: number;
    hireDate: Date;
  },
  changedById?: string
): Promise<void> {
  try {
    // Only create if no record exists yet
    const existing = await careerRepo.findActiveByEmployeeId(employeeId);
    if (existing) return;

    await careerRepo.create({
      employeeId,
      position: data.position,
      departmentId: data.departmentId,
      baseSalary: data.baseSalary,
      workingHoursPerDay: data.workingHoursPerDay ?? 8,
      startDate: data.hireDate,
      changedById,
      reason: 'بداية الخدمة',
    });
  } catch {
    // Non-critical: log but don't fail the parent operation
    console.error(`Failed to initialize career record for ${employeeId}`);
  }
}
