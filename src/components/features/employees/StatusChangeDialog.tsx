/**
 * @file Employee status change dialog.
 * Replaces the delete dialog — employees are never removed.
 * Shows a modal for changing an employee's status with a required reason.
 */

'use client';

import { useState } from 'react';

interface StatusChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (status: string, reason: string) => Promise<{ success: boolean; error?: string }>;
  employeeName: string;
  employeeId: string;
  currentStatus: string;
}

/** Status transition options with labels and styling */
const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Activate', description: 'Enable account access and mark as active employee', icon: '✅', color: 'text-success-600' },
  { value: 'INACTIVE', label: 'Deactivate', description: 'Disable account access without termination', icon: '⏸️', color: 'text-neutral-600' },
  { value: 'ON_LEAVE', label: 'Mark as On Leave', description: 'Keep account active but mark as on leave', icon: '🏖️', color: 'text-warning-600' },
  { value: 'TERMINATED', label: 'Terminate', description: 'Permanently disable account and mark as terminated', icon: '🚫', color: 'text-danger-600' },
  { value: 'PROBATION', label: 'Place on Probation', description: 'Keep account active with probation status', icon: '⚠️', color: 'text-info-600' },
] as const;

export default function StatusChangeDialog({
  isOpen,
  onClose,
  onConfirm,
  employeeName,
  employeeId,
  currentStatus,
}: StatusChangeDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!selectedStatus || !reason.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const result = await onConfirm(selectedStatus, reason.trim());

    if (!result.success) {
      setError(result.error ?? 'Failed to change status');
      setIsSubmitting(false);
    } else {
      setIsSubmitting(false);
      setSelectedStatus('');
      setReason('');
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedStatus('');
    setReason('');
    setError(null);
    onClose();
  };

  // Filter out current status from options
  const availableStatuses = STATUS_OPTIONS.filter((s) => s.value !== currentStatus);
  const isDangerous = selectedStatus === 'TERMINATED' || selectedStatus === 'INACTIVE';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/50 p-4 backdrop-blur-sm animate-fade-in" id="status-dialog-overlay">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl animate-scale-in" id="status-dialog">
        <div className="p-6">
          {/* Header */}
          <h3 className="text-lg font-semibold text-foreground">Change Employee Status</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{employeeName}</span>
            {' '}({employeeId}) — Currently:{' '}
            <span className="font-medium">{currentStatus.replace('_', ' ')}</span>
          </p>

          {/* Status options */}
          <div className="mt-5 space-y-2">
            {availableStatuses.map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all ${
                  selectedStatus === option.value
                    ? 'border-primary-500 bg-primary-50/50 ring-1 ring-primary-500/20'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <input
                  type="radio"
                  name="employeeStatus"
                  value={option.value}
                  checked={selectedStatus === option.value}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="mt-1 h-4 w-4 text-primary-600 accent-primary-600"
                />
                <div>
                  <p className={`text-sm font-medium ${option.color}`}>
                    {option.icon} {option.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </label>
            ))}
          </div>

          {/* Reason field */}
          {selectedStatus && (
            <div className="mt-4 animate-slide-up">
              <label htmlFor="status-reason" className="mb-1.5 block text-sm font-medium text-foreground">
                Reason <span className="text-danger-500">*</span>
              </label>
              <textarea
                id="status-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={`Why is this employee being ${selectedStatus.toLowerCase().replace('_', ' ')}?`}
                rows={3}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 placeholder-muted-foreground resize-none"
                required
              />
            </div>
          )}

          {/* Warning for dangerous actions */}
          {isDangerous && reason.trim() && (
            <div className="mt-3 rounded-lg border border-warning-500/30 bg-warning-50 px-4 py-3 text-sm text-warning-700 animate-slide-up">
              ⚠️ This action will <strong>disable login access</strong> for this employee. They will no longer be able to access the system.
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-3 rounded-lg border border-danger-500/30 bg-danger-50 px-4 py-2 text-sm text-danger-700">
              {error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            id="cancel-status-btn"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting || !selectedStatus || !reason.trim()}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
              isDangerous
                ? 'bg-danger-600 hover:bg-danger-700'
                : 'bg-primary-600 hover:bg-primary-500'
            }`}
            id="confirm-status-btn"
          >
            {isSubmitting ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </>
            ) : (
              'Confirm Change'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
