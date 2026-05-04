/**
 * @file Warning service — business logic for progressive discipline.
 * Auto-advances through discipline steps defined in CompanySettings.
 * On termination step, auto-updates employee status.
 */

import 'server-only';
import * as warningRepo from '@/repositories/warning.repository';
import * as settingsService from '@/services/settings/companySettings.service';
import { notify } from '@/services/notifications/notification.service';
import prisma from '@/lib/prisma';
import type { ApiResponse, PaginatedResponse } from '@/types/common.types';
import type { WarningStatus } from '@prisma/client';

// ==================== QUERIES ====================

export async function listWarnings(
  filters: { employeeId?: string; status?: WarningStatus },
  page = 1,
  pageSize = 20
): Promise<ApiResponse<PaginatedResponse<unknown>>> {
  try {
    const { items, total } = await warningRepo.findMany(filters, page, pageSize);
    return {
      success: true,
      data: {
        items, total, page, pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    return { success: false, error: `Failed to list warnings: ${String(error)}` };
  }
}

// ==================== ISSUE WARNING ====================

export async function issueWarning(
  issuedById: string,
  employeeId: string,
  reason: string,
  description?: string
): Promise<ApiResponse<unknown>> {
  try {
    // Cannot warn yourself
    const issuer = await prisma.user.findUnique({ where: { id: issuedById }, select: { employee: { select: { id: true } } } });
    if (issuer?.employee?.id === employeeId) {
      return { success: false, error: 'You cannot issue a warning to yourself' };
    }

    // Get current warning count to determine next step
    const activeCount = await warningRepo.countActiveWarnings(employeeId);
    const steps = await settingsService.getDisciplineSteps();

    const nextStepNumber = activeCount + 1;
    const stepConfig = steps.find(s => s.step === nextStepNumber);

    if (!stepConfig) {
      // Employee has exceeded all defined steps
      return { success: false, error: `Employee has already reached the maximum discipline step (${activeCount} warnings active)` };
    }

    // Get current month/year for payroll linkage
    const now = new Date();
    const payrollMonth = now.getMonth() + 1;
    const payrollYear = now.getFullYear();

    // Create the warning
    const warning = await warningRepo.create({
      employeeId,
      issuedById,
      stepNumber: stepConfig.step,
      stepName: stepConfig.name,
      reason,
      description,
      deductionPct: stepConfig.deductionPct,
      isTermination: stepConfig.isTermination,
      payrollMonth,
      payrollYear,
    });

    // If termination, update employee status
    if (stepConfig.isTermination) {
      await prisma.employee.update({
        where: { id: employeeId },
        data: {
          employmentStatus: 'TERMINATED',
          terminationDate: now,
        },
      });
    }

    // Get employee user for notification
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { userId: true },
    });

    if (employee) {
      notify({
        userId: employee.userId,
        title: stepConfig.isTermination ? 'Employment Terminated' : `Warning: ${stepConfig.name}`,
        message: stepConfig.isTermination
          ? `Your employment has been terminated. Reason: ${reason}`
          : `You have received a ${stepConfig.name}. Reason: ${reason}${stepConfig.deductionPct > 0 ? `. This results in a ${stepConfig.deductionPct}% salary deduction.` : ''}`,
        type: stepConfig.isTermination ? 'ERROR' : 'WARNING',
      });
    }

    return {
      success: true,
      data: warning,
      message: stepConfig.isTermination
        ? `Employee terminated — ${stepConfig.name} issued`
        : `${stepConfig.name} issued (Step ${stepConfig.step}/${steps.length})`,
    };
  } catch (error) {
    return { success: false, error: `Failed to issue warning: ${String(error)}` };
  }
}

// ==================== UPDATE STATUS ====================

export async function updateWarningStatus(
  warningId: string,
  status: 'REVOKED' | 'APPEALED',
  appealNotes?: string
): Promise<ApiResponse<unknown>> {
  try {
    const existing = await warningRepo.findById(warningId);
    if (!existing) return { success: false, error: 'Warning not found' };
    if (existing.status !== 'ACTIVE') {
      return { success: false, error: `Cannot update a warning that is ${existing.status}` };
    }

    const warning = await warningRepo.updateStatus(
      warningId,
      status as WarningStatus,
      appealNotes
    );

    return {
      success: true,
      data: warning,
      message: `Warning ${status.toLowerCase()}`,
    };
  } catch (error) {
    return { success: false, error: `Failed to update warning: ${String(error)}` };
  }
}

/**
 * Calculate total warning deduction percentage for payroll.
 */
export async function calculateWarningDeduction(
  employeeId: string,
  month: number,
  year: number
): Promise<{ totalPct: number; details: { stepName: string; pct: number }[] }> {
  const warnings = await warningRepo.findActiveForPayroll(employeeId, month, year);
  const details = warnings.map(w => ({ stepName: w.stepName, pct: w.deductionPct }));
  const totalPct = details.reduce((s, d) => s + d.pct, 0);
  return { totalPct, details };
}
