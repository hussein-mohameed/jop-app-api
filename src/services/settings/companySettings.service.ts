/**
 * @file Company settings service — business logic for global configuration.
 * Validates settings before saving and provides helper functions.
 */

import 'server-only';
import * as settingsRepo from '@/repositories/companySettings.repository';
import type { ApiResponse } from '@/types/common.types';

export interface DisciplineStep {
  step: number;
  name: string;
  deductionPct: number;
  isTermination: boolean;
}

// ==================== QUERIES ====================

export async function getSettings(): Promise<ApiResponse<unknown>> {
  try {
    const settings = await settingsRepo.getSettings();
    return { success: true, data: settings };
  } catch (error) {
    return { success: false, error: `Failed to get settings: ${String(error)}` };
  }
}

export async function getDisciplineSteps(): Promise<DisciplineStep[]> {
  const settings = await settingsRepo.getSettings();
  return settings.disciplineSteps as unknown as DisciplineStep[];
}

export async function getDailyRate(monthlySalary: number): Promise<number> {
  const settings = await settingsRepo.getSettings();
  return monthlySalary / settings.salaryDaySystem;
}

// ==================== MUTATIONS ====================

export async function updateSettings(data: {
  companyName?: string;
  salaryDaySystem?: number;
  defaultVacationDays?: number;
  workingHoursPerDay?: number;
  lateGraceMinutes?: number;
  overtimeMultiplier?: number;
  disciplineSteps?: DisciplineStep[];
}): Promise<ApiResponse<unknown>> {
  try {
    // Validate salaryDaySystem
    if (data.salaryDaySystem !== undefined && ![22, 30].includes(data.salaryDaySystem)) {
      return { success: false, error: 'Salary day system must be 22 or 30' };
    }

    // Validate discipline steps
    if (data.disciplineSteps) {
      if (!Array.isArray(data.disciplineSteps) || data.disciplineSteps.length < 2) {
        return { success: false, error: 'Discipline steps must have at least 2 steps' };
      }

      // Ensure steps are numbered sequentially
      for (let i = 0; i < data.disciplineSteps.length; i++) {
        const step = data.disciplineSteps[i];
        if (step.step !== i + 1) {
          return { success: false, error: `Step numbers must be sequential. Expected ${i + 1}, got ${step.step}` };
        }
        if (!step.name || step.name.trim().length === 0) {
          return { success: false, error: `Step ${i + 1} must have a name` };
        }
        if (step.deductionPct < 0 || step.deductionPct > 100) {
          return { success: false, error: `Step ${i + 1} deduction must be 0-100%` };
        }
      }

      // Last step should typically be termination, but not enforced
    }

    const settings = await settingsRepo.updateSettings({
      ...data,
      disciplineSteps: data.disciplineSteps as unknown as object,
    });

    return { success: true, data: settings, message: 'Settings updated successfully' };
  } catch (error) {
    return { success: false, error: `Failed to update settings: ${String(error)}` };
  }
}
