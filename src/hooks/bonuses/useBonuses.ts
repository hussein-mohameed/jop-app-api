/**
 * @file Hook for managing Bonuses data.
 * Connected to the backend API — replaces previous mock data.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Bonus } from '@/types/bonus.types';
import type { ApprovalStatus } from '@/types/common.types';

export interface BonusQuery {
  search?: string;
  status?: ApprovalStatus | '';
}

export function useBonuses() {
  const [query, setQuery] = useState<BonusQuery>({ search: '', status: '' });
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBonuses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query.search) params.set('search', query.search);
      if (query.status) params.set('status', query.status);
      params.set('pageSize', '100');

      const res = await fetch(`/api/bonuses?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data?.items) {
        setBonuses(json.data.items.map(mapApiBonus));
      } else {
        setError(json.error || 'Failed to load bonuses');
      }
    } catch {
      setError('Failed to load bonuses');
    } finally {
      setIsLoading(false);
    }
  }, [query.search, query.status]);

  useEffect(() => { fetchBonuses(); }, [fetchBonuses]);

  const filteredBonuses = useMemo(() => bonuses, [bonuses]);

  const approveBonus = async (id: string, notes?: string) => {
    try {
      const res = await fetch(`/api/bonuses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED', approvalNotes: notes }),
      });
      const json = await res.json();
      if (json.success) fetchBonuses();
    } catch { /* handled by re-fetch */ }
  };

  const rejectBonus = async (id: string, notes?: string) => {
    try {
      const res = await fetch(`/api/bonuses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED', approvalNotes: notes }),
      });
      const json = await res.json();
      if (json.success) fetchBonuses();
    } catch { /* handled by re-fetch */ }
  };

  return {
    data: filteredBonuses,
    total: filteredBonuses.length,
    isLoading,
    error,
    query,
    setQuery,
    approveBonus,
    rejectBonus,
    refetch: fetchBonuses,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiBonus(item: any): Bonus {
  return {
    id: item.id,
    employeeId: item.employeeId,
    employeeName: 'Employee', // Bonus model doesn't join employee name — will use ID
    amount: item.amount,
    reason: item.reason,
    status: item.status,
    suggestedById: item.suggestedById,
    suggestedByName: item.suggestedBy
      ? `${item.suggestedBy.firstName} ${item.suggestedBy.lastName}`
      : 'Unknown',
    approvedById: item.approvedById ?? undefined,
    approvedByName: item.approvedBy
      ? `${item.approvedBy.firstName} ${item.approvedBy.lastName}`
      : undefined,
    approvedAt: item.approvedAt ? new Date(item.approvedAt) : undefined,
    approvalNotes: item.approvalNotes ?? undefined,
    payrollMonth: item.payrollMonth ?? undefined,
    payrollYear: item.payrollYear ?? undefined,
    isIncludedInPayroll: item.isIncludedInPayroll,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  };
}
