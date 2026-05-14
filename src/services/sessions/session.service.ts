/**
 * @file Session service — business logic for employee work sessions.
 * Handles clock-in/out, break management, and attendance analytics.
 *
 * Business rules:
 * - One active session per employee per day
 * - Breaks follow department policy (FIXED/FLEXIBLE/NONE)
 * - Clock-in validates working day and hours from employee/company schedule
 * - Late detection based on schedule start time + grace period
 * - Overtime detection based on working hours per day
 */

import 'server-only';
import * as sessionRepo from '@/repositories/session.repository';
import * as breakPolicyRepo from '@/repositories/breakPolicy.repository';
import * as settingsRepo from '@/repositories/companySettings.repository';
import * as workScheduleService from '@/services/schedules/workSchedule.service';
import prisma from '@/lib/prisma';
import type { ApiResponse } from '@/types/common.types';
import type { BreakType } from '@prisma/client';

// ==================== HELPER ====================

async function ensureEmployee(userId: string) {
  let employee = await prisma.employee.findUnique({
    where: { userId },
    select: { id: true, departmentId: true },
  });

  if (!employee) {
    let dept = await prisma.department.findFirst();
    if (!dept) {
      dept = await prisma.department.create({
        data: { name: `Default Dept ${Date.now()}`, code: `DEF${Date.now().toString().slice(-4)}`, description: 'Auto-generated' },
      });
    }
    employee = await prisma.employee.create({
      data: {
        userId,
        employeeId: `EMP-${Math.floor(Math.random() * 100000)}`,
        departmentId: dept.id,
        position: 'Employee',
        hireDate: new Date(),
      },
      select: { id: true, departmentId: true },
    });
  }
  return employee;
}

// ==================== CLOCK IN ====================

export async function clockIn(
  userId: string,
  ipAddress?: string,
  notes?: string
): Promise<ApiResponse<unknown>> {
  try {
    // Get employee from user
    const employee = await ensureEmployee(userId);

    // Check for existing session today
    const existing = await sessionRepo.findTodaySession(employee.id);
    if (existing) {
      if (existing.status === 'COMPLETED') {
        return { success: false, error: 'You have already completed your session for today' };
      }
      return { success: false, error: 'You already have an active session' };
    }

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    // ============ WORK SCHEDULE VALIDATION ============
    // Validate working day and hours using employee/company schedule
    const scheduleCheck = await workScheduleService.validateWorkingTime(employee.id, now);

    if (!scheduleCheck.allowed) {
      return { success: false, error: scheduleCheck.message };
    }

    // ============ LATE DETECTION ============
    // Use schedule-based late detection with grace period from company settings
    const settings = await settingsRepo.getSettings();
    const schedule = await workScheduleService.getEffectiveSchedule(employee.id);

    const [startH, startM] = schedule.workStartTime.split(':').map(Number);
    const shiftStart = new Date(today);
    shiftStart.setHours(startH, startM, 0, 0);

    const graceEnd = new Date(shiftStart.getTime() + settings.lateGraceMinutes * 60_000);

    let isLate = false;
    let lateMinutes = 0;

    if (now > graceEnd) {
      isLate = true;
      lateMinutes = Math.round((now.getTime() - shiftStart.getTime()) / 60_000);
    }

    const session = await sessionRepo.createSession({
      employeeId: employee.id,
      date: today,
      clockIn: now,
      isLate,
      lateMinutes,
      ipAddress,
      notes,
    });

    return {
      success: true,
      data: session,
      message: isLate
        ? `Clocked in (${lateMinutes} min late)`
        : 'Clocked in successfully',
    };
  } catch (error) {
    return { success: false, error: `Failed to clock in: ${String(error)}` };
  }
}

// ==================== CLOCK OUT ====================

export async function clockOut(userId: string): Promise<ApiResponse<unknown>> {
  try {
    const employee = await ensureEmployee(userId);

    const session = await sessionRepo.findTodaySession(employee.id);
    if (!session) return { success: false, error: 'No active session found' };
    if (session.status === 'COMPLETED') return { success: false, error: 'Session already completed' };

    // End any open break first
    if (session.status === 'ON_BREAK') {
      const activeBreak = await sessionRepo.findActiveBreak(session.id);
      if (activeBreak) {
        const breakDuration = Math.round(
          (Date.now() - new Date(activeBreak.startedAt).getTime()) / 60_000
        );
        await sessionRepo.endBreak(activeBreak.id, new Date(), breakDuration);
      }
    }

    const now = new Date();
    const totalMinutes = Math.round(
      (now.getTime() - new Date(session.clockIn).getTime()) / 60_000
    );
    const totalBreakMin = session.breaks.reduce(
      (s, b) => s + (b.durationMin ?? 0),
      0
    ) + (session.status === 'ON_BREAK'
      ? Math.round((now.getTime() - new Date(session.breaks[session.breaks.length - 1]?.startedAt ?? now).getTime()) / 60_000)
      : 0);
    const totalWorkMin = totalMinutes - totalBreakMin;

    // Check overtime
    const settings = await settingsRepo.getSettings();
    const fullDayMin = settings.workingHoursPerDay * 60;
    const isOvertime = totalWorkMin > fullDayMin;
    const overtimeMin = isOvertime ? Math.round(totalWorkMin - fullDayMin) : 0;

    const updated = await sessionRepo.updateSession(session.id, {
      clockOut: now,
      status: 'COMPLETED',
      totalWorkMin,
      totalBreakMin,
      isOvertime,
      overtimeMin,
    });

    return {
      success: true,
      data: updated,
      message: `Clocked out — ${Math.floor(totalWorkMin / 60)}h ${totalWorkMin % 60}m worked`,
    };
  } catch (error) {
    return { success: false, error: `Failed to clock out: ${String(error)}` };
  }
}

// ==================== BREAKS ====================

export async function startBreak(
  userId: string,
  breakType: BreakType,
  slotName?: string
): Promise<ApiResponse<unknown>> {
  try {
    const employee = await ensureEmployee(userId);

    const session = await sessionRepo.findTodaySession(employee.id);
    if (!session) return { success: false, error: 'No active session. Clock in first.' };
    if (session.status !== 'ACTIVE') {
      return { success: false, error: `Cannot start break — session status is ${session.status}` };
    }

    // Check department break policy
    const policy = await breakPolicyRepo.findByDepartmentId(employee.departmentId);
    if (policy?.mode === 'NONE') {
      return { success: false, error: 'Your department has no scheduled breaks (task-based)' };
    }

    // Determine sort order (next in sequence)
    const nextOrder = session.breaks.length;

    // For FIXED mode, validate against expected slot
    if (policy?.mode === 'FIXED' && policy.breakSlots.length > 0) {
      const expectedSlot = policy.breakSlots[nextOrder];
      if (!expectedSlot) {
        return { success: false, error: 'All scheduled breaks have been taken' };
      }
      slotName = expectedSlot.name;
    }

    const newBreak = await sessionRepo.createBreak({
      sessionId: session.id,
      type: breakType,
      slotName: slotName || undefined,
      sortOrder: nextOrder,
      startedAt: new Date(),
    });

    await sessionRepo.updateSession(session.id, { status: 'ON_BREAK' });

    return {
      success: true,
      data: newBreak,
      message: slotName ? `Break started: ${slotName}` : 'Break started',
    };
  } catch (error) {
    return { success: false, error: `Failed to start break: ${String(error)}` };
  }
}

export async function resumeWork(userId: string): Promise<ApiResponse<unknown>> {
  try {
    const employee = await ensureEmployee(userId);

    const session = await sessionRepo.findTodaySession(employee.id);
    if (!session) return { success: false, error: 'No active session found' };
    if (session.status !== 'ON_BREAK') {
      return { success: false, error: 'You are not currently on break' };
    }

    const activeBreak = await sessionRepo.findActiveBreak(session.id);
    if (!activeBreak) {
      return { success: false, error: 'No active break found' };
    }

    const now = new Date();
    const durationMin = Math.round(
      (now.getTime() - new Date(activeBreak.startedAt).getTime()) / 60_000
    );

    await sessionRepo.endBreak(activeBreak.id, now, durationMin);
    await sessionRepo.updateSession(session.id, { status: 'ACTIVE' });

    return {
      success: true,
      data: { breakDuration: durationMin },
      message: `Back to work — break was ${durationMin} min`,
    };
  } catch (error) {
    return { success: false, error: `Failed to resume work: ${String(error)}` };
  }
}

// ==================== QUERIES ====================

export async function getTodaySession(userId: string): Promise<ApiResponse<unknown>> {
  try {
    const employee = await ensureEmployee(userId);

    const session = await sessionRepo.findTodaySession(employee.id);

    // Also load the break policy for UI rendering
    const policy = await breakPolicyRepo.findByDepartmentId(employee.departmentId);

    return {
      success: true,
      data: {
        session,
        breakPolicy: policy || null,
      },
    };
  } catch (error) {
    return { success: false, error: `Failed to get session: ${String(error)}` };
  }
}

export async function getSessionHistory(
  userId: string,
  from: string,
  to: string
): Promise<ApiResponse<unknown>> {
  try {
    const employee = await ensureEmployee(userId);

    const sessions = await sessionRepo.findSessionsByDateRange(
      employee.id,
      new Date(from),
      new Date(to)
    );

    return { success: true, data: sessions };
  } catch (error) {
    return { success: false, error: `Failed to get history: ${String(error)}` };
  }
}

export async function getAnalytics(
  userId: string,
  month: number,
  year: number
): Promise<ApiResponse<unknown>> {
  try {
    const employee = await ensureEmployee(userId);

    const settings = await settingsRepo.getSettings();
    const stats = await sessionRepo.getMonthlyStats(employee.id, month, year);

    return {
      success: true,
      data: {
        ...stats,
        salaryDaySystem: settings.salaryDaySystem,
        absentDays: Math.max(0, settings.salaryDaySystem - stats.totalDays),
        attendanceRate: stats.totalDays > 0
          ? Math.round((stats.totalDays / settings.salaryDaySystem) * 100)
          : 0,
      },
    };
  } catch (error) {
    return { success: false, error: `Failed to get analytics: ${String(error)}` };
  }
}
