/**
 * @file Hook for managing Leaves data.
 * Connected to the backend API — replaces previous mock data.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Leave } from '@/types/leave.types';
import type { ApprovalStatus } from '@/types/common.types';

export interface LeaveQuery {
  search?: string;
  status?: ApprovalStatus | '';
  leaveType?: string | '';
}

export function useLeaves() {
  const [query, setQuery] = useState<LeaveQuery>({ search: '', status: '', leaveType: '' });
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaves = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query.search) params.set('search', query.search);
      if (query.status) params.set('status', query.status);
      if (query.leaveType) params.set('leaveTypeId', query.leaveType);
      params.set('pageSize', '100');

      const res = await fetch(`/api/leaves?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data?.items) {
        // Map API response to Leave type expected by UI
        setLeaves(json.data.items.map(mapApiLeave));
      } else {
        setError(json.error || 'Failed to load leaves');
      }
    } catch {
      setError('Failed to load leaves');
    } finally {
      setIsLoading(false);
    }
  }, [query.search, query.status, query.leaveType]);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  const filteredLeaves = useMemo(() => leaves, [leaves]);

  const approveLeave = async (id: string, notes?: string) => {
    try {
      const res = await fetch(`/api/leaves/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED', approvalNotes: notes }),
      });
      const json = await res.json();
      if (json.success) fetchLeaves();
    } catch { /* handled by re-fetch */ }
  };

  const rejectLeave = async (id: string, notes?: string) => {
    try {
      const res = await fetch(`/api/leaves/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED', approvalNotes: notes }),
      });
      const json = await res.json();
      if (json.success) fetchLeaves();
    } catch { /* handled by re-fetch */ }
  };

  return {
    data: filteredLeaves,
    total: filteredLeaves.length,
    isLoading,
    error,
    query,
    setQuery,
    approveLeave,
    rejectLeave,
    refetch: fetchLeaves,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiLeave(item: any): Leave {
  return {
    id: item.id,
    employeeId: item.employeeId,
    employeeName: item.employee
      ? `${item.employee.firstName} ${item.employee.lastName}`
      : 'Unknown',
    leaveTypeId: item.leaveTypeId,
    leaveTypeName: item.leaveType?.name ?? 'Unknown',
    startDate: new Date(item.startDate),
    endDate: new Date(item.endDate),
    totalDays: item.totalDays,
    reason: item.reason,
    status: item.status,
    approvedById: item.approvedById ?? undefined,
    approvedByName: item.approvedBy
      ? `${item.approvedBy.firstName} ${item.approvedBy.lastName}`
      : undefined,
    approvedAt: item.approvedAt ? new Date(item.approvedAt) : undefined,
    approvalNotes: item.approvalNotes ?? undefined,
    departmentId: '',
    departmentName: undefined,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  };
}
