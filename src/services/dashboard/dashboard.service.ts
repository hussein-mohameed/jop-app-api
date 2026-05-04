/**
 * @file Dashboard service — business logic for admin overview data.
 * Aggregates data from the repository and shapes it for the presentation layer.
 * NO direct database calls — delegates to dashboard.repository.
 */

import 'server-only';
import * as dashboardRepo from '@/repositories/dashboard.repository';
import type { ApiResponse } from '@/types/common.types';

// ==================== TYPES ====================

export interface DashboardData {
  counts: dashboardRepo.DashboardCounts;
  departmentDistribution: dashboardRepo.DepartmentDistribution[];
  recentHires: dashboardRepo.RecentEmployee[];
  employmentTypes: dashboardRepo.EmploymentTypeBreakdown[];
  pendingActions: {
    pendingLeaves: Array<{
      id: string;
      reason: string;
      totalDays: number;
      startDate: Date;
      employee: { firstName: string; lastName: string };
    }>;
    pendingBonuses: Array<{
      id: string;
      amount: number;
      reason: string;
      employeeId: string;
      suggestedBy: { firstName: string; lastName: string };
    }>;
  };
}

// ==================== QUERIES ====================

/**
 * Fetch all dashboard data in parallel for maximum performance.
 * This is the single entry point for the admin dashboard page.
 */
export async function getDashboardData(): Promise<ApiResponse<DashboardData>> {
  try {
    const [counts, departmentDistribution, recentHires, employmentTypes, pendingActions] =
      await Promise.all([
        dashboardRepo.getDashboardCounts(),
        dashboardRepo.getDepartmentDistribution(),
        dashboardRepo.getRecentHires(5),
        dashboardRepo.getEmploymentTypeBreakdown(),
        dashboardRepo.getPendingActions(),
      ]);

    return {
      success: true,
      data: {
        counts,
        departmentDistribution,
        recentHires,
        employmentTypes,
        pendingActions,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to load dashboard data: ${String(error)}`,
    };
  }
}
