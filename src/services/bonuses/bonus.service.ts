/**
 * @file Bonus service — business logic for bonus operations.
 * NO direct database calls — delegates to repository.
 *
 * Business rules:
 * - Only managers+ can suggest bonuses
 * - Only company admins can approve (via permission guard in controller)
 * - Cannot suggest bonus for yourself
 * - Cannot modify APPROVED or REJECTED bonuses
 */

import 'server-only';
import * as bonusRepo from '@/repositories/bonus.repository';
import { notify } from '@/services/notifications/notification.service';
import type { ApiResponse, PaginatedResponse } from '@/types/common.types';
import type { SuggestBonusFormData, BonusQueryParams } from '@/schemas/bonus.schema';

// ==================== QUERIES ====================

export async function listBonuses(
  params: BonusQueryParams
): Promise<ApiResponse<PaginatedResponse<unknown>>> {
  try {
    const { items, total } = await bonusRepo.findMany(
      {
        search: params.search,
        status: params.status as import('@prisma/client').ApprovalStatus | undefined,
        employeeId: params.employeeId,
      },
      params.page,
      params.pageSize,
      { field: params.sortBy, order: params.sortOrder }
    );

    return {
      success: true,
      data: {
        items, total,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: Math.ceil(total / params.pageSize),
      },
    };
  } catch (error) {
    return { success: false, error: `Failed to list bonuses: ${String(error)}` };
  }
}

// ==================== MUTATIONS ====================

export async function suggestBonus(
  suggestedById: string,
  data: SuggestBonusFormData
): Promise<ApiResponse<unknown>> {
  try {
    // Cannot suggest bonus for yourself
    if (data.employeeId === suggestedById) {
      return { success: false, error: 'You cannot suggest a bonus for yourself' };
    }

    const bonus = await bonusRepo.create({
      employeeId: data.employeeId,
      amount: data.amount,
      reason: data.reason,
      suggestedById,
    });

    return {
      success: true,
      data: bonus,
      message: 'Bonus suggestion submitted for review',
    };
  } catch (error) {
    return { success: false, error: `Failed to suggest bonus: ${String(error)}` };
  }
}

export async function reviewBonus(
  bonusId: string,
  reviewerId: string,
  status: 'APPROVED' | 'REJECTED',
  approvalNotes?: string
): Promise<ApiResponse<unknown>> {
  try {
    const existing = await bonusRepo.findById(bonusId);
    if (!existing) return { success: false, error: 'Bonus not found' };

    if (existing.status !== 'PENDING') {
      return { success: false, error: `Cannot review a bonus that is already ${existing.status}` };
    }

    const bonus = await bonusRepo.updateStatus(
      bonusId,
      status as import('@prisma/client').ApprovalStatus,
      reviewerId,
      approvalNotes
    );

    // Notify the suggester
    const action = status === 'APPROVED' ? 'approved' : 'rejected';
    notify({
      userId: existing.suggestedById,
      title: `Bonus ${action}`,
      message: `Your bonus suggestion of $${existing.amount} has been ${action}.`,
      type: status === 'APPROVED' ? 'SUCCESS' : 'WARNING',
    });

    return {
      success: true,
      data: bonus,
      message: `Bonus ${action}`,
    };
  } catch (error) {
    return { success: false, error: `Failed to review bonus: ${String(error)}` };
  }
}
