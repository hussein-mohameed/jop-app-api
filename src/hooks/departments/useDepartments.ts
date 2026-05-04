/**
 * @file useDepartments hook — bridge layer for department management.
 * Fetches and mutates department data via API.
 * NO business logic — only API interaction and state management.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

// ==================== TYPES ====================

export interface DepartmentRow {
  id: string;
  name: string;
  code: string;
  description: string | null;
  managerId: string | null;
  parentId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  manager: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  parent: {
    id: string;
    name: string;
    code: string;
  } | null;
  _count: {
    employees: number;
    children: number;
    jobs: number;
  };
}

export interface ManagerOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface FiltersState {
  search: string;
  isActive: string; // '' | 'true' | 'false'
}

// ==================== HOOK ====================

export function useDepartments() {
  const [departments, setDepartments] = useState<DepartmentRow[]>([]);
  const [managers, setManagers] = useState<ManagerOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FiltersState>({ search: '', isActive: '' });

  // ---- Fetch departments ----
  const fetchDepartments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.isActive) params.set('isActive', filters.isActive);

      const res = await fetch(`/api/admin/departments?${params.toString()}`);
      const result = await res.json();

      if (!result.success) {
        setError(result.error ?? 'Failed to load departments');
        return;
      }

      setDepartments(result.data);
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // ---- Fetch managers ----
  const fetchManagers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/departments/managers');
      const result = await res.json();
      if (result.success) {
        setManagers(result.data);
      }
    } catch {
      // Non-critical — silently fail
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
    fetchManagers();
  }, [fetchDepartments, fetchManagers]);

  // ---- Update filters ----
  const updateFilters = useCallback((newFilters: Partial<FiltersState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // ---- Create ----
  const createDepartment = useCallback(
    async (data: Record<string, unknown>) => {
      try {
        const res = await fetch('/api/admin/departments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await res.json();

        if (result.success) {
          await fetchDepartments();
        }

        return result;
      } catch {
        return { success: false, error: 'Failed to create department' };
      }
    },
    [fetchDepartments]
  );

  // ---- Update ----
  const updateDepartment = useCallback(
    async (id: string, data: Record<string, unknown>) => {
      try {
        const res = await fetch(`/api/admin/departments/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await res.json();

        if (result.success) {
          await fetchDepartments();
        }

        return result;
      } catch {
        return { success: false, error: 'Failed to update department' };
      }
    },
    [fetchDepartments]
  );

  // ---- Toggle status ----
  const toggleStatus = useCallback(
    async (id: string, isActive: boolean) => {
      try {
        const res = await fetch(`/api/admin/departments/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive }),
        });
        const result = await res.json();

        if (result.success) {
          await fetchDepartments();
        }

        return result;
      } catch {
        return { success: false, error: 'Failed to toggle status' };
      }
    },
    [fetchDepartments]
  );

  return {
    departments,
    managers,
    isLoading,
    error,
    filters,
    updateFilters,
    createDepartment,
    updateDepartment,
    toggleStatus,
    refetch: fetchDepartments,
  };
}
