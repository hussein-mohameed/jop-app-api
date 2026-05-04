'use client';

import React, { useState } from 'react';
import { useLeaves } from '@/hooks/leaves/useLeaves';
import type { Leave } from '@/types/leave.types';
import CrudPageLayout from '@/components/shared/CrudPageLayout';
import DataTable, { ColumnDef } from '@/components/ui/DataTable';
import DataFilters, { FilterDef } from '@/components/ui/DataFilters';
import StatusBadge from '@/components/ui/StatusBadge';
import LeaveReviewModal from '@/components/features/leaves/LeaveReviewModal';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function AdminLeavesPage() {
  const {
    data,
    total,
    isLoading,
    query,
    setQuery,
    approveLeave,
    rejectLeave
  } = useLeaves();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);

  const openReviewModal = (leave: Leave) => {
    setSelectedLeave(leave);
    setIsModalOpen(true);
  };

  const columns: ColumnDef<Leave>[] = [
    {
      key: 'employee',
      header: 'Employee & Dept',
      renderCell: (item) => (
        <div>
          <Link href={`/admin/employees/${item.employeeId}`} className="font-medium text-foreground hover:text-primary-600 transition-colors">
            {item.employeeName}
          </Link>
          <p className="text-xs text-muted-foreground">{item.departmentName}</p>
        </div>
      )
    },
    {
      key: 'leaveType',
      header: 'Leave Type',
      renderCell: (item) => <span className="text-muted-foreground">{item.leaveTypeName}</span>
    },
    {
      key: 'duration',
      header: 'Duration',
      renderCell: (item) => (
        <div>
          <p className="text-sm text-foreground">{item.totalDays} Days</p>
          <p className="text-xs text-muted-foreground">
            {formatDate(item.startDate)} - {formatDate(item.endDate)}
          </p>
        </div>
      )
    },
    {
      key: 'appliedOn',
      header: 'Applied On',
      renderCell: (item) => <span className="text-muted-foreground">{formatDate(item.createdAt)}</span>
    },
    {
      key: 'status',
      header: 'Status',
      renderCell: (item) => <StatusBadge status={item.status} />
    }
  ];

  const filters: FilterDef[] = [
    {
      key: 'status',
      label: 'All Statuses',
      options: [
        { value: 'PENDING', label: 'Pending' },
        { value: 'APPROVED', label: 'Approved' },
        { value: 'REJECTED', label: 'Rejected' },
        { value: 'CANCELLED', label: 'Cancelled' }
      ]
    },
    {
      key: 'leaveType',
      label: 'All Leave Types',
      options: [
        { value: 'Annual Leave', label: 'Annual Leave' },
        { value: 'Sick Leave', label: 'Sick Leave' },
        { value: 'Unpaid Leave', label: 'Unpaid Leave' },
        { value: 'Maternity Leave', label: 'Maternity Leave' }
      ]
    }
  ];

  const pendingCount = data.filter(l => l.status === 'PENDING').length;
  const approvedCount = data.filter(l => l.status === 'APPROVED').length;

  return (
    <>
      <CrudPageLayout
        title="Leave Management"
        description="Review and manage employee time-off requests."
        stats={[
          { label: 'Total Requests', value: total },
          { label: 'Pending Review', value: pendingCount, color: 'warning' },
          { label: 'Approved (Selected)', value: approvedCount, color: 'success' },
        ]}
        filters={
          <DataFilters
            searchQuery={query.search}
            searchPlaceholder="Search by employee name or ID..."
            onSearchChange={(search) => setQuery((prev) => ({ ...prev, search }))}
            filters={filters}
            activeFilters={{ status: query.status || '', leaveType: query.leaveType || '' }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onFilterChange={(key, value) => setQuery((prev) => ({ ...prev, [key]: value as any }))}
            onClearFilters={() => setQuery({ search: '', status: '', leaveType: '' })}
            // No action button needed here as creating leave is usually an employee action
          />
        }
        table={
          <DataTable<Leave>
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

      <LeaveReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        leave={selectedLeave}
        onApprove={approveLeave}
        onReject={rejectLeave}
      />
    </>
  );
}
