/**
 * @file Employee type definitions.
 */

import type { BaseEntity, ApprovalStatus } from './common.types';
import type { Role } from './auth.types';

/** Employment status */
export type EmploymentStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED' | 'PROBATION';

/** Employment type */
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';

/** Gender */
export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

/** Employee entity */
export interface Employee extends BaseEntity {
  userId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  nationalId?: string;
  address?: string;
  departmentId: string;
  departmentName?: string;
  position: string;
  role: Role;
  employmentType: EmploymentType;
  employmentStatus: EmploymentStatus;
  hireDate: Date;
  terminationDate?: Date;
  managerId?: string;
  managerName?: string;
  avatarUrl?: string;
  hasJobPostingPermission: boolean;
}

/** Employee creation form data */
export interface CreateEmployeeData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  nationalId?: string;
  address?: string;
  departmentId: string;
  position: string;
  role: Role;
  employmentType: EmploymentType;
  hireDate: Date;
  managerId?: string;
  baseSalary: number;
}

/** Employee request (for approval workflow) */
export interface EmployeeRequest extends BaseEntity {
  requestedById: string;
  requestedByName: string;
  employeeData: CreateEmployeeData;
  status: ApprovalStatus;
  reviewedById?: string;
  reviewedByName?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
}

/** Employee summary for lists */
export interface EmployeeSummary {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  department: string;
  position: string;
  status: EmploymentStatus;
  avatarUrl?: string;
}
