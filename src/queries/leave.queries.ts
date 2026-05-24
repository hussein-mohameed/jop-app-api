/**
 * @file Leave queries — server-only data fetching for leave records.
 * Used by Server Components to fetch data securely before rendering.
 */

import 'server-only';
import prisma from '@/lib/prisma';

export interface LeaveHistoryRecord {
  id: string;
  leaveTypeName: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason: string;
  status: string;
  createdAt: Date;
}

export interface EmployeeLeaveBalance {
  leaveTypeId: string;
  leaveTypeName: string;
  leaveTypeCode: string;
  totalDays: number;
  usedDays: number;
  pendingDays: number;
  color: string;
}



/** Get all leave requests for an employee */
export async function getEmployeeLeaves(employeeId: string): Promise<LeaveHistoryRecord[]> {
  const leaves = await prisma.leave.findMany({
    where: { employeeId },
    include: {
      leaveType: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return leaves.map((leave) => ({
    id: leave.id,
    leaveTypeName: leave.leaveType.name,
    startDate: leave.startDate,
    endDate: leave.endDate,
    totalDays: leave.totalDays,
    reason: leave.reason,
    status: leave.status,
    createdAt: leave.createdAt,
  }));
}

/** Get leave balances for an employee for a specific year */
export async function getEmployeeLeaveBalances(employeeId: string, year: number): Promise<EmployeeLeaveBalance[]> {
  const balances = await prisma.leaveBalance.findMany({
    where: { employeeId, year },
    include: {
      leaveType: {
        select: { name: true, code: true, color: true },
      },
    },
  });

  return balances.map((b) => ({
    leaveTypeId: b.leaveTypeId,
    leaveTypeName: b.leaveType.name,
    leaveTypeCode: b.leaveType.code,
    totalDays: b.totalDays,
    usedDays: b.usedDays,
    pendingDays: b.pendingDays,
    color: b.leaveType.color || '#6366f1',
  }));
}

/** Get all active leave types */
export async function getActiveLeaveTypes() {
  return prisma.leaveType.findMany({
    where: { isActive: true },
    select: { id: true, name: true, code: true, isPaid: true, color: true },
    orderBy: { name: 'asc' },
  });
}
