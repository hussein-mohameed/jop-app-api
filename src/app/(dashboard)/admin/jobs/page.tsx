/**
 * @file Admin Jobs Page.
 * Implemented using generic reusable UI components.
 */

'use client';

import React, { useState } from 'react';
import { useJobs } from '@/hooks/jobs/useJobs';
import type { JobSummary, JobStatus } from '@/types/job.types';
import CrudPageLayout from '@/components/shared/CrudPageLayout';
import DataTable, { ColumnDef } from '@/components/ui/DataTable';
import DataFilters, { FilterDef } from '@/components/ui/DataFilters';
import StatusBadge from '@/components/ui/StatusBadge';
import JobFormModal from '@/components/features/jobs/JobFormModal';

function getStatusLabel(status: JobStatus) {
  switch (status) {
    case 'PUBLISHED': return 'Published';
    case 'DRAFT': return 'Draft';
    case 'CLOSED': return 'Closed';
    case 'PENDING_APPROVAL': return 'Pending';
    case 'CANCELLED': return 'Cancelled';
    default: return status;
  }
}

export default function AdminJobsPage() {
  const {
    data,
    total,
    isLoading,
    query,
    setQuery,
    publishJob,
    closeJob,
    deleteJob
  } = useJobs();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedJob, setSelectedJob] = useState<any>(null);

  const openCreateModal = () => {
    setSelectedJob(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const openEditModal = (job: JobSummary) => {
    setSelectedJob(job);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // 1. Define Columns strictly typed to <JobSummary>
  const columns: ColumnDef<JobSummary>[] = [
    {
      key: 'title',
      header: 'Job Title & Dept',
      renderCell: (item) => (
        <div>
          <p className="font-medium text-foreground">{item.title}</p>
          <p className="text-xs text-muted-foreground">{item.department}</p>
        </div>
      )
    },
    { key: 'location', header: 'Location' },
    {
      key: 'jobType',
      header: 'Type',
      renderCell: (item) => <span className="text-muted-foreground">{item.jobType.replace('_', ' ')}</span>
    },
    {
      key: 'applicationCount',
      header: 'Applications',
      renderCell: (item) => (
        <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary-700">
          {item.applicationCount}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      renderCell: (item) => <StatusBadge status={item.status} />
    }
  ];

  // 2. Define Filters
  const filters: FilterDef[] = [
    {
      key: 'status',
      label: 'All Statuses',
      options: [
        { value: 'PUBLISHED', label: 'Published' },
        { value: 'DRAFT', label: 'Draft' },
        { value: 'CLOSED', label: 'Closed' }
      ]
    },
    {
      key: 'type',
      label: 'All Types',
      options: [
        { value: 'FULL_TIME', label: 'Full Time' },
        { value: 'PART_TIME', label: 'Part Time' },
        { value: 'CONTRACT', label: 'Contract' },
        { value: 'INTERNSHIP', label: 'Internship' },
        { value: 'REMOTE', label: 'Remote' }
      ]
    }
  ];

  // 3. Stats calculation
  const publishedCount = data.filter(j => j.status === 'PUBLISHED').length;
  const totalApps = data.reduce((sum, j) => sum + j.applicationCount, 0);

  return (
    <>
      <CrudPageLayout
        title="Job Postings"
        description="Manage job listings and track applications."
        stats={[
          { label: 'Total Postings', value: total },
          { label: 'Active (Published)', value: publishedCount, color: 'success' },
          { label: 'Total Applications', value: totalApps, color: 'primary' },
        ]}
        filters={
          <DataFilters
            searchQuery={query.search}
            searchPlaceholder="Search by job title or department..."
            onSearchChange={(search) => setQuery((prev) => ({ ...prev, search }))}
            filters={filters}
            activeFilters={{ status: query.status || '', type: query.type || '' }}
            onFilterChange={(key, value) => setQuery((prev) => ({ ...prev, [key]: value as any }))}
            onClearFilters={() => setQuery({ search: '', status: '', type: '' })}
            actionButton={{
              label: 'Post New Job',
              onClick: openCreateModal
            }}
          />
        }
        table={
          <DataTable<JobSummary>
            data={data}
            columns={columns}
            keyExtractor={(item) => item.id}
            isLoading={isLoading}
            actions={[
              {
                label: 'Edit',
                icon: (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                ),
                onClick: openEditModal
              },
              {
                label: 'Publish',
                icon: (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                ),
                onClick: (item) => publishJob(item.id),
                variant: 'primary'
              },
              {
                label: 'Close Job',
                icon: (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                ),
                onClick: (item) => closeJob(item.id),
                variant: 'warning'
              },
              {
                label: 'Delete',
                icon: (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                ),
                onClick: (item) => {
                  if (confirm('Are you sure you want to delete this job?')) deleteJob(item.id);
                },
                variant: 'danger'
              }
            ]}
          />
        }
      />

      <JobFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        initialData={selectedJob}
      />
    </>
  );
}
