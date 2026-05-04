/**
 * @file Bonus type definitions.
 */

import type { BaseEntity, ApprovalStatus } from './common.types';

/** Bonus entity */
export interface Bonus extends BaseEntity {
  employeeId: string;
  employeeName: string;
  amount: number;
  reason: string;
  status: ApprovalStatus;
  suggestedById: string;
  suggestedByName: string;
  approvedById?: string;
  approvedByName?: string;
  approvedAt?: Date;
  approvalNotes?: string;
  payrollMonth?: number;
  payrollYear?: number;
  isIncludedInPayroll: boolean;
}

/** Create bonus suggestion */
export interface CreateBonusData {
  employeeId: string;
  amount: number;
  reason: string;
}

/** Bonus summary for dashboard */
export interface BonusSummary {
  pending: number;
  approved: number;
  rejected: number;
  totalApprovedAmount: number;
}
