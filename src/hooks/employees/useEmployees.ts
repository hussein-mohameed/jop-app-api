/**
 * @file useEmployees hook — bridge layer for employee data on the client.
 * Orchestrates API calls — contains NO business logic.
 *
 * Design decisions:
 * - No delete operation — replaced by changeStatus.
 * - Create returns generated password (shown to admin once).
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import type { PaginatedResponse } from '@/types/common.types';

/** Employee query filters */
export interface EmployeeQuery {
  page: number;
  pageSize: number;
  search: string;
  departmentId: string;
  employmentStatus: string;
  employmentType: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

/** Department option for dropdowns */
export interface DepartmentOption {
  id: string;
  name: string;
  code: string;
}

/** Result type for create operation (includes generated password) */
export interface CreateResult {
  success: boolean;
  error?: string;
  data?: {
    employee: unknown;
    generatedPassword: string;
  };
  message?: string;
}

const DEFAULT_QUERY: EmployeeQuery = {
  page: 1,
  pageSize: 10,
  search: '',
  departmentId: '',
  employmentStatus: '',
  employmentType: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

/**
 * Hook for managing employees list with filters, search, and operations.
 */
export function useEmployees() {
  const [data, setData] = useState<PaginatedResponse<unknown> | null>(null);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<EmployeeQuery>(DEFAULT_QUERY);

  /** Build query string from current filters */
  const buildQueryString = useCallback((q: EmployeeQuery): string => {
    const params = new URLSearchParams();
    params.set('page', String(q.page));
    params.set('pageSize', String(q.pageSize));
    if (q.search) params.set('search', q.search);
    if (q.departmentId) params.set('departmentId', q.departmentId);
    if (q.employmentStatus) params.set('employmentStatus', q.employmentStatus);
    if (q.employmentType) params.set('employmentType', q.employmentType);
    params.set('sortBy', q.sortBy);
    params.set('sortOrder', q.sortOrder);
    return params.toString();
  }, []);

  /** Fetch employees */
  const fetchEmployees = useCallback(async (q: EmployeeQuery) => {
    setIsLoading(true);
    setError(null);
    try {
      const qs = buildQueryString(q);
      const res = await fetch(`/api/employees?${qs}`);
      const result = await res.json();

      if (!result.success) {
        setError(result.error ?? 'Failed to fetch employees');
        return;
      }

      setData(result.data);
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [buildQueryString]);

  /** Fetch departments for dropdown */
  const fetchDepartments = useCallback(async () => {
    try {
      const res = await fetch('/api/departments');
      const result = await res.json();
      if (result.success) {
        setDepartments(result.data);
      }
    } catch {
      // Silently fail — departments dropdown just stays empty
    }
  }, []);

  /** Initial fetch */
  useEffect(() => {
    fetchEmployees(query);
    fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Refetch with current query */
  const refetch = useCallback(() => {
    fetchEmployees(query);
  }, [fetchEmployees, query]);

  /** Update filters (resets to page 1) */
  const updateFilters = useCallback((filters: Partial<EmployeeQuery>) => {
    const newQuery = { ...query, ...filters, page: 1 };
    setQuery(newQuery);
    fetchEmployees(newQuery);
  }, [query, fetchEmployees]);

  /** Change page */
  const goToPage = useCallback((page: number) => {
    const newQuery = { ...query, page };
    setQuery(newQuery);
    fetchEmployees(newQuery);
  }, [query, fetchEmployees]);

  /** Create employee — returns generated password */
  const createEmployee = useCallback(async (formData: unknown): Promise<CreateResult> => {
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        refetch();
      }
      return result;
    } catch {
      return { success: false, error: 'Failed to create employee' };
    }
  }, [refetch]);

  /** Update employee profile */
  const updateEmployee = useCallback(async (id: string, formData: unknown): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        refetch();
      }
      return result;
    } catch {
      return { success: false, error: 'Failed to update employee' };
    }
  }, [refetch]);

  /** Change employee status (activate, deactivate, terminate) */
  const changeEmployeeStatus = useCallback(async (
    id: string,
    status: string,
    reason: string
  ): Promise<{ success: boolean; error?: string; message?: string }> => {
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employmentStatus: status, reason }),
      });
      const result = await res.json();
      if (result.success) {
        refetch();
      }
      return result;
    } catch {
      return { success: false, error: 'Failed to change employee status' };
    }
  }, [refetch]);

  return {
    // Data
    data,
    departments,
    query,
    isLoading,
    error,
    // Actions
    updateFilters,
    goToPage,
    createEmployee,
    updateEmployee,
    changeEmployeeStatus,
    refetch,
  };
}
