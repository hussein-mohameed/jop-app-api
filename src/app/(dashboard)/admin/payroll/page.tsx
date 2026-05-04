'use client';

import React, { useState } from 'react';
import { usePayroll } from '@/hooks/payroll/usePayroll';
import type { PayrollSummary } from '@/types/payroll.types';
import CrudPageLayout from '@/components/shared/CrudPageLayout';
import DataTable, { ColumnDef } from '@/components/ui/DataTable';
import DataFilters, { FilterDef } from '@/components/ui/DataFilters';
import StatusBadge from '@/components/ui/StatusBadge';
import PayrollRunModal from '@/components/features/payroll/PayrollRunModal';

function getStatusLabel(status: PayrollSummary['status']) {
  switch (status) {
    case 'DRAFT': return 'Draft';
    case 'PROCESSING': return 'Processing';
    case 'COMPLETED': return 'Completed';
    case 'PAID': return 'Paid';
    default: return status;
  }
}

export default function AdminPayrollPage() {
  const {
    data,
    total,
    isLoading,
    query,
    setQuery,
    processPayroll,
    markAsPaid
  } = usePayroll();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns: ColumnDef<PayrollSummary>[] = [
    {
      key: 'period',
      header: 'Payroll Period',
      renderCell: (item) => (
        <div>
          <p className="font-medium text-foreground">{item.id}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(item.year, item.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      )
    },
    { 
      key: 'totalEmployees', 
      header: 'Employees',
      renderCell: (item) => <span className="text-muted-foreground">{item.totalEmployees}</span>
    },
    {
      key: 'totalGrossPay',
      header: 'Gross Pay',
      renderCell: (item) => <span className="font-medium">${item.totalGrossPay.toLocaleString()}</span>
    },
    {
      key: 'totalNetPay',
      header: 'Net Pay',
      renderCell: (item) => <span className="font-medium text-success">${item.totalNetPay.toLocaleString()}</span>
    },
    {
      key: 'status',
      header: 'Status',
      renderCell: (item) => <StatusBadge status={item.status} label={getStatusLabel(item.status)} />
    }
  ];

  const filters: FilterDef[] = [
    {
      key: 'status',
      label: 'All Statuses',
      options: [
        { value: 'DRAFT', label: 'Draft' },
        { value: 'PROCESSING', label: 'Processing' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'PAID', label: 'Paid' }
      ]
    },
    {
      key: 'year',
      label: 'All Years',
      options: [
        { value: 2026, label: '2026' },
        { value: 2025, label: '2025' }
      ]
    }
  ];

  const processingCount = data.filter(p => p.status === 'PROCESSING').length;
  const totalPaid = data.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.totalNetPay, 0);

  return (
    <>
      <CrudPageLayout
        title="Payroll Management"
        description="Manage employee salaries, generate payroll runs, and track payments."
        stats={[
          { label: 'Total Runs', value: total },
          { label: 'Processing', value: processingCount, color: 'warning' },
          { label: 'Total Paid', value: `$${totalPaid.toLocaleString()}`, color: 'success' },
        ]}
        filters={
          <DataFilters
            searchQuery={query.search}
            searchPlaceholder="Search by ID..."
            onSearchChange={(search) => setQuery((prev) => ({ ...prev, search }))}
            filters={filters}
            activeFilters={{ status: query.status || '', year: query.year || '' }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onFilterChange={(key, value) => setQuery((prev) => ({ ...prev, [key]: value as any }))}
            onClearFilters={() => setQuery({ search: '', status: '', year: '' })}
            actionButton={{
              label: 'Run Payroll',
              onClick: () => setIsModalOpen(true)
            }}
          />
        }
        table={
          <DataTable<PayrollSummary>
            data={data}
            columns={columns}
            keyExtractor={(item) => item.id}
            isLoading={isLoading}
            actions={[
              {
                label: 'Process',
                icon: (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                ),
                onClick: (item) => processPayroll(item.id),
                variant: 'primary'
              },
              {
                label: 'Mark Paid',
                icon: (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ),
                onClick: (item) => markAsPaid(item.id),
                variant: 'success'
              }
            ]}
          />
        }
      />

      <PayrollRunModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
