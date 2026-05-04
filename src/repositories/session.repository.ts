/**
 * @file Session repository — data layer for work sessions and breaks.
 * Handles daily session CRUD, break tracking, and attendance statistics.
 */

import 'server-only';
import prisma from '@/lib/prisma';
import type { WorkSessionStatus, BreakType } from '@prisma/client';

const sessionSelect = {
  id: true, employeeId: true, date: true,
  clockIn: true, clockOut: true, status: true,
  totalWorkMin: true, totalBreakMin: true,
  isLate: true, lateMinutes: true,
  isOvertime: true, overtimeMin: true,
  ipAddress: true, notes: true,
  createdAt: true, updatedAt: true,
  breaks: {
    select: {
      id: true, type: true, slotName: true, sortOrder: true,
      startedAt: true, endedAt: true, durationMin: true,
    },
    orderBy: { sortOrder: 'asc' as const },
  },
} as const;

// ==================== SESSION QUERIES ====================

export async function findTodaySession(employeeId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return prisma.workSession.findFirst({
    where: {
      employeeId,
      date: { gte: today, lt: tomorrow },
    },
    select: sessionSelect,
  });
}

export async function createSession(data: {
  employeeId: string;
  date: Date;
  clockIn: Date;
  isLate?: boolean;
  lateMinutes?: number;
  ipAddress?: string;
  notes?: string;
}) {
  return prisma.workSession.create({
    data,
    select: sessionSelect,
  });
}

export async function updateSession(
  id: string,
  data: {
    clockOut?: Date;
    status?: WorkSessionStatus;
    totalWorkMin?: number;
    totalBreakMin?: number;
    isOvertime?: boolean;
    overtimeMin?: number;
  }
) {
  return prisma.workSession.update({
    where: { id },
    data,
    select: sessionSelect,
  });
}

// ==================== BREAK QUERIES ====================

export async function createBreak(data: {
  sessionId: string;
  type: BreakType;
  slotName?: string;
  sortOrder: number;
  startedAt: Date;
}) {
  return prisma.sessionBreak.create({ data });
}

export async function endBreak(breakId: string, endedAt: Date, durationMin: number) {
  return prisma.sessionBreak.update({
    where: { id: breakId },
    data: { endedAt, durationMin },
  });
}

export async function findActiveBreak(sessionId: string) {
  return prisma.sessionBreak.findFirst({
    where: { sessionId, endedAt: null },
  });
}

// ==================== HISTORY & ANALYTICS ====================

export async function findSessionsByDateRange(
  employeeId: string,
  from: Date,
  to: Date
) {
  return prisma.workSession.findMany({
    where: {
      employeeId,
      date: { gte: from, lte: to },
    },
    select: sessionSelect,
    orderBy: { date: 'asc' },
  });
}

/**
 * Count completed work days in a given month for payroll.
 */
export async function countWorkedDays(
  employeeId: string,
  month: number,
  year: number
): Promise<number> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const count = await prisma.workSession.count({
    where: {
      employeeId,
      date: { gte: startDate, lte: endDate },
      status: 'COMPLETED',
    },
  });

  return count;
}

/**
 * Monthly statistics for an employee.
 */
export async function getMonthlyStats(
  employeeId: string,
  month: number,
  year: number
) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const sessions = await prisma.workSession.findMany({
    where: {
      employeeId,
      date: { gte: startDate, lte: endDate },
      status: 'COMPLETED',
    },
    select: {
      totalWorkMin: true,
      totalBreakMin: true,
      isLate: true,
      lateMinutes: true,
      isOvertime: true,
      overtimeMin: true,
    },
  });

  return {
    totalDays: sessions.length,
    totalWorkMin: sessions.reduce((s, r) => s + r.totalWorkMin, 0),
    totalBreakMin: sessions.reduce((s, r) => s + r.totalBreakMin, 0),
    lateDays: sessions.filter((r) => r.isLate).length,
    totalLateMin: sessions.reduce((s, r) => s + r.lateMinutes, 0),
    overtimeDays: sessions.filter((r) => r.isOvertime).length,
    totalOvertimeMin: sessions.reduce((s, r) => s + r.overtimeMin, 0),
  };
}
