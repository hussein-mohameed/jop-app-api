/**
 * @file Admin employees page — orchestrates all employee components.
 * Client component that manages modal state and delegates to:
 * - useEmployees hook (bridge layer)
 * - EmployeeFilters (search + filters)
 * - EmployeeTable (data display)
 * - EmployeeFormModal (create/edit)
 * - StatusChangeDialog (activate/deactivate/terminate)
 * - PasswordRevealDialog (show generated password after create)
 * - Pagination (page navigation)
 *
 * Design:
 * - No delete — employees are deactivated/terminated via StatusChangeDialog.
 * - Passwords are auto-generated — shown in PasswordRevealDialog once.
 */

'use client';

import { useState, useCallback } from 'react';
import { useEmployees } from '@/hooks/employees/useEmployees';
import type { CreateResult } from '@/hooks/employees/useEmployees';
import EmployeeFilters from '@/components/features/employees/EmployeeFilters';
import EmployeeTable from '@/components/features/employees/EmployeeTable';
import EmployeeFormModal from '@/components/features/employees/EmployeeFormModal';
import StatusChangeDialog from '@/components/features/employees/StatusChangeDialog';
import PasswordRevealDialog from '@/components/features/employees/PasswordRevealDialog';
import Pagination from '@/components/ui/Pagination';

type ModalMode = 'closed' | 'create' | 'edit';

/** Password reveal state after successful creation */
interface PasswordReveal {
  isOpen: boolean;
  employeeName: string;
  employeeId: string;
  email: string;
  generatedPassword: string;
}

const INITIAL_PASSWORD_STATE: PasswordReveal = {
  isOpen: false,
  employeeName: '',
  employeeId: '',
  email: '',
  generatedPassword: '',
};

export default function AdminEmployeesPage() {
  const {
    data,
    departments,
    query,
    isLoading,
    error,
    updateFilters,
    goToPage,
    createEmployee,
    updateEmployee,
    changeEmployeeStatus,
  } = useEmployees();

  // Modal state
  const [modalMode, setModalMode] = useState<ModalMode>('closed');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [passwordReveal, setPasswordReveal] = useState<PasswordReveal>(INITIAL_PASSWORD_STATE);

  // Modal handlers
  const openCreateModal = useCallback(() => {
    setSelectedEmployee(null);
    setModalMode('create');
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openEditModal = useCallback((employee: any) => {
    setSelectedEmployee(employee);
    setModalMode('edit');
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openStatusDialog = useCallback((employee: any) => {
    setSelectedEmployee(employee);
    setShowStatusDialog(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalMode('closed');
    setSelectedEmployee(null);
  }, []);

  const closeStatusDialog = useCallback(() => {
    setShowStatusDialog(false);
    setSelectedEmployee(null);
  }, []);

  // Form submit handlers
  const handleFormSubmit = useCallback(
    async (formData: Record<string, unknown>) => {
      if (modalMode === 'create') {
        const result: CreateResult = await createEmployee(formData);

        // If creation succeeded, close form and show password dialog
        if (result.success && result.data) {
          closeModal();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const emp = result.data.employee as any;
          setPasswordReveal({
            isOpen: true,
            employeeName: `${emp.user?.firstName} ${emp.user?.lastName}`,
            employeeId: emp.employeeId,
            email: emp.user?.email,
            generatedPassword: result.data.generatedPassword,
          });
          // Return success so form knows to close
          return { success: true };
        }

        return result;
      }

      return updateEmployee(selectedEmployee.id, formData);
    },
    [modalMode, selectedEmployee, createEmployee, updateEmployee, closeModal]
  );

  const handleStatusChange = useCallback(
    async (status: string, reason: string) => {
      if (!selectedEmployee) return { success: false, error: 'No employee selected' };
      return changeEmployeeStatus(selectedEmployee.id, status, reason);
    },
    [selectedEmployee, changeEmployeeStatus]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = (data as any)?.items ?? [];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Employees</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage all employees across the company. View, add, edit, or change employee statuses.
        </p>
      </div>

      {/* Stats bar */}
      {data && (
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { label: 'Total Employees', value: data.total, color: 'primary' },
            { label: 'Active', value: items.filter((e: { employmentStatus: string }) => e.employmentStatus === 'ACTIVE').length, color: 'success' },
            { label: 'On Leave', value: items.filter((e: { employmentStatus: string }) => e.employmentStatus === 'ON_LEAVE').length, color: 'warning' },
            { label: 'Departments', value: departments.length, color: 'info' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card px-5 py-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <EmployeeFilters
        query={query}
        departments={departments}
        onFilterChange={updateFilters}
        onCreateClick={openCreateModal}
      />

      {/* Error message */}
      {error && (
        <div className="rounded-lg border border-danger-500/30 bg-danger-50 px-4 py-3 text-sm text-danger-700" role="alert">
          {error}
        </div>
      )}

      {/* Table */}
      <EmployeeTable
        employees={items}
        isLoading={isLoading}
        onEdit={openEditModal}
        onChangeStatus={openStatusDialog}
      />

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          total={data.total}
          pageSize={data.pageSize}
          onPageChange={goToPage}
        />
      )}

      {/* Create/Edit Modal */}
      <EmployeeFormModal
        isOpen={modalMode !== 'closed'}
        onClose={closeModal}
        onSubmit={handleFormSubmit}
        departments={departments}
        initialData={selectedEmployee}
        mode={modalMode === 'edit' ? 'edit' : 'create'}
      />

      {/* Status Change Dialog (replaces Delete Dialog) */}
      <StatusChangeDialog
        isOpen={showStatusDialog}
        onClose={closeStatusDialog}
        onConfirm={handleStatusChange}
        employeeName={
          selectedEmployee
            ? `${selectedEmployee.user?.firstName} ${selectedEmployee.user?.lastName}`
            : ''
        }
        employeeId={selectedEmployee?.employeeId ?? ''}
        currentStatus={selectedEmployee?.employmentStatus ?? 'ACTIVE'}
      />

      {/* Password Reveal Dialog (shown after successful creation) */}
      <PasswordRevealDialog
        isOpen={passwordReveal.isOpen}
        onClose={() => setPasswordReveal(INITIAL_PASSWORD_STATE)}
        employeeName={passwordReveal.employeeName}
        employeeId={passwordReveal.employeeId}
        email={passwordReveal.email}
        generatedPassword={passwordReveal.generatedPassword}
      />
    </div>
  );
}
