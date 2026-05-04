/**
 * @file Department type definitions.
 */

import type { BaseEntity } from './common.types';

/** Department entity */
export interface Department extends BaseEntity {
  name: string;
  code: string;
  description?: string;
  managerId?: string;
  managerName?: string;
  parentId?: string;
  parentName?: string;
  isActive: boolean;
  employeeCount?: number;
}

/** Create department data */
export interface CreateDepartmentData {
  name: string;
  code: string;
  description?: string;
  managerId?: string;
  parentId?: string;
}

/** Update department data */
export interface UpdateDepartmentData {
  name?: string;
  description?: string;
  managerId?: string;
  isActive?: boolean;
}

/** Department summary for dropdowns and lists */
export interface DepartmentSummary {
  id: string;
  name: string;
  code: string;
  managerName?: string;
  employeeCount: number;
}
