/**
 * @file Employee service — business logic for employee operations.
 * All employee-related business rules live here.
 * NO direct database calls — delegates to repository.
 * NO request/response handling — that's the controller's job.
 *
 * Design decisions:
 * - Passwords are auto-generated server-side (never user-provided).
 * - Employees are never hard-deleted — only deactivated/terminated.
 * - Status changes require a reason for audit trail.
 */

import 'server-only';
import * as employeeRepo from '@/repositories/employee.repository';
import * as departmentRepo from '@/repositories/department.repository';
import * as userRepo from '@/repositories/user.repository';
import { hashPassword } from '@/security/encryption/password';
import { generateEmployeeId, generateSecurePassword } from '@/lib/utils';
import type { ApiResponse, PaginatedResponse } from '@/types/common.types';
import type {
  CreateEmployeeFormData,
  UpdateEmployeeFormData,
  ChangeEmployeeStatusData,
  EmployeeQueryParams,
} from '@/schemas/employee.schema';

// ==================== QUERIES ====================

/**
 * List employees with filters, pagination, and sorting.
 */
export async function listEmployees(
  params: EmployeeQueryParams
): Promise<ApiResponse<PaginatedResponse<unknown>>> {
  try {
    const { items, total } = await employeeRepo.findMany(
      {
        search: params.search,
        departmentId: params.departmentId,
        employmentStatus: params.employmentStatus as import('@prisma/client').EmploymentStatus | undefined,
        employmentType: params.employmentType as import('@prisma/client').EmploymentType | undefined,
      },
      params.page,
      params.pageSize,
      { field: params.sortBy, order: params.sortOrder }
    );

    const totalPages = Math.ceil(total / params.pageSize);

    return {
      success: true,
      data: {
        items,
        total,
        page: params.page,
        pageSize: params.pageSize,
        totalPages,
      },
    };
  } catch (error) {
    return { success: false, error: `Failed to list employees: ${String(error)}` };
  }
}

/**
 * Get a single employee by ID.
 */
export async function getEmployee(
  id: string
): Promise<ApiResponse<unknown>> {
  try {
    const employee = await employeeRepo.findById(id);

    if (!employee) {
      return { success: false, error: 'Employee not found' };
    }

    return { success: true, data: employee };
  } catch (error) {
    return { success: false, error: `Failed to get employee: ${String(error)}` };
  }
}

// ==================== MUTATIONS ====================

/**
 * Create a new employee with an auto-generated secure password.
 * The generated password is returned once in the response — it cannot be retrieved later.
 *
 * Business rules:
 * - Email must not already exist
 * - Department must exist
 * - Employee ID is auto-generated (EMP-XXXXX)
 * - Password is generated server-side (16 chars, crypto-random)
 */
export async function createEmployee(
  data: CreateEmployeeFormData
): Promise<ApiResponse<{ employee: unknown; generatedPassword: string }>> {
  try {
    // Validate email uniqueness
    const emailTaken = await userRepo.emailExists(data.email);
    if (emailTaken) {
      return { success: false, error: 'Email is already registered' };
    }

    // Validate department exists
    const deptExists = await departmentRepo.existsById(data.departmentId);
    if (!deptExists) {
      return { success: false, error: 'Department not found' };
    }

    // Generate unique employee ID
    const count = await employeeRepo.countAll();
    const employeeId = generateEmployeeId(count + 1);

    // Ensure no collision
    const idExists = await employeeRepo.employeeIdExists(employeeId);
    if (idExists) {
      return { success: false, error: 'Employee ID collision. Please try again.' };
    }

    // Generate secure password (16 chars, crypto-random)
    const generatedPassword = generateSecurePassword(16);
    const passwordHash = await hashPassword(generatedPassword);

    // Create employee + user in transaction
    const employee = await employeeRepo.create({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      phone: data.phone || undefined,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender as import('@prisma/client').Gender | undefined,
      nationalId: data.nationalId || undefined,
      address: data.address || undefined,
      departmentId: data.departmentId,
      position: data.position,
      employmentType: data.employmentType as import('@prisma/client').EmploymentType,
      hireDate: data.hireDate,
      managerId: data.managerId || undefined,
      employeeId,
    });

    return {
      success: true,
      data: { employee, generatedPassword },
      message: `Employee ${employeeId} created successfully`,
    };
  } catch (error) {
    return { success: false, error: `Failed to create employee: ${String(error)}` };
  }
}

/**
 * Update an existing employee's profile information.
 * Does NOT handle status changes — use changeEmployeeStatus for that.
 *
 * Business rules:
 * - Employee must exist
 * - If changing department, department must exist
 */
export async function updateEmployee(
  id: string,
  data: UpdateEmployeeFormData
): Promise<ApiResponse<unknown>> {
  try {
    const existing = await employeeRepo.findById(id);
    if (!existing) {
      return { success: false, error: 'Employee not found' };
    }

    // Validate department if changing
    if (data.departmentId && data.departmentId !== existing.departmentId) {
      const deptExists = await departmentRepo.existsById(data.departmentId);
      if (!deptExists) {
        return { success: false, error: 'Department not found' };
      }
    }

    const employee = await employeeRepo.update(id, data as Parameters<typeof employeeRepo.update>[1]);

    return {
      success: true,
      data: employee,
      message: 'Employee updated successfully',
    };
  } catch (error) {
    return { success: false, error: `Failed to update employee: ${String(error)}` };
  }
}

/**
 * Change an employee's status (activate, deactivate, terminate, etc.).
 * This replaces the delete operation — no data is ever removed.
 *
 * Business rules:
 * - Employee must exist
 * - Cannot change your own status (safety)
 * - TERMINATED status auto-sets termination date
 * - Re-activation clears termination date
 * - TERMINATED/INACTIVE disables user login (user.isActive = false)
 * - ACTIVE/ON_LEAVE/PROBATION enables user login (user.isActive = true)
 * - Reason is required for audit trail
 */
export async function changeEmployeeStatus(
  id: string,
  data: ChangeEmployeeStatusData
): Promise<ApiResponse<unknown>> {
  try {
    const existing = await employeeRepo.findById(id);
    if (!existing) {
      return { success: false, error: 'Employee not found' };
    }

    // Prevent no-op changes
    if (existing.employmentStatus === data.employmentStatus) {
      return { success: false, error: `Employee is already ${data.employmentStatus}` };
    }

    const employee = await employeeRepo.changeStatus(
      id,
      data.employmentStatus as import('@prisma/client').EmploymentStatus
    );

    const statusLabels: Record<string, string> = {
      ACTIVE: 'activated',
      INACTIVE: 'deactivated',
      ON_LEAVE: 'marked as on leave',
      TERMINATED: 'terminated',
      PROBATION: 'placed on probation',
    };

    return {
      success: true,
      data: employee,
      message: `Employee ${existing.employeeId} has been ${statusLabels[data.employmentStatus] ?? 'updated'}`,
    };
  } catch (error) {
    return { success: false, error: `Failed to change employee status: ${String(error)}` };
  }
}

// ==================== HELPERS ====================

/**
 * Get all departments for dropdown selection.
 */
export async function getDepartments(): Promise<ApiResponse<unknown>> {
  try {
    const departments = await departmentRepo.findAllActive();
    return { success: true, data: departments };
  } catch (error) {
    return { success: false, error: `Failed to fetch departments: ${String(error)}` };
  }
}
