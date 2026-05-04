/**
 * @file Payroll repository — data layer for salary and payslip operations.
 * NO business logic — only Prisma queries and projections.
 *
 * Design: Payroll run creates payslips in a single transaction for atomicity.
 * Only one salary can be active per employee at a time.
 */

import 'server-only';
import prisma from '@/lib/prisma';
import type { SalaryComponentType } from '@prisma/client';

// ==================== TYPES ====================

export interface SalaryFilters {
  employeeId?: string;
  isActive?: boolean;
}

export interface SalarySort {
  field: 'baseSalary' | 'effectiveDate' | 'createdAt';
  order: 'asc' | 'desc';
}

export interface PayslipFilters {
  employeeId?: string;
  month?: number;
  year?: number;
  isPaid?: boolean;
}

export interface PayslipSort {
  field: 'month' | 'netPay' | 'createdAt';
  order: 'asc' | 'desc';
}

const salarySelect = {
  id: true, employeeId: true, baseSalary: true,
  effectiveDate: true, endDate: true, isActive: true,
  createdAt: true, updatedAt: true,
  employee: {
    select: {
      id: true, employeeId: true,
      user: { select: { firstName: true, lastName: true } },
    },
  },
  components: {
    select: {
      id: true, name: true, type: true,
      amount: true, isPercentage: true, description: true,
    },
  },
} as const;

const payslipSelect = {
  id: true, employeeId: true, month: true, year: true,
  baseSalary: true, totalAllowances: true, totalDeductions: true,
  totalBonuses: true, grossPay: true, netPay: true,
  isPaid: true, paidAt: true, components: true,
  createdAt: true, updatedAt: true,
  employee: {
    select: {
      id: true, employeeId: true,
      user: { select: { firstName: true, lastName: true } },
    },
  },
} as const;

// ==================== SALARY QUERIES ====================

export async function findSalaries(
  filters: SalaryFilters = {}, page = 1, pageSize = 10,
  sort: SalarySort = { field: 'createdAt', order: 'desc' }
) {
  const where = buildSalaryWhere(filters);
  const skip = (page - 1) * pageSize;
  const [items, total] = await Promise.all([
    prisma.salary.findMany({ where, select: salarySelect, skip, take: pageSize, orderBy: { [sort.field]: sort.order } }),
    prisma.salary.count({ where }),
  ]);
  return { items, total };
}

export async function findActiveSalary(employeeId: string) {
  return prisma.salary.findFirst({ where: { employeeId, isActive: true }, select: salarySelect });
}

export async function findSalaryById(id: string) {
  return prisma.salary.findUnique({ where: { id }, select: salarySelect });
}

export async function createSalary(data: {
  employeeId: string; baseSalary: number; effectiveDate: Date;
  components: { name: string; type: SalaryComponentType; amount: number; isPercentage: boolean; description?: string }[];
}) {
  return prisma.$transaction(async (tx) => {
    await tx.salary.updateMany({
      where: { employeeId: data.employeeId, isActive: true },
      data: { isActive: false, endDate: data.effectiveDate },
    });
    return tx.salary.create({
      data: {
        employeeId: data.employeeId, baseSalary: data.baseSalary,
        effectiveDate: data.effectiveDate,
        components: { create: data.components },
      },
      select: salarySelect,
    });
  });
}

export async function updateSalary(
  id: string,
  data: {
    baseSalary?: number;
    components?: { name: string; type: SalaryComponentType; amount: number; isPercentage: boolean; description?: string }[];
  }
) {
  return prisma.$transaction(async (tx) => {
    if (data.components) {
      await tx.salaryComponent.deleteMany({ where: { salaryId: id } });
      await tx.salaryComponent.createMany({ data: data.components.map((c) => ({ ...c, salaryId: id })) });
    }
    return tx.salary.update({
      where: { id },
      data: { ...(data.baseSalary !== undefined && { baseSalary: data.baseSalary }) },
      select: salarySelect,
    });
  });
}

// ==================== PAYSLIP QUERIES ====================

export async function findPayslips(
  filters: PayslipFilters = {}, page = 1, pageSize = 10,
  sort: PayslipSort = { field: 'createdAt', order: 'desc' }
) {
  const where = buildPayslipWhere(filters);
  const skip = (page - 1) * pageSize;
  const [items, total] = await Promise.all([
    prisma.payslip.findMany({ where, select: payslipSelect, skip, take: pageSize, orderBy: { [sort.field]: sort.order } }),
    prisma.payslip.count({ where }),
  ]);
  return { items, total };
}

export async function findPayslipById(id: string) {
  return prisma.payslip.findUnique({ where: { id }, select: payslipSelect });
}

export async function createPayslipBatch(
  payslips: {
    employeeId: string; month: number; year: number; baseSalary: number;
    totalAllowances: number; totalDeductions: number; totalBonuses: number;
    grossPay: number; netPay: number; components: object;
  }[]
) {
  return prisma.$transaction(async (tx) => {
    const results = [];
    for (const p of payslips) {
      const result = await tx.payslip.upsert({
        where: { employeeId_month_year: { employeeId: p.employeeId, month: p.month, year: p.year } },
        create: p,
        update: {
          baseSalary: p.baseSalary, totalAllowances: p.totalAllowances,
          totalDeductions: p.totalDeductions, totalBonuses: p.totalBonuses,
          grossPay: p.grossPay, netPay: p.netPay, components: p.components as object,
          isPaid: false, paidAt: null,
        },
        select: payslipSelect,
      });
      results.push(result);
    }
    return results;
  });
}

export async function markPayslipPaid(id: string) {
  return prisma.payslip.update({ where: { id }, data: { isPaid: true, paidAt: new Date() }, select: payslipSelect });
}

export async function findActiveEmployeesWithSalary() {
  return prisma.employee.findMany({
    where: { employmentStatus: 'ACTIVE', salaries: { some: { isActive: true } } },
    select: {
      id: true, employeeId: true,
      user: { select: { firstName: true, lastName: true } },
      salaries: { where: { isActive: true }, select: salarySelect, take: 1 },
    },
  });
}

// ==================== HELPERS ====================

function buildSalaryWhere(filters: SalaryFilters) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (filters.employeeId) where.employeeId = filters.employeeId;
  if (filters.isActive !== undefined) where.isActive = filters.isActive;
  return where;
}

function buildPayslipWhere(filters: PayslipFilters) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (filters.employeeId) where.employeeId = filters.employeeId;
  if (filters.month) where.month = filters.month;
  if (filters.year) where.year = filters.year;
  if (filters.isPaid !== undefined) where.isPaid = filters.isPaid;
  return where;
}
