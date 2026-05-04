/**
 * @file Toggle status confirm dialog — confirm activation/deactivation.
 * UI component only — receives handlers via props.
 */

'use client';

import { useState } from 'react';

interface ToggleStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (isActive: boolean) => Promise<{ success: boolean; error?: string }>;
  departmentName: string;
  currentlyActive: boolean;
  employeeCount: number;
}

export default function ToggleStatusDialog({
  isOpen,
  onClose,
  onConfirm,
  departmentName,
  currentlyActive,
  employeeCount,
}: ToggleStatusDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const newStatus = !currentlyActive;
  const actionLabel = newStatus ? 'Activate' : 'Deactivate';
  const isDangerous = currentlyActive && employeeCount > 0;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError(null);

    const result = await onConfirm(newStatus);
    if (!result.success) {
      setError(result.error ?? 'Operation failed');
    } else {
      onClose();
    }

    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl animate-scale-in">
        {/* Icon */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-warning-50">
          <svg className="h-6 w-6 text-warning-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        {/* Title */}
        <h3 className="mt-4 text-center text-lg font-semibold text-foreground">
          {actionLabel} Department
        </h3>

        {/* Description */}
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Are you sure you want to {actionLabel.toLowerCase()}{' '}
          <span className="font-semibold text-foreground">{departmentName}</span>?
        </p>

        {/* Warning for deactivation with employees */}
        {isDangerous && (
          <div className="mt-3 rounded-lg border border-warning-500/30 bg-warning-50 px-4 py-3 text-sm text-warning-700">
            ⚠️ This department has <strong>{employeeCount}</strong> employee{employeeCount !== 1 ? 's' : ''}.
            They will remain linked but the department won&apos;t appear in active lists.
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-3 rounded-lg border border-danger-500/30 bg-danger-50 px-4 py-3 text-sm text-danger-700">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all disabled:opacity-50 ${
              newStatus
                ? 'bg-success-600 hover:bg-success-500'
                : 'bg-danger-600 hover:bg-danger-500'
            }`}
          >
            {isSubmitting ? 'Processing...' : actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
