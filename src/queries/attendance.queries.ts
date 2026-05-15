/**
 * @file Attendance queries — server-only data fetching for attendance records.
 * Used by Server Components to fetch data securely before rendering.
 */

import 'server-only';
import prisma from '@/lib/prisma';

/** Get attendance summary for an employee or all */
export async function getAttendanceSummary(month: number, year: number, employeeId?: string) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const where = {
    date: {
      gte: startDate,
      lte: endDate,
    },
    ...(employeeId ? { employeeId } : {}),
  };

  const sessions = await prisma.workSession.findMany({
    where,
    include: {
      employee: {
        include: {
          user: { select: { firstName: true, lastName: true } },
        },
      },
    },
    orderBy: { date: 'desc' },
  });

  return sessions.map((session) => ({
    id: session.id,
    date: session.date,
    employeeName: `${session.employee.user.firstName} ${session.employee.user.lastName}`,
    status: session.status,
    isLate: session.isLate,
    lateMinutes: session.lateMinutes,
    totalWorkMin: session.totalWorkMin,
  }));
}

/** Get team attendance for a manager */
export async function getTeamAttendance(departmentId: string, month: number, year: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const sessions = await prisma.workSession.findMany({
    where: {
      employee: { departmentId },
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      employee: {
        include: {
          user: { select: { firstName: true, lastName: true } },
        },
      },
    },
    orderBy: { date: 'desc' },
  });

  return sessions;
}
