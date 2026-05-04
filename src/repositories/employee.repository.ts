/**
 * @file Employee repository — data layer for employee operations.
 * All database access for employees goes through this repository.
 * NO business logic — only Prisma queries and projections.
 *
 * Design: Employees are NEVER deleted. Status changes (terminate, deactivate)
 * are used instead, and the user account's isActive flag is toggled accordingly.
 */

import 'server-only';
import prisma from '@/lib/prisma';
import type { EmploymentStatus, EmploymentType, Gender } from '@prisma/client';

// ==================== TYPES ====================

/** Filters for employee list queries */
export interface EmployeeFilters {
  search?: string;
  departmentId?: string;
  employmentStatus?: EmploymentStatus;
  employmentType?: EmploymentType;
  managerId?: string;
}

/** Sorting for employee list queries */
export interface EmployeeSort {
  field: 'employeeId' | 'hireDate' | 'position' | 'createdAt';
  order: 'asc' | 'desc';
}

/** The select projection shared across employee queries */
const employeeSelectWithRelations = {
  id: true,
  userId: true,
  employeeId: true,
  phone: true,
  dateOfBirth: true,
  gender: true,
  nationalId: true,
  address: true,
  departmentId: true,
  position: true,
  employmentType: true,
  employmentStatus: true,
  hireDate: true,
  terminationDate: true,
  managerId: true,
  hasJobPostingPermission: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      avatarUrl: true,
      isActive: true,
    },
  },
  department: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
  manager: {
    select: {
      id: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  },
} as const;

// ==================== STATUS CONSTANTS ====================

/** Statuses that disable user login */
const INACTIVE_STATUSES: EmploymentStatus[] = ['TERMINATED', 'INACTIVE'];

// ==================== QUERIES ====================

/**
 * Find all employees with optional filters, pagination, and sorting.
 */
export async function findMany(
  filters: EmployeeFilters = {},
  page = 1,
  pageSize = 10,
  sort: EmployeeSort = { field: 'createdAt', order: 'desc' }
) {
  const where = buildWhereClause(filters);
  const skip = (page - 1) * pageSize;

  try {
    const [items, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        select: employeeSelectWithRelations,
        skip,
        take: pageSize,
        orderBy: { [sort.field]: sort.order },
      }),
      prisma.employee.count({ where }),
    ]);

    return { items, total };
  } catch (error) {
    throw new Error(`Failed to fetch employees: ${String(error)}`);
  }
}

/**
 * Find a single employee by ID with full details.
 */
export async function findById(id: string) {
  try {
    return await prisma.employee.findUnique({
      where: { id },
      select: employeeSelectWithRelations,
    });
  } catch (error) {
    throw new Error(`Failed to find employee: ${String(error)}`);
  }
}

/**
 * Find a single employee by user ID.
 */
export async function findByUserId(userId: string) {
  try {
    return await prisma.employee.findUnique({
      where: { userId },
      select: employeeSelectWithRelations,
    });
  } catch (error) {
    throw new Error(`Failed to find employee by user ID: ${String(error)}`);
  }
}

/**
 * Create a new employee and its associated user account in a transaction.
 */
export async function create(data: {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  nationalId?: string;
  address?: string;
  departmentId: string;
  position: string;
  employmentType: EmploymentType;
  hireDate: Date;
  managerId?: string;
  employeeId: string;
}) {
  try {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: data.passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role as import('@prisma/client').UserRole,
        },
      });

      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          employeeId: data.employeeId,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          nationalId: data.nationalId,
          address: data.address,
          departmentId: data.departmentId,
          position: data.position,
          employmentType: data.employmentType,
          hireDate: data.hireDate,
          managerId: data.managerId,
        },
        select: employeeSelectWithRelations,
      });

      return employee;
    });
  } catch (error) {
    throw new Error(`Failed to create employee: ${String(error)}`);
  }
}

/**
 * Update an existing employee and optionally its user account.
 */
export async function update(
  id: string,
  data: {
    firstName?: string;
    lastName?: string;
    role?: string;
    phone?: string;
    dateOfBirth?: Date | null;
    gender?: Gender | null;
    nationalId?: string | null;
    address?: string | null;
    departmentId?: string;
    position?: string;
    employmentType?: EmploymentType;
    hireDate?: Date;
    managerId?: string | null;
    hasJobPostingPermission?: boolean;
  }
) {
  try {
    const { firstName, lastName, role, ...employeeData } = data;

    return await prisma.$transaction(async (tx) => {
      const existing = await tx.employee.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!existing) {
        throw new Error('Employee not found');
      }

      // Update user fields if provided
      if (firstName || lastName || role) {
        await tx.user.update({
          where: { id: existing.userId },
          data: {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(role && { role: role as import('@prisma/client').UserRole }),
          },
        });
      }

      // Update employee fields
      return await tx.employee.update({
        where: { id },
        data: employeeData,
        select: employeeSelectWithRelations,
      });
    });
  } catch (error) {
    throw new Error(`Failed to update employee: ${String(error)}`);
  }
}

/**
 * Change employee status and sync user.isActive accordingly.
 * TERMINATED / INACTIVE → user.isActive = false (login disabled)
 * ACTIVE / ON_LEAVE / PROBATION → user.isActive = true (login enabled)
 */
export async function changeStatus(
  id: string,
  status: EmploymentStatus,
  terminationDate?: Date | null
) {
  try {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.employee.findUnique({
        where: { id },
        select: { userId: true, employeeId: true },
      });

      if (!existing) {
        throw new Error('Employee not found');
      }

      // Sync user.isActive based on the new status
      const shouldBeActive = !INACTIVE_STATUSES.includes(status);
      await tx.user.update({
        where: { id: existing.userId },
        data: { isActive: shouldBeActive },
      });

      // Update employee status + optional termination date
      return await tx.employee.update({
        where: { id },
        data: {
          employmentStatus: status,
          ...(status === 'TERMINATED'
            ? { terminationDate: terminationDate ?? new Date() }
            : { terminationDate: null }),
        },
        select: employeeSelectWithRelations,
      });
    });
  } catch (error) {
    throw new Error(`Failed to change employee status: ${String(error)}`);
  }
}

/**
 * Count total employees (for generating next employee ID).
 */
export async function countAll(): Promise<number> {
  try {
    return await prisma.employee.count();
  } catch (error) {
    throw new Error(`Failed to count employees: ${String(error)}`);
  }
}

/**
 * Check if an employee ID already exists.
 */
export async function employeeIdExists(employeeId: string): Promise<boolean> {
  try {
    const count = await prisma.employee.count({ where: { employeeId } });
    return count > 0;
  } catch (error) {
    throw new Error(`Failed to check employee ID: ${String(error)}`);
  }
}

// ==================== HELPERS ====================

/**
 * Build Prisma where clause from filters.
 */
function buildWhereClause(filters: EmployeeFilters) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (filters.departmentId) {
    where.departmentId = filters.departmentId;
  }

  if (filters.employmentStatus) {
    where.employmentStatus = filters.employmentStatus;
  }

  if (filters.employmentType) {
    where.employmentType = filters.employmentType;
  }

  if (filters.managerId) {
    where.managerId = filters.managerId;
  }

  if (filters.search) {
    const search = filters.search.trim();
    where.OR = [
      { employeeId: { contains: search, mode: 'insensitive' } },
      { position: { contains: search, mode: 'insensitive' } },
      { user: { firstName: { contains: search, mode: 'insensitive' } } },
      { user: { lastName: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ];
  }

  return where;
}
