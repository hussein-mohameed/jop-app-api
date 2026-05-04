/**
 * @file useDashboard hook — bridge layer for admin dashboard data.
 * Fetches dashboard metrics from the API and manages loading state.
 * NO business logic — only API interaction and state management.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

// ==================== TYPES ====================

export interface DashboardCounts {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveEmployees: number;
  terminatedEmployees: number;
  totalDepartments: number;
  pendingLeaves: number;
  pendingBonuses: number;
  openJobs: number;
}

export interface DepartmentDistribution {
  departmentName: string;
  departmentCode: string;
  employeeCount: number;
}

export interface RecentEmployee {
  id: string;
  employeeId: string;
  position: string;
  hireDate: string;
  employmentStatus: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
  };
  department: {
    name: string;
  };
}

export interface EmploymentTypeBreakdown {
  type: string;
  count: number;
}

export interface PendingLeave {
  id: string;
  reason: string;
  totalDays: number;
  startDate: string;
  employee: { firstName: string; lastName: string };
}

export interface PendingBonus {
  id: string;
  amount: number;
  reason: string;
  employeeId: string;
  suggestedBy: { firstName: string; lastName: string };
}

export interface DashboardData {
  counts: DashboardCounts;
  departmentDistribution: DepartmentDistribution[];
  recentHires: RecentEmployee[];
  employmentTypes: EmploymentTypeBreakdown[];
  pendingActions: {
    pendingLeaves: PendingLeave[];
    pendingBonuses: PendingBonus[];
  };
}

// ==================== HOOK ====================

/**
 * Hook for fetching and managing admin dashboard data.
 */
export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/dashboard');
      const result = await res.json();

      if (!result.success) {
        setError(result.error ?? 'Failed to load dashboard');
        return;
      }

      setData(result.data);
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchDashboard,
  };
}
