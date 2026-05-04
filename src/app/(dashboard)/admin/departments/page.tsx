/**
 * @file Admin departments page — orchestrates all department components.
 * Client component that manages modal state and delegates to:
 * - useDepartments hook (bridge layer)
 * - DepartmentFilters (search + filters)
 * - DepartmentTable (data display)
 * - DepartmentFormModal (create/edit)
 * - ToggleStatusDialog (activate/deactivate)
 *
 * Design: No hard delete — departments are activated/deactivated.
 */

'use client';

import { useState, useCallback } from 'react';
import { useDepartments } from '@/hooks/departments/useDepartments';
import type { DepartmentRow } from '@/hooks/departments/useDepartments';
import DepartmentFilters from '@/components/features/departments/DepartmentFilters';
import DepartmentTable from '@/components/features/departments/DepartmentTable';
import DepartmentFormModal from '@/components/features/departments/DepartmentFormModal';
import ToggleStatusDialog from '@/components/features/departments/ToggleStatusDialog';

type ModalMode = 'closed' | 'create' | 'edit';

export default function AdminDepartmentsPage() {
  const {
    departments,
    managers,
    isLoading,
    error,
    filters,
    updateFilters,
    createDepartment,
    updateDepartment,
    toggleStatus,
  } = useDepartments();

  // Modal state
  const [modalMode, setModalMode] = useState<ModalMode>('closed');
  const [selectedDept, setSelectedDept] = useState<DepartmentRow | null>(null);
  const [showToggleDialog, setShowToggleDialog] = useState(false);

  // Handlers
  const openCreateModal = useCallback(() => {
    setSelectedDept(null);
    setModalMode('create');
  }, []);

  const openEditModal = useCallback((dept: DepartmentRow) => {
    setSelectedDept(dept);
    setModalMode('edit');
  }, []);

  const openToggleDialog = useCallback((dept: DepartmentRow) => {
    setSelectedDept(dept);
    setShowToggleDialog(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalMode('closed');
    setSelectedDept(null);
  }, []);

  const closeToggleDialog = useCallback(() => {
    setShowToggleDialog(false);
    setSelectedDept(null);
  }, []);

  // Form submit
  const handleFormSubmit = useCallback(
    async (formData: Record<string, unknown>) => {
      if (modalMode === 'create') {
        return createDepartment(formData);
      }
      if (selectedDept) {
        return updateDepartment(selectedDept.id, formData);
      }
      return { success: false, error: 'No department selected' };
    },
    [modalMode, selectedDept, createDepartment, updateDepartment]
  );

  // Toggle status
  const handleToggle = useCallback(
    async (isActive: boolean) => {
      if (!selectedDept) return { success: false, error: 'No department selected' };
      return toggleStatus(selectedDept.id, isActive);
    },
    [selectedDept, toggleStatus]
  );

  // Stats
  const totalDepts = departments.length;
  const activeDepts = departments.filter((d) => d.isActive).length;
  const totalEmployees = departments.reduce((sum, d) => sum + d._count.employees, 0);
  const withManagers = departments.filter((d) => d.manager).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Departments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage company departments, assign managers, and control department hierarchy.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Departments', value: totalDepts, color: 'border-l-primary-500' },
          { label: 'Active', value: activeDepts, color: 'border-l-success-500' },
          { label: 'Total Employees', value: totalEmployees, color: 'border-l-info-500' },
          { label: 'With Managers', value: withManagers, color: 'border-l-secondary-500' },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl border border-border border-l-4 ${stat.color} bg-card px-5 py-4 shadow-sm transition-shadow hover:shadow-md`}
          >
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <DepartmentFilters
        filters={filters}
        onFilterChange={updateFilters}
        onCreateClick={openCreateModal}
      />

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-danger-500/30 bg-danger-50 px-4 py-3 text-sm text-danger-700" role="alert">
          {error}
        </div>
      )}

      {/* Table */}
      <DepartmentTable
        departments={departments}
        isLoading={isLoading}
        onEdit={openEditModal}
        onToggleStatus={openToggleDialog}
      />

      {/* Create/Edit Modal */}
      <DepartmentFormModal
        isOpen={modalMode !== 'closed'}
        onClose={closeModal}
        onSubmit={handleFormSubmit}
        managers={managers}
        departments={departments}
        initialData={selectedDept}
        mode={modalMode === 'edit' ? 'edit' : 'create'}
      />

      {/* Toggle Status Dialog */}
      <ToggleStatusDialog
        isOpen={showToggleDialog}
        onClose={closeToggleDialog}
        onConfirm={handleToggle}
        departmentName={selectedDept?.name ?? ''}
        currentlyActive={selectedDept?.isActive ?? true}
        employeeCount={selectedDept?._count.employees ?? 0}
      />
    </div>
  );
}
