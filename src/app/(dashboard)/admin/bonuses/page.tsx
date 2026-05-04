'use client';

import React, { useState } from 'react';
import { useBonuses } from '@/hooks/bonuses/useBonuses';
import type { Bonus } from '@/types/bonus.types';
import CrudPageLayout from '@/components/shared/CrudPageLayout';
import DataTable, { ColumnDef } from '@/components/ui/DataTable';
import DataFilters, { FilterDef } from '@/components/ui/DataFilters';
import StatusBadge from '@/components/ui/StatusBadge';
import BonusReviewModal from '@/components/features/bonuses/BonusReviewModal';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function AdminBonusesPage() {
  const {
    data,
    total,
    isLoading,
    query,
    setQuery,
    approveBonus,
    rejectBonus
  } = useBonuses();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBonus, setSelectedBonus] = useState<Bonus | null>(null);

  const openReviewModal = (bonus: Bonus) => {
    setSelectedBonus(bonus);
    setIsModalOpen(true);
  };

  const columns: ColumnDef<Bonus>[] = [
    {
      key: 'employee',
      header: 'Employee',
      renderCell: (item) => (
        <Link href={`/admin/employees/${item.employeeId}`} className="font-medium text-foreground hover:text-primary-600 transition-colors">
          {item.employeeName}
        </Link>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      renderCell: (item) => <span className="font-bold text-success-600">${item.amount.toLocaleString()}</span>
    },
    {
      key: 'suggestedBy',
      header: 'Suggested By',
      renderCell: (item) => (
        <div>
          <Link href={`/admin/employees/${item.suggestedById}`} className="text-sm text-foreground hover:text-primary-600 transition-colors">
            {item.suggestedByName}
          </Link>
          <p className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      renderCell: (item) => <StatusBadge status={item.status} />
    },
    {
      key: 'payroll',
      header: 'Payroll Status',
      renderCell: (item) => (
        <span className={`text-xs font-medium ${item.isIncludedInPayroll ? 'text-success-600' : 'text-muted-foreground'}`}>
          {item.isIncludedInPayroll ? `Included (${item.payrollMonth}/${item.payrollYear})` : 'Not Included'}
        </span>
      )
    }
  ];

  const filters: FilterDef[] = [
    {
      key: 'status',
      label: 'All Statuses',
      options: [
        { value: 'PENDING', label: 'Pending' },
        { value: 'APPROVED', label: 'Approved' },
        { value: 'REJECTED', label: 'Rejected' }
      ]
    }
  ];

  const pendingCount = data.filter(b => b.status === 'PENDING').length;
  const totalApprovedAmount = data.filter(b => b.status === 'APPROVED').reduce((sum, b) => sum + b.amount, 0);

  return (
    <>
      <CrudPageLayout
        title="Bonus Management"
        description="Review, approve, and manage employee performance bonuses."
        stats={[
          { label: 'Total Suggestions', value: total },
          { label: 'Pending Review', value: pendingCount, color: 'warning' },
          { label: 'Approved Amount', value: `$${totalApprovedAmount.toLocaleString()}`, color: 'success' },
        ]}
        filters={
          <DataFilters
            searchQuery={query.search}
            searchPlaceholder="Search by employee name or ID..."
            onSearchChange={(search) => setQuery((prev) => ({ ...prev, search }))}
            filters={filters}
            activeFilters={{ status: query.status || '' }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onFilterChange={(key, value) => setQuery((prev) => ({ ...prev, [key]: value as any }))}
            onClearFilters={() => setQuery({ search: '', status: '' })}
            // Only managers suggest bonuses normally, but admins could have an action button here if needed
          />
        }
        table={
          <DataTable<Bonus>
            data={data}
            columns={columns}
            keyExtractor={(item) => item.id}
            isLoading={isLoading}
            actions={[
              {
                label: 'Review',
                icon: (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                onClick: openReviewModal,
                variant: 'primary'
              }
            ]}
          />
        }
      />

      <BonusReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bonus={selectedBonus}
        onApprove={approveBonus}
        onReject={rejectBonus}
      />
    </>
  );
}
