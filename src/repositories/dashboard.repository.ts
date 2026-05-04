/**
 * @file Dashboard repository — data layer for admin overview metrics.
 * Aggregation queries for KPIs displayed on the admin dashboard.
 * NO business logic — only Prisma queries.
 */

import 'server-only';
import prisma from '@/lib/prisma';

// ==================== TYPES ====================

export interface DashboardCounts {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveEmployees: number;
  terminatedEmployees: number;
  totalDepartments: number;
  pendingLeaves: number;
  pendingBonuses: number;
  openJobs: number;
}

export interface DepartmentDistribution {
  departmentName: string;
  departmentCode: string;
  employeeCount: number;
}

export interface RecentEmployee {
  id: string;
  employeeId: string;
  position: string;
  hireDate: Date;
  employmentStatus: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
  };
  department: {
    name: string;
  };
}

export interface EmploymentTypeBreakdown {
  type: string;
  count: number;
}

// ==================== QUERIES ====================

/**
 * Fetch all aggregate counts for dashboard KPI cards.
 * Uses parallel queries for maximum performance.
 */
export async function getDashboardCounts(): Promise<DashboardCounts> {
  try {
    const [
      totalEmployees,
      activeEmployees,
      onLeaveEmployees,
      terminatedEmployees,
      totalDepartments,
      pendingLeaves,
      pendingBonuses,
      openJobs,
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { employmentStatus: 'ACTIVE' } }),
      prisma.employee.count({ where: { employmentStatus: 'ON_LEAVE' } }),
      prisma.employee.count({ where: { employmentStatus: 'TERMINATED' } }),
      prisma.department.count({ where: { isActive: true } }),
      prisma.leave.count({ where: { status: 'PENDING' } }),
      prisma.bonus.count({ where: { status: 'PENDING' } }),
      prisma.job.count({ where: { status: { in: ['PUBLISHED', 'PENDING_APPROVAL'] } } }),
    ]);

    return {
      totalEmployees,
      activeEmployees,
      onLeaveEmployees,
      terminatedEmployees,
      totalDepartments,
      pendingLeaves,
      pendingBonuses,
      openJobs,
    };
  } catch (error) {
    throw new Error(`Failed to fetch dashboard counts: ${String(error)}`);
  }
}

/**
 * Fetch employee count per department for distribution chart.
 */
export async function getDepartmentDistribution(): Promise<DepartmentDistribution[]> {
  try {
    const departments = await prisma.department.findMany({
      where: { isActive: true },
      select: {
        name: true,
        code: true,
        _count: {
          select: { employees: true },
        },
      },
      orderBy: {
        employees: { _count: 'desc' },
      },
    });

    return departments.map((d) => ({
      departmentName: d.name,
      departmentCode: d.code,
      employeeCount: d._count.employees,
    }));
  } catch (error) {
    throw new Error(`Failed to fetch department distribution: ${String(error)}`);
  }
}

/**
 * Fetch the most recently hired employees.
 */
export async function getRecentHires(limit = 5): Promise<RecentEmployee[]> {
  try {
    return await prisma.employee.findMany({
      orderBy: { hireDate: 'desc' },
      take: limit,
      select: {
        id: true,
        employeeId: true,
        position: true,
        hireDate: true,
        employmentStatus: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
        department: {
          select: {
            name: true,
          },
        },
      },
    });
  } catch (error) {
    throw new Error(`Failed to fetch recent hires: ${String(error)}`);
  }
}

/**
 * Fetch employment type breakdown (full-time, part-time, etc.).
 */
export async function getEmploymentTypeBreakdown(): Promise<EmploymentTypeBreakdown[]> {
  try {
    const result = await prisma.employee.groupBy({
      by: ['employmentType'],
      _count: { employmentType: true },
      where: {
        employmentStatus: { not: 'TERMINATED' },
      },
      orderBy: {
        _count: { employmentType: 'desc' },
      },
    });

    return result.map((r) => ({
      type: r.employmentType,
      count: r._count.employmentType,
    }));
  } catch (error) {
    throw new Error(`Failed to fetch employment type breakdown: ${String(error)}`);
  }
}

/**
 * Fetch pending items that need admin attention.
 */
export async function getPendingActions(): Promise<{
  pendingLeaves: Array<{
    id: string;
    reason: string;
    totalDays: number;
    startDate: Date;
    employee: { firstName: string; lastName: string };
  }>;
  pendingBonuses: Array<{
    id: string;
    amount: number;
    reason: string;
    employeeId: string;
    suggestedBy: { firstName: string; lastName: string };
  }>;
}> {
  try {
    const [pendingLeaves, pendingBonuses] = await Promise.all([
      prisma.leave.findMany({
        where: { status: 'PENDING' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          reason: true,
          totalDays: true,
          startDate: true,
          employee: {
            select: { firstName: true, lastName: true },
          },
        },
      }),
      prisma.bonus.findMany({
        where: { status: 'PENDING' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          amount: true,
          reason: true,
          employeeId: true,
          suggestedBy: {
            select: { firstName: true, lastName: true },
          },
        },
      }),
    ]);

    return { pendingLeaves, pendingBonuses };
  } catch (error) {
    throw new Error(`Failed to fetch pending actions: ${String(error)}`);
  }
}
