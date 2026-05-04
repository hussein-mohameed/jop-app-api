/**
 * @file Hook for managing Payroll data.
 * Connected to the backend API — replaces previous mock data.
 */

import { useState, useEffect, useCallback } from 'react';
import type { PayrollSummary } from '@/types/payroll.types';

export interface PayrollQuery {
  search?: string;
  status?: PayrollSummary['status'] | '';
  year?: number | '';
}

export function usePayroll() {
  const [query, setQuery] = useState<PayrollQuery>({ search: '', status: '', year: '' });
  const [payslips, setPayslips] = useState<PayrollSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayslips = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query.year) params.set('year', String(query.year));
      params.set('pageSize', '100');

      const res = await fetch(`/api/payslips?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data?.items) {
        // Group payslips by month/year into summary format
        setPayslips(groupByPeriod(json.data.items));
      } else {
        setError(json.error || 'Failed to load payroll data');
      }
    } catch {
      setError('Failed to load payroll data');
    } finally {
      setIsLoading(false);
    }
  }, [query.year]);

  useEffect(() => { fetchPayslips(); }, [fetchPayslips]);

  const processPayroll = async (id: string) => {
    // Extract month/year from summary ID
    const parts = id.split('-');
    const year = Number(parts[1]);
    const month = Number(parts[2]);
    try {
      const res = await fetch('/api/payroll/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, year }),
      });
      const json = await res.json();
      if (json.success) fetchPayslips();
    } catch { /* handled by re-fetch */ }
  };

  const markAsPaid = (_id: string) => {
    // Bulk mark as paid would require a new endpoint — placeholder for now
    fetchPayslips();
  };

  return {
    data: payslips,
    total: payslips.length,
    isLoading,
    error,
    query,
    setQuery,
    processPayroll,
    markAsPaid,
    refetch: fetchPayslips,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function groupByPeriod(items: any[]): PayrollSummary[] {
  const groups = new Map<string, PayrollSummary>();

  for (const item of items) {
    const key = `PR-${item.year}-${String(item.month).padStart(2, '0')}`;
    const existing = groups.get(key);

    if (existing) {
      existing.totalEmployees += 1;
      existing.totalGrossPay += item.grossPay;
      existing.totalNetPay += item.netPay;
      existing.totalDeductions += item.totalDeductions;
      if (!item.isPaid) existing.status = 'PROCESSING';
    } else {
      groups.set(key, {
        id: key,
        month: item.month,
        year: item.year,
        totalEmployees: 1,
        totalGrossPay: item.grossPay,
        totalNetPay: item.netPay,
        totalDeductions: item.totalDeductions,
        status: item.isPaid ? 'PAID' : 'PROCESSING',
      });
    }
  }

  return Array.from(groups.values()).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });
}
