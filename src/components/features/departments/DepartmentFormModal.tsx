/**
 * @file Department form modal — create or edit a department.
 * Renders a centered overlay modal with department fields.
 * UI component only — receives handlers from parent.
 */

'use client';

import { useState, useEffect } from 'react';
import type { DepartmentRow, ManagerOption } from '@/hooks/departments/useDepartments';

interface DepartmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  managers: ManagerOption[];
  departments: DepartmentRow[];
  initialData?: DepartmentRow | null;
  mode: 'create' | 'edit';
}

export default function DepartmentFormModal({
  isOpen,
  onClose,
  onSubmit,
  managers,
  departments,
  initialData,
  mode,
}: DepartmentFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    managerId: '',
    parentId: '',
  });

  // Populate form when editing
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm({
        name: initialData.name ?? '',
        code: initialData.code ?? '',
        description: initialData.description ?? '',
        managerId: initialData.managerId ?? '',
        parentId: initialData.parentId ?? '',
      });
    } else {
      setForm({
        name: '',
        code: '',
        description: '',
        managerId: '',
        parentId: '',
      });
    }
    setError(null);
    setFieldErrors({});
  }, [mode, initialData, isOpen]);

  // Auto-generate code from name (create mode only)
  const handleNameChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      ...(mode === 'create'
        ? { code: value.toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').slice(0, 20) }
        : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    const payload: Record<string, unknown> = { ...form };

    // Remove empty optional fields
    for (const key of ['description', 'managerId', 'parentId']) {
      if (!payload[key]) delete payload[key];
    }

    const result = await onSubmit(payload);

    if (!result.success) {
      setError(result.error ?? 'Operation failed');
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

  // Filter out current department from parent options (prevent self-reference)
  const parentOptions = departments.filter(
    (d) => d.id !== initialData?.id && d.isActive
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-neutral-950/50 p-4 backdrop-blur-sm animate-fade-in"
      id="dept-modal-overlay"
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl animate-scale-in my-8"
        id="dept-form-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">
            {mode === 'create' ? 'Create Department' : 'Edit Department'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close modal"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6" id="dept-form">
          {error && (
            <div className="mb-5 rounded-lg border border-danger-500/30 bg-danger-50 px-4 py-3 text-sm text-danger-700" role="alert">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="dept-name" className={labelClass}>Department Name *</label>
              <input
                id="dept-name"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className={inputClass}
                required
                placeholder="e.g. Human Resources"
              />
              {fieldErrors.name && <p className={errorClass}>{fieldErrors.name[0]}</p>}
            </div>

            {/* Code */}
            <div>
              <label htmlFor="dept-code" className={labelClass}>Code *</label>
              <input
                id="dept-code"
                value={form.code}
                onChange={(e) => updateField('code', e.target.value.toUpperCase())}
                className={inputClass}
                required
                placeholder="e.g. HR"
                maxLength={20}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Uppercase letters, numbers, hyphens, or underscores only
              </p>
              {fieldErrors.code && <p className={errorClass}>{fieldErrors.code[0]}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="dept-desc" className={labelClass}>Description</label>
              <textarea
                id="dept-desc"
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                className={inputClass}
                rows={3}
                placeholder="Brief description of the department's purpose..."
                maxLength={500}
              />
            </div>

            {/* Manager */}
            <div>
              <label htmlFor="dept-manager" className={labelClass}>Manager</label>
              <select
                id="dept-manager"
                value={form.managerId}
                onChange={(e) => updateField('managerId', e.target.value)}
                className={inputClass}
              >
                <option value="">No manager assigned</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.firstName} {m.lastName} ({m.role.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>

            {/* Parent Department */}
            <div>
              <label htmlFor="dept-parent" className={labelClass}>Parent Department</label>
              <select
                id="dept-parent"
                value={form.parentId}
                onChange={(e) => updateField('parentId', e.target.value)}
                className={inputClass}
              >
                <option value="">No parent (top-level)</option>
                {parentOptions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
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
                mode === 'create' ? 'Create Department' : 'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
