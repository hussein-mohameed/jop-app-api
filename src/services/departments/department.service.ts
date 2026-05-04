/**
 * @file Department service — business logic for department operations.
 * Validates input, enforces uniqueness, and delegates to repository.
 * NO direct database calls — uses department.repository exclusively.
 */

import 'server-only';
import * as deptRepo from '@/repositories/department.repository';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  toggleDepartmentStatusSchema,
} from '@/schemas/department.schema';
import type { ApiResponse } from '@/types/common.types';

// ==================== QUERIES ====================

/**
 * List all departments with optional search and status filter.
 */
export async function listDepartments(
  search?: string,
  isActive?: boolean
): Promise<ApiResponse> {
  try {
    const departments = await deptRepo.findMany({ search, isActive });
    return { success: true, data: departments };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Get a single department by ID.
 */
export async function getDepartment(id: string): Promise<ApiResponse> {
  try {
    const department = await deptRepo.findById(id);
    if (!department) {
      return { success: false, error: 'Department not found' };
    }
    return { success: true, data: department };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Get potential managers for department assignment.
 */
export async function getManagerOptions(): Promise<ApiResponse> {
  try {
    const managers = await deptRepo.getManagers();
    return { success: true, data: managers };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// ==================== MUTATIONS ====================

/**
 * Create a new department.
 * Enforces unique name and code.
 */
export async function createDepartment(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawData: Record<string, any>
): Promise<ApiResponse> {
  // Validate input
  const parsed = createDepartmentSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      data: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    // Check unique name
    const nameUsed = await deptRepo.nameExists(data.name);
    if (nameUsed) {
      return { success: false, error: 'A department with this name already exists' };
    }

    // Check unique code
    const codeUsed = await deptRepo.codeExists(data.code);
    if (codeUsed) {
      return { success: false, error: 'A department with this code already exists' };
    }

    // Validate parentId if provided
    if (data.parentId) {
      const parentExists = await deptRepo.existsById(data.parentId);
      if (!parentExists) {
        return { success: false, error: 'Parent department not found' };
      }
    }

    // Clean empty strings
    const createData = {
      name: data.name,
      code: data.code,
      description: data.description || undefined,
      managerId: data.managerId || undefined,
      parentId: data.parentId || undefined,
    };

    const department = await deptRepo.create(createData);
    return { success: true, data: department };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Update an existing department.
 * Enforces unique name and code if changed.
 */
export async function updateDepartment(
  id: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawData: Record<string, any>
): Promise<ApiResponse> {
  // Validate input
  const parsed = updateDepartmentSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      data: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    // Verify department exists
    const existing = await deptRepo.findById(id);
    if (!existing) {
      return { success: false, error: 'Department not found' };
    }

    // Check unique name if changed
    if (data.name && data.name !== existing.name) {
      const nameUsed = await deptRepo.nameExists(data.name, id);
      if (nameUsed) {
        return { success: false, error: 'A department with this name already exists' };
      }
    }

    // Check unique code if changed
    if (data.code && data.code !== existing.code) {
      const codeUsed = await deptRepo.codeExists(data.code, id);
      if (codeUsed) {
        return { success: false, error: 'A department with this code already exists' };
      }
    }

    // Prevent self-reference as parent
    if (data.parentId === id) {
      return { success: false, error: 'A department cannot be its own parent' };
    }

    // Validate parentId if provided
    if (data.parentId) {
      const parentExists = await deptRepo.existsById(data.parentId);
      if (!parentExists) {
        return { success: false, error: 'Parent department not found' };
      }
    }

    const department = await deptRepo.update(id, data);
    return { success: true, data: department };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Toggle department active status.
 */
export async function toggleDepartmentStatus(
  id: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawData: Record<string, any>
): Promise<ApiResponse> {
  const parsed = toggleDepartmentStatusSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      data: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const existing = await deptRepo.findById(id);
    if (!existing) {
      return { success: false, error: 'Department not found' };
    }

    const department = await deptRepo.toggleActive(id, parsed.data.isActive);
    return { success: true, data: department };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
