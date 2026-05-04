/**
 * @file Break policy service — business logic for department rest schedules.
 * Validates break slot times and manages FIXED/FLEXIBLE/NONE modes.
 */

import 'server-only';
import * as breakPolicyRepo from '@/repositories/breakPolicy.repository';
import type { ApiResponse } from '@/types/common.types';
import type { BreakPolicyMode, BreakType } from '@prisma/client';

export interface BreakSlotInput {
  name: string;
  type: BreakType;
  startTime: string;  // HH:mm
  endTime: string;    // HH:mm
  durationMin: number;
  sortOrder: number;
  isRequired: boolean;
}

// ==================== QUERIES ====================

export async function getByDepartment(departmentId: string): Promise<ApiResponse<unknown>> {
  try {
    const policy = await breakPolicyRepo.findByDepartmentId(departmentId);
    if (!policy) {
      return { success: true, data: null, message: 'No break policy set for this department' };
    }
    return { success: true, data: policy };
  } catch (error) {
    return { success: false, error: `Failed to get break policy: ${String(error)}` };
  }
}

export async function listAll(): Promise<ApiResponse<unknown>> {
  try {
    const policies = await breakPolicyRepo.findAll();
    return { success: true, data: policies };
  } catch (error) {
    return { success: false, error: `Failed to list break policies: ${String(error)}` };
  }
}

// ==================== MUTATIONS ====================

export async function upsertPolicy(
  departmentId: string,
  mode: BreakPolicyMode,
  totalBreakMin: number,
  slots: BreakSlotInput[]
): Promise<ApiResponse<unknown>> {
  try {
    // NONE mode: no slots needed
    if (mode === 'NONE') {
      const policy = await breakPolicyRepo.upsertPolicy(departmentId, mode, 0, []);
      return { success: true, data: policy, message: 'No-break policy set' };
    }

    // FLEXIBLE mode: slots optional, totalBreakMin required
    if (mode === 'FLEXIBLE') {
      if (totalBreakMin <= 0) {
        return { success: false, error: 'Total break minutes must be > 0 for flexible mode' };
      }
      const policy = await breakPolicyRepo.upsertPolicy(departmentId, mode, totalBreakMin, slots);
      return { success: true, data: policy, message: 'Flexible break policy set' };
    }

    // FIXED mode: validate slots
    if (slots.length === 0) {
      return { success: false, error: 'Fixed mode requires at least one break slot' };
    }

    // Validate each slot
    for (const slot of slots) {
      if (!isValidTime(slot.startTime) || !isValidTime(slot.endTime)) {
        return { success: false, error: `Invalid time format in slot "${slot.name}". Use HH:mm` };
      }
      if (slot.startTime >= slot.endTime) {
        return { success: false, error: `Start time must be before end time in slot "${slot.name}"` };
      }
      if (slot.durationMin <= 0) {
        return { success: false, error: `Duration must be > 0 in slot "${slot.name}"` };
      }
    }

    // Check for overlapping slots
    const sorted = [...slots].sort((a, b) => a.startTime.localeCompare(b.startTime));
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].startTime < sorted[i - 1].endTime) {
        return { success: false, error: `Break slots "${sorted[i - 1].name}" and "${sorted[i].name}" overlap` };
      }
    }

    // Compute total break from slots
    const computedTotal = slots.reduce((s, sl) => s + sl.durationMin, 0);

    const policy = await breakPolicyRepo.upsertPolicy(departmentId, mode, computedTotal, slots);
    return { success: true, data: policy, message: 'Fixed break policy set' };
  } catch (error) {
    return { success: false, error: `Failed to set break policy: ${String(error)}` };
  }
}

// ==================== HELPERS ====================

function isValidTime(time: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
}
