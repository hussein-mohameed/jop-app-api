/**
 * @file Employee form modal — create or edit an employee.
 * Renders a full-screen overlay modal with a multi-section form.
 * UI component only — receives handlers from parent.
 *
 * Notes:
 * - Password is NOT in this form — it's auto-generated server-side.
 * - Employment status is NOT editable here — use the dedicated status change dialog.
 */

'use client';

import { useState, useEffect } from 'react';
import type { DepartmentOption } from '@/hooks/employees/useEmployees';

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  departments: DepartmentOption[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
  mode: 'create' | 'edit';
}

/** Format date for input[type=date] */
function toDateInput(value?: string | Date | null): string {
  if (!value) return '';
  const d = typeof value === 'string' ? new Date(value) : value;
  return d.toISOString().split('T')[0];
}

/**
 * Employee create/edit modal with personal info, employment details,
 * and form validation feedback.
 */
export default function EmployeeFormModal({
  isOpen,
  onClose,
  onSubmit,
  departments,
  initialData,
  mode,
}: EmployeeFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Form state
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    nationalId: '',
    address: '',
    departmentId: '',
    position: '',
    role: 'EMPLOYEE',
    employmentType: 'FULL_TIME',
    hireDate: new Date().toISOString().split('T')[0],
    managerId: '',
  });

  // Populate form when editing
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm({
        firstName: initialData.user?.firstName ?? '',
        lastName: initialData.user?.lastName ?? '',
        email: initialData.user?.email ?? '',
        phone: initialData.phone ?? '',
        dateOfBirth: toDateInput(initialData.dateOfBirth),
        gender: initialData.gender ?? '',
        nationalId: initialData.nationalId ?? '',
        address: initialData.address ?? '',
        departmentId: initialData.departmentId ?? '',
        position: initialData.position ?? '',
        role: initialData.user?.role ?? 'EMPLOYEE',
        employmentType: initialData.employmentType ?? 'FULL_TIME',
        hireDate: toDateInput(initialData.hireDate),
        managerId: initialData.managerId ?? '',
      });
    } else {
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        nationalId: '',
        address: '',
        departmentId: '',
        position: '',
        role: 'EMPLOYEE',
        employmentType: 'FULL_TIME',
        hireDate: new Date().toISOString().split('T')[0],
        managerId: '',
      });
    }
    setError(null);
    setFieldErrors({});
  }, [mode, initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    // Build payload — exclude email for edit (immutable)
    const payload: Record<string, unknown> = { ...form };
    if (mode === 'edit') {
      delete payload.email;
    }

    // Remove empty strings for optional fields
    for (const key of ['phone', 'dateOfBirth', 'gender', 'nationalId', 'address', 'managerId']) {
      if (!payload[key]) delete payload[key];
    }

    const result = await onSubmit(payload);

    if (!result.success) {
      setError(result.error ?? 'Operation failed');
      // Check for field-level errors
      if ('data' in result && typeof (result as Record<string, unknown>).data === 'object') {
        setFieldErrors((result as Record<string, unknown>).data as Record<string, string[]>);
      }
    } else {
      onClose();
    }

    setIsSubmitting(false);
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  const inputClass =
    'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 placeholder-muted-foreground';
  const labelClass = 'mb-1.5 block text-sm font-medium text-foreground';
  const errorClass = 'mt-1 text-xs text-danger-500';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-neutral-950/50 p-4 backdrop-blur-sm animate-fade-in"
      id="employee-modal-overlay"
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl animate-scale-in my-8"
        id="employee-form-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">
            {mode === 'create' ? 'Add New Employee' : 'Edit Employee'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close modal"
            id="close-modal-btn"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6" id="employee-form">
          {/* Error alert */}
          {error && (
            <div className="mb-6 rounded-lg border border-danger-500/30 bg-danger-50 px-4 py-3 text-sm text-danger-700" role="alert">
              {error}
            </div>
          )}

          {/* Auto-generated password info */}
          {mode === 'create' && (
            <div className="mb-6 rounded-lg border border-info-500/30 bg-info-50 px-4 py-3 text-sm text-info-700">
              🔐 A secure password will be <strong>automatically generated</strong> when the employee is created.
              You will be shown the password once — please copy and share it securely.
            </div>
          )}

          {/* === Personal Information === */}
          <fieldset className="mb-6">
            <legend className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Personal Information
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* First Name */}
              <div>
                <label htmlFor="emp-firstName" className={labelClass}>First Name *</label>
                <input id="emp-firstName" value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} className={inputClass} required />
                {fieldErrors.firstName && <p className={errorClass}>{fieldErrors.firstName[0]}</p>}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="emp-lastName" className={labelClass}>Last Name *</label>
                <input id="emp-lastName" value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} className={inputClass} required />
                {fieldErrors.lastName && <p className={errorClass}>{fieldErrors.lastName[0]}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="emp-email" className={labelClass}>Email *</label>
                <input id="emp-email" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} className={inputClass} required disabled={mode === 'edit'} />
                {fieldErrors.email && <p className={errorClass}>{fieldErrors.email[0]}</p>}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="emp-phone" className={labelClass}>Phone</label>
                <input id="emp-phone" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} className={inputClass} />
              </div>

              {/* Date of Birth */}
              <div>
                <label htmlFor="emp-dob" className={labelClass}>Date of Birth</label>
                <input id="emp-dob" type="date" value={form.dateOfBirth} onChange={(e) => updateField('dateOfBirth', e.target.value)} className={inputClass} />
              </div>

              {/* Gender */}
              <div>
                <label htmlFor="emp-gender" className={labelClass}>Gender</label>
                <select id="emp-gender" value={form.gender} onChange={(e) => updateField('gender', e.target.value)} className={inputClass}>
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                </select>
              </div>

              {/* National ID */}
              <div>
                <label htmlFor="emp-nid" className={labelClass}>National ID</label>
                <input id="emp-nid" value={form.nationalId} onChange={(e) => updateField('nationalId', e.target.value)} className={inputClass} />
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label htmlFor="emp-address" className={labelClass}>Address</label>
                <input id="emp-address" value={form.address} onChange={(e) => updateField('address', e.target.value)} className={inputClass} />
              </div>
            </div>
          </fieldset>

          {/* === Employment Details === */}
          <fieldset className="mb-6">
            <legend className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Employment Details
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Department */}
              <div>
                <label htmlFor="emp-dept" className={labelClass}>Department *</label>
                <select id="emp-dept" value={form.departmentId} onChange={(e) => updateField('departmentId', e.target.value)} className={inputClass} required>
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
                {fieldErrors.departmentId && <p className={errorClass}>{fieldErrors.departmentId[0]}</p>}
              </div>

              {/* Position */}
              <div>
                <label htmlFor="emp-position" className={labelClass}>Position *</label>
                <input id="emp-position" value={form.position} onChange={(e) => updateField('position', e.target.value)} className={inputClass} required />
                {fieldErrors.position && <p className={errorClass}>{fieldErrors.position[0]}</p>}
              </div>

              {/* Role */}
              <div>
                <label htmlFor="emp-role" className={labelClass}>System Role</label>
                <select id="emp-role" value={form.role} onChange={(e) => updateField('role', e.target.value)} className={inputClass}>
                  <option value="EMPLOYEE">Employee</option>
                  <option value="MANAGER">Manager</option>
                  <option value="HR_STAFF">HR Staff</option>
                  <option value="HR_MANAGER">HR Manager</option>
                  <option value="COMPANY_ADMIN">Company Admin</option>
                </select>
              </div>

              {/* Employment Type */}
              <div>
                <label htmlFor="emp-type" className={labelClass}>Employment Type</label>
                <select id="emp-type" value={form.employmentType} onChange={(e) => updateField('employmentType', e.target.value)} className={inputClass}>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERN">Intern</option>
                </select>
              </div>

              {/* Hire Date */}
              <div>
                <label htmlFor="emp-hire" className={labelClass}>Hire Date *</label>
                <input id="emp-hire" type="date" value={form.hireDate} onChange={(e) => updateField('hireDate', e.target.value)} className={inputClass} required />
                {fieldErrors.hireDate && <p className={errorClass}>{fieldErrors.hireDate[0]}</p>}
              </div>
            </div>
          </fieldset>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              id="cancel-form-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              id="submit-form-btn"
            >
              {isSubmitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {mode === 'create' ? 'Creating...' : 'Saving...'}
                </>
              ) : (
                mode === 'create' ? 'Create Employee' : 'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
