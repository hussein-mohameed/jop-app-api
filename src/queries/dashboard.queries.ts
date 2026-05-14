/**
 * @file Dashboard queries — server-only aggregated data for role-based dashboards.
 * Provides real data to Manager, HR, and Admin dashboards.
 */

import 'server-only';
import prisma from '@/lib/prisma';

/** Get manager dashboard data (for their department) */
export async function getManagerDashboardData(userId: string) {
  // Find the manager's department
  const employee = await prisma.employee.findUnique({
    where: { userId },
    select: { departmentId: true },
  });

  if (!employee) return null;
  const deptId = employee.departmentId;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [teamCount, todaySessions, pendingLeaves, activeWarnings] = await Promise.all([
    prisma.employee.count({
      where: { departmentId: deptId, employmentStatus: 'ACTIVE' },
    }),
    prisma.workSession.findMany({
      where: {
        employee: { departmentId: deptId },
        date: today,
      },
      select: {
        status: true,
        isLate: true,
        employee: {
          select: {
            user: { select: { firstName: true, lastName: true } },
            employeeId: true,
          },
        },
      },
    }),
    prisma.leave.count({
      where: {
        status: 'PENDING',
        employee: { employee: { departmentId: deptId } },
      },
    }),
    prisma.employeeWarning.count({
      where: {
        employee: { departmentId: deptId },
        status: 'ACTIVE',
      },
    }),
  ]);

  const presentToday = todaySessions.length;
  const lateToday = todaySessions.filter((s) => s.isLate).length;
  const absentToday = teamCount - presentToday;

  // Weekly attendance data (last 7 days)
  const weeklyData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const count = await prisma.workSession.count({
      where: {
        employee: { departmentId: deptId },
        date: { gte: dayStart, lte: dayEnd },
      },
    });

    weeklyData.push({
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      present: count,
      total: teamCount,
    });
  }

  return {
    teamCount,
    presentToday,
    lateToday,
    absentToday,
    pendingLeaves,
    activeWarnings,
    todaySessions: todaySessions.map((s) => ({
      name: `${s.employee.user.firstName} ${s.employee.user.lastName}`,
      employeeId: s.employee.employeeId,
      status: s.status,
      isLate: s.isLate,
    })),
    weeklyAttendance: weeklyData,
  };
}

/** Get HR dashboard data (company-wide) */
export async function getHRDashboardData() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalEmployees,
    activeEmployees,
    todaySessionCount,
    pendingLeaves,
    pendingBonuses,
    departmentStats,
    employmentTypes,
  ] = await Promise.all([
    prisma.employee.count(),
    prisma.employee.count({ where: { employmentStatus: 'ACTIVE' } }),
    prisma.workSession.count({ where: { date: today } }),
    prisma.leave.count({ where: { status: 'PENDING' } }),
    prisma.bonus.count({ where: { status: 'PENDING' } }),
    // Department attendance
    prisma.department.findMany({
      where: { isActive: true },
      select: {
        name: true,
        _count: { select: { employees: true } },
      },
    }),
    // Employment type breakdown
    prisma.employee.groupBy({
      by: ['employmentType'],
      where: { employmentStatus: 'ACTIVE' },
      _count: true,
    }),
  ]);

  const attendanceRate = activeEmployees > 0
    ? Math.round((todaySessionCount / activeEmployees) * 100)
    : 0;

  return {
    totalEmployees,
    activeEmployees,
    todayPresent: todaySessionCount,
    attendanceRate,
    pendingLeaves,
    pendingBonuses,
    departmentStats: departmentStats.map((d) => ({
      name: d.name,
      employees: d._count.employees,
    })),
    employmentTypes: employmentTypes.map((t) => ({
      type: t.employmentType,
      count: t._count,
    })),
  };
}
