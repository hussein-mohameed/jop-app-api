/**
 * @file Department repository — data layer for department operations.
 * All database access for departments goes through this repository.
 * NO business logic — only Prisma queries and projections.
 *
 * Design: Departments are NEVER deleted. They are deactivated via isActive flag.
 */

import 'server-only';
import prisma from '@/lib/prisma';

// ==================== TYPES ====================

export interface DepartmentFilters {
  search?: string;
  isActive?: boolean;
}

/** Shared select projection for department queries */
const departmentSelectWithRelations = {
  id: true,
  name: true,
  code: true,
  description: true,
  managerId: true,
  parentId: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  manager: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
  parent: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
  _count: {
    select: {
      employees: true,
      children: true,
      jobs: true,
    },
  },
} as const;

// ==================== QUERIES ====================

/**
 * Find all departments with optional filters and sorting.
 */
export async function findMany(filters: DepartmentFilters = {}) {
  const where = buildWhereClause(filters);

  try {
    return await prisma.department.findMany({
      where,
      select: departmentSelectWithRelations,
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    throw new Error(`Failed to fetch departments: ${String(error)}`);
  }
}

/**
 * Find a single department by ID with full details.
 */
export async function findById(id: string) {
  try {
    return await prisma.department.findUnique({
      where: { id },
      select: departmentSelectWithRelations,
    });
  } catch (error) {
    throw new Error(`Failed to find department: ${String(error)}`);
  }
}

/**
 * Find all active departments (for dropdowns and filters).
 */
export async function findAllActive() {
  try {
    return await prisma.department.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    throw new Error(`Failed to fetch departments: ${String(error)}`);
  }
}

/**
 * Check if a department exists by ID.
 */
export async function existsById(id: string): Promise<boolean> {
  try {
    const count = await prisma.department.count({ where: { id } });
    return count > 0;
  } catch (error) {
    throw new Error(`Failed to check department: ${String(error)}`);
  }
}

/**
 * Check if a department name already exists.
 */
export async function nameExists(name: string, excludeId?: string): Promise<boolean> {
  try {
    const count = await prisma.department.count({
      where: {
        name,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    return count > 0;
  } catch (error) {
    throw new Error(`Failed to check department name: ${String(error)}`);
  }
}

/**
 * Check if a department code already exists.
 */
export async function codeExists(code: string, excludeId?: string): Promise<boolean> {
  try {
    const count = await prisma.department.count({
      where: {
        code,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    return count > 0;
  } catch (error) {
    throw new Error(`Failed to check department code: ${String(error)}`);
  }
}

// ==================== MUTATIONS ====================

/**
 * Create a new department.
 */
export async function create(data: {
  name: string;
  code: string;
  description?: string;
  managerId?: string;
  parentId?: string;
}) {
  try {
    return await prisma.department.create({
      data,
      select: departmentSelectWithRelations,
    });
  } catch (error) {
    throw new Error(`Failed to create department: ${String(error)}`);
  }
}

/**
 * Update an existing department.
 */
export async function update(
  id: string,
  data: {
    name?: string;
    code?: string;
    description?: string | null;
    managerId?: string | null;
    parentId?: string | null;
    isActive?: boolean;
  }
) {
  try {
    return await prisma.department.update({
      where: { id },
      data,
      select: departmentSelectWithRelations,
    });
  } catch (error) {
    throw new Error(`Failed to update department: ${String(error)}`);
  }
}

/**
 * Toggle department active status (soft deactivation).
 * When deactivating, does NOT deactivate employees — they remain linked.
 */
export async function toggleActive(id: string, isActive: boolean) {
  try {
    return await prisma.department.update({
      where: { id },
      data: { isActive },
      select: departmentSelectWithRelations,
    });
  } catch (error) {
    throw new Error(`Failed to toggle department status: ${String(error)}`);
  }
}

/**
 * Get managers list (users who can manage departments).
 */
export async function getManagers() {
  try {
    return await prisma.user.findMany({
      where: {
        isActive: true,
        role: { in: ['MANAGER', 'HR_MANAGER', 'COMPANY_ADMIN'] },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
      orderBy: { firstName: 'asc' },
    });
  } catch (error) {
    throw new Error(`Failed to fetch managers: ${String(error)}`);
  }
}

// ==================== HELPERS ====================

function buildWhereClause(filters: DepartmentFilters) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  if (filters.search) {
    const search = filters.search.trim();
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  return where;
}
