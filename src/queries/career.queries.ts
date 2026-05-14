/**
 * @file Career queries — server-only data fetching for career records.
 * Used by Server Components to fetch employee career history securely.
 */

import 'server-only';
import prisma from '@/lib/prisma';

/** Get employee basic info for career page header */
export async function getEmployeeInfo(employeeId: string) {
  return prisma.employee.findUnique({
    where: { id: employeeId },
    select: {
      id: true,
      employeeId: true,
      position: true,
      hireDate: true,
      user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } },
      department: { select: { name: true } },
    },
  });
}

/** Get full career timeline with enriched data per period */
export async function getCareerTimeline(employeeId: string) {
  const records = await prisma.careerRecord.findMany({
    where: { employeeId },
    select: {
      id: true,
      position: true,
      departmentId: true,
      baseSalary: true,
      workingHoursPerDay: true,
      startDate: true,
      endDate: true,
      isActive: true,
      reason: true,
      notes: true,
      department: { select: { name: true } },
      changedBy: { select: { firstName: true, lastName: true } },
    },
    orderBy: { startDate: 'desc' },
  });

  // Enrich each period with summary counts
  const enriched = await Promise.all(
    records.map(async (record) => {
      const dateFilter = {
        gte: record.startDate,
        ...(record.endDate ? { lte: record.endDate } : {}),
      };

      const [bonusCount, warningCount, leaveCount, bonusTotal] = await Promise.all([
        prisma.bonus.count({
          where: { employeeId, createdAt: dateFilter, status: 'APPROVED' },
        }),
        prisma.employeeWarning.count({
          where: { employeeId, issuedAt: dateFilter },
        }),
        prisma.leave.count({
          where: { employee: { employee: { id: employeeId } }, createdAt: dateFilter, status: 'APPROVED' },
        }),
        prisma.bonus.aggregate({
          where: { employeeId, createdAt: dateFilter, status: 'APPROVED' },
          _sum: { amount: true },
        }),
      ]);

      return {
        ...record,
        startDate: record.startDate.toISOString(),
        endDate: record.endDate?.toISOString() ?? null,
        summary: {
          bonuses: bonusCount,
          warnings: warningCount,
          leaves: leaveCount,
          totalBonusAmount: bonusTotal._sum.amount ?? 0,
        },
      };
    })
  );

  return enriched;
}

/** Get salary trend data for chart */
export async function getSalaryTrend(employeeId: string) {
  const records = await prisma.careerRecord.findMany({
    where: { employeeId },
    select: {
      position: true,
      baseSalary: true,
      startDate: true,
    },
    orderBy: { startDate: 'asc' },
  });

  return records.map((r) => ({
    position: r.position,
    salary: r.baseSalary,
    date: r.startDate.toISOString(),
  }));
}
