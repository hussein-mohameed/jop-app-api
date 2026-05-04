/**
 * @file Payroll service — business logic for salary and payroll operations.
 * NO direct database calls — delegates to repository.
 *
 * Business rules:
 * - Only one active salary per employee at a time
 * - Payroll run calculates gross/net from salary components + approved bonuses
 * - Payroll run is idempotent (upsert) — re-running overwrites previous calculations
 * - Percentage-based components are calculated against base salary
 * - Absence deductions based on salaryDaySystem (22 or 30) from CompanySettings
 * - Warning deductions from progressive discipline system
 */

import 'server-only';
import * as payrollRepo from '@/repositories/payroll.repository';
import * as bonusRepo from '@/repositories/bonus.repository';
import type { ApiResponse, PaginatedResponse } from '@/types/common.types';
import type {
  CreateSalaryFormData,
  UpdateSalaryFormData,
  RunPayrollFormData,
  SalaryQueryParams,
  PayslipQueryParams,
} from '@/schemas/payroll.schema';

// ==================== SALARY QUERIES ====================

export async function listSalaries(
  params: SalaryQueryParams
): Promise<ApiResponse<PaginatedResponse<unknown>>> {
  try {
    const { items, total } = await payrollRepo.findSalaries(
      { employeeId: params.employeeId, isActive: params.isActive },
      params.page, params.pageSize,
      { field: params.sortBy, order: params.sortOrder }
    );
    return {
      success: true,
      data: { items, total, page: params.page, pageSize: params.pageSize, totalPages: Math.ceil(total / params.pageSize) },
    };
  } catch (error) {
    return { success: false, error: `Failed to list salaries: ${String(error)}` };
  }
}

export async function createSalary(data: CreateSalaryFormData): Promise<ApiResponse<unknown>> {
  try {
    const salary = await payrollRepo.createSalary({
      employeeId: data.employeeId,
      baseSalary: data.baseSalary,
      effectiveDate: data.effectiveDate,
      components: data.components.map((c) => ({
        name: c.name,
        type: c.type as import('@prisma/client').SalaryComponentType,
        amount: c.amount,
        isPercentage: c.isPercentage,
        description: c.description || undefined,
      })),
    });
    return { success: true, data: salary, message: 'Salary created successfully' };
  } catch (error) {
    return { success: false, error: `Failed to create salary: ${String(error)}` };
  }
}

export async function updateSalary(id: string, data: UpdateSalaryFormData): Promise<ApiResponse<unknown>> {
  try {
    const existing = await payrollRepo.findSalaryById(id);
    if (!existing) return { success: false, error: 'Salary not found' };
    if (!existing.isActive) return { success: false, error: 'Cannot update an inactive salary' };

    const salary = await payrollRepo.updateSalary(id, {
      baseSalary: data.baseSalary,
      components: data.components?.map((c) => ({
        name: c.name,
        type: c.type as import('@prisma/client').SalaryComponentType,
        amount: c.amount,
        isPercentage: c.isPercentage,
        description: c.description || undefined,
      })),
    });
    return { success: true, data: salary, message: 'Salary updated successfully' };
  } catch (error) {
    return { success: false, error: `Failed to update salary: ${String(error)}` };
  }
}

// ==================== PAYSLIP QUERIES ====================

export async function listPayslips(
  params: PayslipQueryParams
): Promise<ApiResponse<PaginatedResponse<unknown>>> {
  try {
    const { items, total } = await payrollRepo.findPayslips(
      { employeeId: params.employeeId, month: params.month, year: params.year, isPaid: params.isPaid },
      params.page, params.pageSize,
      { field: params.sortBy, order: params.sortOrder }
    );
    return {
      success: true,
      data: { items, total, page: params.page, pageSize: params.pageSize, totalPages: Math.ceil(total / params.pageSize) },
    };
  } catch (error) {
    return { success: false, error: `Failed to list payslips: ${String(error)}` };
  }
}

export async function getPayslip(id: string): Promise<ApiResponse<unknown>> {
  try {
    const payslip = await payrollRepo.findPayslipById(id);
    if (!payslip) return { success: false, error: 'Payslip not found' };
    return { success: true, data: payslip };
  } catch (error) {
    return { success: false, error: `Failed to get payslip: ${String(error)}` };
  }
}

// ==================== PAYROLL RUN ====================

/**
 * Run payroll for a specific month/year.
 * Calculates gross/net for every active employee with a salary,
 * includes approved bonuses, absence deductions, and warning deductions.
 *
 * Formula:
 *   dailyRate = baseSalary / salaryDaySystem (22 or 30)
 *   absenceDeduction = absentDays × dailyRate
 *   warningDeduction = baseSalary × sum(warning deduction %)
 *   grossPay = baseSalary + allowances + bonuses
 *   netPay = grossPay - componentDeductions - absenceDeduction - warningDeduction
 */
export async function runPayroll(data: RunPayrollFormData): Promise<ApiResponse<unknown>> {
  try {
    // Load company settings for salary day system
    const settingsRepo = await import('@/repositories/companySettings.repository');
    const settings = await settingsRepo.getSettings();
    const salaryDaySystem = settings.salaryDaySystem; // 22 or 30

    const employees = await payrollRepo.findActiveEmployeesWithSalary();
    if (employees.length === 0) {
      return { success: false, error: 'No active employees with salary found' };
    }

    // Get unpaid approved bonuses
    const unpaidBonuses = await bonusRepo.findUnpaidApproved(data.month, data.year);

    // Build a map: employeeId → total bonus amount
    const bonusByEmployee = new Map<string, number>();
    for (const b of unpaidBonuses) {
      const current = bonusByEmployee.get(b.employeeId) ?? 0;
      bonusByEmployee.set(b.employeeId, current + b.amount);
    }

    // Import session and warning repos for deductions
    const sessionRepo = await import('@/repositories/session.repository');
    const warningService = await import('@/services/warnings/warning.service');

    // Calculate payslips
    interface PayslipData {
      employeeId: string; month: number; year: number; baseSalary: number;
      totalAllowances: number; totalDeductions: number; totalBonuses: number;
      grossPay: number; netPay: number; components: object;
    }

    const payslipList: PayslipData[] = [];

    for (const emp of employees) {
      const salary = emp.salaries[0];
      if (!salary) continue;

      const baseSalary = salary.baseSalary;
      const dailyRate = baseSalary / salaryDaySystem;
      let totalAllowances = 0;
      let totalDeductions = 0;
      const componentDetails: { name: string; type: string; amount: number }[] = [];

      // Process salary components (allowances, deductions, tax)
      for (const comp of salary.components) {
        const amount = comp.isPercentage
          ? (baseSalary * comp.amount) / 100
          : comp.amount;

        componentDetails.push({ name: comp.name, type: comp.type, amount });

        if (comp.type === 'ALLOWANCE' || comp.type === 'BONUS') {
          totalAllowances += amount;
        } else {
          totalDeductions += amount;
        }
      }

      // === ABSENCE DEDUCTION ===
      const workedDays = await sessionRepo.countWorkedDays(emp.id, data.month, data.year);
      const absentDays = Math.max(0, salaryDaySystem - workedDays);
      const absenceDeduction = Math.round(absentDays * dailyRate * 100) / 100;

      if (absenceDeduction > 0) {
        componentDetails.push({
          name: `Absence (${absentDays} days × $${dailyRate.toFixed(2)})`,
          type: 'DEDUCTION',
          amount: absenceDeduction,
        });
        totalDeductions += absenceDeduction;
      }

      // === WARNING DEDUCTION ===
      const warningResult = await warningService.calculateWarningDeduction(emp.id, data.month, data.year);
      if (warningResult.totalPct > 0) {
        const warningDeduction = Math.round(baseSalary * (warningResult.totalPct / 100) * 100) / 100;
        for (const detail of warningResult.details) {
          if (detail.pct > 0) {
            componentDetails.push({
              name: `${detail.stepName} (${detail.pct}%)`,
              type: 'DEDUCTION',
              amount: Math.round(baseSalary * (detail.pct / 100) * 100) / 100,
            });
          }
        }
        totalDeductions += warningDeduction;
      }

      const totalBonuses = bonusByEmployee.get(emp.id) ?? 0;
      const grossPay = baseSalary + totalAllowances + totalBonuses;
      const netPay = grossPay - totalDeductions;

      payslipList.push({
        employeeId: emp.id,
        month: data.month,
        year: data.year,
        baseSalary,
        totalAllowances,
        totalDeductions,
        totalBonuses,
        grossPay,
        netPay,
        components: componentDetails as object,
      });
    }

    const results = await payrollRepo.createPayslipBatch(payslipList);

    // Mark bonuses as included in payroll
    for (const b of unpaidBonuses) {
      await bonusRepo.markAsIncludedInPayroll(b.id, data.month, data.year);
    }

    return {
      success: true,
      data: {
        totalEmployees: results.length,
        month: data.month,
        year: data.year,
        salaryDaySystem,
        totalGrossPay: payslipList.reduce((s: number, p: PayslipData) => s + p.grossPay, 0),
        totalNetPay: payslipList.reduce((s: number, p: PayslipData) => s + p.netPay, 0),
      },
      message: `Payroll processed for ${results.length} employees (${salaryDaySystem}-day system)`,
    };
  } catch (error) {
    return { success: false, error: `Failed to run payroll: ${String(error)}` };
  }
}
