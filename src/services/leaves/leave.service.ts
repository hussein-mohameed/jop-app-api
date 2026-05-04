/**
 * @file Leave service — business logic for leave operations.
 * NO direct database calls — delegates to repository.
 *
 * Business rules:
 * - Cannot request leave for past dates
 * - Cannot request overlapping leave periods
 * - Must have sufficient leave balance
 * - On create: increment pendingDays
 * - On approve: move pendingDays → usedDays
 * - On reject/cancel: release pendingDays
 */

import 'server-only';
import * as leaveRepo from '@/repositories/leave.repository';
import { notify } from '@/services/notifications/notification.service';
import type { ApiResponse, PaginatedResponse } from '@/types/common.types';
import type { RequestLeaveFormData, LeaveQueryParams } from '@/schemas/leave.schema';

// ==================== QUERIES ====================

export async function listLeaves(
  params: LeaveQueryParams
): Promise<ApiResponse<PaginatedResponse<unknown>>> {
  try {
    const { items, total } = await leaveRepo.findMany(
      {
        search: params.search,
        status: params.status as import('@prisma/client').ApprovalStatus | undefined,
        leaveTypeId: params.leaveTypeId,
        employeeId: params.employeeId,
      },
      params.page,
      params.pageSize,
      { field: params.sortBy, order: params.sortOrder }
    );

    return {
      success: true,
      data: {
        items,
        total,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: Math.ceil(total / params.pageSize),
      },
    };
  } catch (error) {
    return { success: false, error: `Failed to list leaves: ${String(error)}` };
  }
}

export async function getLeave(id: string): Promise<ApiResponse<unknown>> {
  try {
    const leave = await leaveRepo.findById(id);
    if (!leave) return { success: false, error: 'Leave request not found' };
    return { success: true, data: leave };
  } catch (error) {
    return { success: false, error: `Failed to get leave: ${String(error)}` };
  }
}

export async function getLeaveTypes(): Promise<ApiResponse<unknown>> {
  try {
    const types = await leaveRepo.findActiveLeaveTypes();
    return { success: true, data: types };
  } catch (error) {
    return { success: false, error: `Failed to get leave types: ${String(error)}` };
  }
}

// ==================== MUTATIONS ====================

/**
 * Request a new leave.
 * Validates balance, checks overlaps, and increments pendingDays.
 */
export async function requestLeave(
  userId: string,
  data: RequestLeaveFormData
): Promise<ApiResponse<unknown>> {
  try {
    // Calculate total days (simple weekday count)
    const totalDays = calculateBusinessDays(data.startDate, data.endDate);
    if (totalDays <= 0) {
      return { success: false, error: 'Invalid date range — no working days selected' };
    }

    // Check for overlapping leaves
    const overlaps = await leaveRepo.findOverlapping(userId, data.startDate, data.endDate);
    if (overlaps.length > 0) {
      return { success: false, error: 'You already have a leave request overlapping these dates' };
    }

    // Check leave balance
    const year = data.startDate.getFullYear();
    const balance = await leaveRepo.findLeaveBalance(userId, data.leaveTypeId, year);
    if (!balance) {
      return { success: false, error: 'No leave balance found for this leave type and year' };
    }

    const available = balance.totalDays - balance.usedDays - balance.pendingDays;
    if (available < totalDays) {
      return {
        success: false,
        error: `Insufficient leave balance. Available: ${available} days, Requested: ${totalDays} days`,
      };
    }

    // Create leave request
    const leave = await leaveRepo.create({
      employeeId: userId,
      leaveTypeId: data.leaveTypeId,
      startDate: data.startDate,
      endDate: data.endDate,
      totalDays,
      reason: data.reason,
    });

    // Increment pending days in balance
    await leaveRepo.incrementPendingDays(userId, data.leaveTypeId, year, totalDays);

    return {
      success: true,
      data: leave,
      message: `Leave request submitted for ${totalDays} days`,
    };
  } catch (error) {
    return { success: false, error: `Failed to request leave: ${String(error)}` };
  }
}

/**
 * Review (approve/reject) a leave request.
 * Updates balance accordingly.
 */
export async function reviewLeave(
  leaveId: string,
  reviewerId: string,
  status: 'APPROVED' | 'REJECTED',
  approvalNotes?: string
): Promise<ApiResponse<unknown>> {
  try {
    const existing = await leaveRepo.findById(leaveId);
    if (!existing) return { success: false, error: 'Leave request not found' };

    if (existing.status !== 'PENDING') {
      return { success: false, error: `Cannot review a leave that is already ${existing.status}` };
    }

    // Update leave status
    const leave = await leaveRepo.updateStatus(
      leaveId,
      status as import('@prisma/client').ApprovalStatus,
      reviewerId,
      approvalNotes
    );

    // Update leave balance
    const year = existing.startDate.getFullYear();
    if (status === 'APPROVED') {
      await leaveRepo.approveLeaveDays(
        existing.employeeId, existing.leaveTypeId, year, existing.totalDays
      );
    } else {
      await leaveRepo.releasePendingDays(
        existing.employeeId, existing.leaveTypeId, year, existing.totalDays
      );
    }

    // Notify the employee
    const action = status === 'APPROVED' ? 'approved' : 'rejected';
    notify({
      userId: existing.employeeId,
      title: `Leave ${action}`,
      message: `Your leave request for ${existing.totalDays} days has been ${action}.${approvalNotes ? ` Note: ${approvalNotes}` : ''}`,
      type: status === 'APPROVED' ? 'SUCCESS' : 'WARNING',
      link: '/employee/leaves',
    });

    return {
      success: true,
      data: leave,
      message: `Leave request ${action}`,
    };
  } catch (error) {
    return { success: false, error: `Failed to review leave: ${String(error)}` };
  }
}

// ==================== HELPERS ====================

/**
 * Calculate business days between two dates (excluding weekends).
 */
function calculateBusinessDays(start: Date, end: Date): number {
  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}
