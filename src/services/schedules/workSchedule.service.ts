/**
 * @file Work schedule service — business logic for work schedule management.
 * 
 * Schedule resolution order:
 *  1. Employee's custom schedule (EmployeeWorkSchedule)
 *  2. Company default schedule (CompanySettings)
 *
 * Default: Sat-Thu (9:00-16:00), Friday off.
 * Managers and authorized HR can set custom schedules per employee.
 * Company admin can modify the company-wide defaults.
 */

import 'server-only';
import * as scheduleRepo from '@/repositories/workSchedule.repository';
import * as settingsRepo from '@/repositories/companySettings.repository';
import type { ApiResponse } from '@/types/common.types';

// ==================== TYPES ====================

export interface EffectiveSchedule {
  workStartTime: string;  // HH:mm
  workEndTime: string;    // HH:mm
  workDays: number[];     // 0=Sun..6=Sat
  isCustom: boolean;      // true if using employee-specific schedule
}

// ==================== SCHEDULE RESOLUTION ====================

/**
 * Get the effective work schedule for an employee.
 * Checks employee-specific schedule first, falls back to company defaults.
 */
export async function getEffectiveSchedule(
  employeeId: string
): Promise<EffectiveSchedule> {
  // Check for custom employee schedule
  const custom = await scheduleRepo.findByEmployeeId(employeeId);

  if (custom) {
    return {
      workStartTime: custom.workStartTime,
      workEndTime: custom.workEndTime,
      workDays: custom.workDays as number[],
      isCustom: true,
    };
  }

  // Fall back to company defaults
  const settings = await settingsRepo.getSettings();

  return {
    workStartTime: settings.defaultWorkStartTime,
    workEndTime: settings.defaultWorkEndTime,
    workDays: settings.defaultWorkDays as number[],
    isCustom: false,
  };
}

/**
 * Check if a given date is a working day for the employee.
 */
export async function isWorkingDay(
  employeeId: string,
  date: Date
): Promise<boolean> {
  const schedule = await getEffectiveSchedule(employeeId);
  const dayOfWeek = date.getDay(); // 0=Sun..6=Sat
  return schedule.workDays.includes(dayOfWeek);
}

/**
 * Parse HH:mm time string to hours and minutes.
 */
function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
}

/**
 * Check if a timestamp falls within the employee's working hours.
 * Returns validation result with a descriptive message.
 */
export async function validateWorkingTime(
  employeeId: string,
  now: Date
): Promise<{ allowed: boolean; message: string; lateMinutes: number }> {
  const schedule = await getEffectiveSchedule(employeeId);

  // Check working day
  const dayOfWeek = now.getDay();
  if (!schedule.workDays.includes(dayOfWeek)) {
    const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return {
      allowed: false,
      message: `اليوم (${dayNames[dayOfWeek]}) ليس يوم عمل رسمي`,
      lateMinutes: 0,
    };
  }

  // Check if within working hours
  const start = parseTime(schedule.workStartTime);
  const end = parseTime(schedule.workEndTime);

  const startDate = new Date(now);
  startDate.setHours(start.hours, start.minutes, 0, 0);

  const endDate = new Date(now);
  endDate.setHours(end.hours, end.minutes, 0, 0);

  // Allow clock-in after work end → rejected
  if (now > endDate) {
    return {
      allowed: false,
      message: `انتهى وقت الدوام الرسمي (${schedule.workEndTime})`,
      lateMinutes: 0,
    };
  }

  // Calculate late minutes if after start time
  let lateMinutes = 0;
  if (now > startDate) {
    lateMinutes = Math.round((now.getTime() - startDate.getTime()) / 60_000);
  }

  return { allowed: true, message: '', lateMinutes };
}

// ==================== EMPLOYEE SCHEDULE MANAGEMENT ====================

/**
 * Set a custom work schedule for an employee.
 * Only managers, authorized HR, and company admin can do this.
 */
export async function setEmployeeSchedule(
  employeeId: string,
  schedule: { workStartTime: string; workEndTime: string; workDays: number[] },
  setById: string
): Promise<ApiResponse<unknown>> {
  try {
    // Validate time range
    const start = parseTime(schedule.workStartTime);
    const end = parseTime(schedule.workEndTime);
    const startMin = start.hours * 60 + start.minutes;
    const endMin = end.hours * 60 + end.minutes;

    if (endMin <= startMin) {
      return { success: false, error: 'وقت الانتهاء يجب أن يكون بعد وقت البدء' };
    }

    const result = await scheduleRepo.upsert({
      employeeId,
      workStartTime: schedule.workStartTime,
      workEndTime: schedule.workEndTime,
      workDays: schedule.workDays,
      setById,
    });

    return {
      success: true,
      data: result,
      message: 'تم تعيين جدول العمل المخصص بنجاح',
    };
  } catch (error) {
    return { success: false, error: `فشل في تعيين جدول العمل: ${String(error)}` };
  }
}

/**
 * Reset an employee's schedule back to company defaults.
 */
export async function resetToDefault(
  employeeId: string
): Promise<ApiResponse<unknown>> {
  try {
    await scheduleRepo.deleteByEmployeeId(employeeId);
    return {
      success: true,
      data: null,
      message: 'تم إعادة الجدول إلى الإعدادات الافتراضية',
    };
  } catch (error) {
    // If record doesn't exist, that's fine — already on defaults
    if (String(error).includes('Record to delete does not exist')) {
      return { success: true, data: null, message: 'الموظف يستخدم الجدول الافتراضي بالفعل' };
    }
    return { success: false, error: `فشل في إعادة الجدول: ${String(error)}` };
  }
}

/**
 * Get an employee's schedule (custom or default).
 */
export async function getEmployeeSchedule(
  employeeId: string
): Promise<ApiResponse<EffectiveSchedule>> {
  try {
    const schedule = await getEffectiveSchedule(employeeId);
    return { success: true, data: schedule };
  } catch (error) {
    return { success: false, error: `فشل في جلب جدول العمل: ${String(error)}` };
  }
}
