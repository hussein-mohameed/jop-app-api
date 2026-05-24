/**
 * @file SendAnnouncementModal — modal for composing and sending announcements.
 *
 * Features:
 * - Title, content, and priority fields
 * - Flexible targeting: checkboxes for ALL_EMPLOYEES, DEPARTMENT (multi-select), SPECIFIC_EMPLOYEES (multi-select)
 * - Manager can only see their own department
 * - COMPANY_ADMIN can select any department or all employees
 * - Form validation with error messages
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CreateAnnouncementPayload, AnnouncementTargetInput } from '@/types/announcement.types';

interface Department {
  id: string;
  name: string;
  code: string;
}

interface EmployeeOption {
  id: string;
  userId: string;
  user: { firstName: string; lastName: string };
  department: { name: string };
}

interface SendAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateAnnouncementPayload) => Promise<{ success: boolean; error?: string; message?: string }>;
  /** Restrict to MANAGER mode (only their department) */
  canSendToAll: boolean;
  senderDepartmentId?: string;
}

export default function SendAnnouncementModal({
  isOpen,
  onClose,
  onSubmit,
  canSendToAll,
  senderDepartmentId,
}: SendAnnouncementModalProps) {
  // Form fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'NORMAL' | 'CRITICAL'>('NORMAL');

  // Targeting
  const [sendToAll, setSendToAll] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  // Data for dropdowns
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch departments & employees
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        const [deptRes, empRes] = await Promise.all([
          fetch('/api/departments'),
          fetch('/api/employees?pageSize=100'),
        ]);
        const deptJson = await deptRes.json();
        const empJson = await empRes.json();

        if (deptJson.success) setDepartments(deptJson.data ?? []);
        if (empJson.success) setEmployees(empJson.data?.items ?? []);
      } catch { /* silent fail */ }
    };

    fetchData();
  }, [isOpen]);

  // Reset form
  const resetForm = useCallback(() => {
    setTitle('');
    setContent('');
    setPriority('NORMAL');
    setSendToAll(false);
    setSelectedDepartments([]);
    setSelectedEmployees([]);
    setError(null);
    setSuccessMessage(null);
  }, []);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validate at least one target
    if (!sendToAll && selectedDepartments.length === 0 && selectedEmployees.length === 0) {
      setError('Please select at least one target audience');
      return;
    }

    // Build targets array
    const targets: AnnouncementTargetInput[] = [];

    if (sendToAll) {
      targets.push({ type: 'ALL_EMPLOYEES' });
    }

    for (const deptId of selectedDepartments) {
      targets.push({ type: 'DEPARTMENT', departmentId: deptId });
    }

    for (const empId of selectedEmployees) {
      targets.push({ type: 'SPECIFIC_EMPLOYEES', employeeId: empId });
    }

    setIsSubmitting(true);
    const result = await onSubmit({ title, content, priority, targets });
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage(result.message ?? 'Announcement sent successfully');
      setTimeout(() => {
        handleClose();
      }, 1500);
    } else {
      setError(result.error ?? 'Failed to send announcement');
    }
  };

  const toggleDepartment = (id: string) => {
    setSelectedDepartments((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const toggleEmployee = (id: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  // For MANAGER mode: filter to only their department
  const availableDepartments = canSendToAll
    ? departments
    : departments.filter((d) => d.id === senderDepartmentId);

  const availableEmployees = canSendToAll
    ? employees
    : employees.filter((e) => {
        // Manager can select specific employees from their department
        return true; // Show all — the service enforces dept restriction via target validation
      });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      id="send-announcement-modal"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-950/50 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl animate-scale-in mx-4">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-4 rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-foreground">Send Announcement</h2>
            <p className="text-sm text-muted-foreground">Compose and send to targeted recipients</p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close modal"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="announcement-title" className="block text-sm font-medium text-foreground mb-1.5">
              Title <span className="text-danger-500">*</span>
            </label>
            <input
              id="announcement-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Office Closure Notice"
              className="w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30"
              required
              maxLength={200}
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="announcement-content" className="block text-sm font-medium text-foreground mb-1.5">
              Content <span className="text-danger-500">*</span>
            </label>
            <textarea
              id="announcement-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your announcement message..."
              rows={4}
              className="w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 resize-none"
              required
              maxLength={5000}
            />
            <p className="mt-1 text-xs text-muted-foreground text-right">{content.length}/5000</p>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Priority
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPriority('NORMAL')}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                  priority === 'NORMAL'
                    ? 'border-warning-500 bg-warning-50 text-warning-700'
                    : 'border-border text-muted-foreground hover:border-warning-300'
                }`}
              >
                <span className="h-3 w-3 rounded-full bg-warning-500" />
                Normal
              </button>
              <button
                type="button"
                onClick={() => setPriority('CRITICAL')}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                  priority === 'CRITICAL'
                    ? 'border-danger-500 bg-danger-50 text-danger-700'
                    : 'border-border text-muted-foreground hover:border-danger-300'
                }`}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
                Critical
              </button>
            </div>
          </div>

          {/* ─── Target Audience ─── */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Target Audience <span className="text-danger-500">*</span>
            </label>

            <div className="space-y-3 rounded-lg border border-border bg-muted/50 p-4">
              {/* All Employees checkbox — only for COMPANY_ADMIN */}
              {canSendToAll && (
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={sendToAll}
                    onChange={(e) => setSendToAll(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                    <span className="text-sm font-medium text-foreground group-hover:text-primary-600 transition-colors">
                      All Employees
                    </span>
                  </div>
                </label>
              )}

              {/* Departments multi-select */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                  </svg>
                  Departments
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableDepartments.map((dept) => (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() => toggleDepartment(dept.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${
                        selectedDepartments.includes(dept.id)
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-border text-muted-foreground hover:border-primary-300 hover:text-foreground'
                      }`}
                    >
                      {dept.name}
                    </button>
                  ))}
                  {availableDepartments.length === 0 && (
                    <p className="text-xs text-muted-foreground/60">No departments available</p>
                  )}
                </div>
              </div>

              {/* Employees multi-select */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  Specific Employees
                </p>
                <div className="max-h-40 overflow-y-auto rounded-lg border border-border bg-card p-2 space-y-1">
                  {availableEmployees.map((emp) => (
                    <label
                      key={emp.id}
                      className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 cursor-pointer transition-colors ${
                        selectedEmployees.includes(emp.id)
                          ? 'bg-primary-50'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(emp.id)}
                        onChange={() => toggleEmployee(emp.id)}
                        className="h-3.5 w-3.5 rounded border-border text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-xs text-foreground">
                        {emp.user.firstName} {emp.user.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        — {emp.department.name}
                      </span>
                    </label>
                  ))}
                  {availableEmployees.length === 0 && (
                    <p className="text-xs text-muted-foreground/60 text-center py-2">No employees available</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Error / Success messages */}
          {error && (
            <div className="rounded-lg border border-danger-500/30 bg-danger-50 px-4 py-3 text-sm text-danger-700">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="rounded-lg border border-success-500/30 bg-success-50 px-4 py-3 text-sm text-success-700 flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {successMessage}
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              id="send-announcement-btn"
            >
              {isSubmitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                  Send Announcement
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
