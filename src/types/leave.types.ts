/**
 * @file Leave management type definitions.
 */

import type { BaseEntity, ApprovalStatus } from './common.types';

/** Leave request entity */
export interface Leave extends BaseEntity {
  employeeId: string;
  employeeName: string;
  leaveTypeId: string;
  leaveTypeName: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason: string;
  status: ApprovalStatus;
  approvedById?: string;
  approvedByName?: string;
  approvedAt?: Date;
  approvalNotes?: string;
  departmentId: string;
  departmentName?: string;
}

/** Leave type (Annual, Sick, etc.) */
export interface LeaveType extends BaseEntity {
  name: string;
  code: string;
  description?: string;
  defaultDays: number;
  isPaid: boolean;
  isActive: boolean;
  color: string;
}

/** Leave balance per employee per type */
export interface LeaveBalance {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  leaveTypeName: string;
  year: number;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  pendingDays: number;
}

/** Create leave request data */
export interface CreateLeaveRequest {
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
}

/** Leave summary for dashboard */
export interface LeaveSummary {
  pending: number;
  approved: number;
  rejected: number;
  totalDaysTaken: number;
}
