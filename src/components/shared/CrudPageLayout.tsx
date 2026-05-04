/**
 * @file Generic CRUD Page Layout.
 * Orchestrates PageHeader, DataFilters, DataTable, and Pagination into a single reusable layout.
 * Enforces DRY principles across the entire application's data views.
 */

'use client';

import React from 'react';
import PageHeader, { StatCard } from '@/components/ui/PageHeader';

export interface CrudPageLayoutProps {
  /** Page Title */
  title: string;
  /** Page description */
  description: string;
  /** Optional statistics cards */
  stats?: StatCard[];
  
  /** The DataFilters component instance */
  filters?: React.ReactNode;
  /** The DataTable component instance */
  table: React.ReactNode;
  /** The Pagination component instance */
  pagination?: React.ReactNode;
  /** Any Modals (Create/Edit) to render at the bottom of the tree */
  modals?: React.ReactNode;

  /** Any general error message to display above the table */
  error?: string | null;
}

/**
 * A highly reusable Layout for any CRUD page (Leaves, Payroll, Employees, Jobs, etc).
 * 
 * @example
 * <CrudPageLayout
 *   title="Leaves"
 *   description="Manage employee leaves"
 *   filters={<DataFilters ... />}
 *   table={<DataTable ... />}
 *   pagination={<Pagination ... />}
 *   modals={<LeaveFormModal ... />}
 * />
 */
export default function CrudPageLayout({
  title,
  description,
  stats,
  filters,
  table,
  pagination,
  modals,
  error,
}: CrudPageLayoutProps) {
  return (
    <div className="space-y-6">
      {/* 1. Header & Stats */}
      <PageHeader title={title} description={description} stats={stats} />

      {/* 2. Filters & Search Bar */}
      {filters && (
        <div className="mt-6">
          {filters}
        </div>
      )}

      {/* 3. Error State (if any) */}
      {error && (
        <div className="rounded-lg border border-danger-500/30 bg-danger-50 px-4 py-3 text-sm text-danger-700" role="alert">
          {error}
        </div>
      )}

      {/* 4. Data Table */}
      <div className="mt-4">
        {table}
      </div>

      {/* 5. Pagination */}
      {pagination && (
        <div className="mt-4">
          {pagination}
        </div>
      )}

      {/* 6. Hidden Modals */}
      {modals}
    </div>
  );
}
