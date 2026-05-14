/**
 * @file Warning Modal — issue disciplinary warnings to employees.
 * Features: step selection, reason field, confirmation dialog, validation.
 */

'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface WarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeName: string;
  employeeId: string;
}

interface DisciplineStep {
  step: number;
  name: string;
  deductionPct: number;
  isTermination: boolean;
}

export default function WarningModal({ isOpen, onClose, employeeName, employeeId }: WarningModalProps) {
  const { t } = useTranslation();

  const [steps, setSteps] = useState<DisciplineStep[]>([]);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch discipline steps from company settings
  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data?.disciplineSteps) {
          const parsed = typeof data.data.disciplineSteps === 'string'
            ? JSON.parse(data.data.disciplineSteps)
            : data.data.disciplineSteps;
          setSteps(parsed);
        }
      })
      .catch(() => setSteps([]));
  }, [isOpen]);

  const handleSubmit = () => {
    setError('');
    if (selectedStep === null) { setError(t('warning.selectStep')); return; }
    if (reason.trim().length < 10) { setError(t('warning.reasonRequired')); return; }
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const step = steps.find((s) => s.step === selectedStep);
      const res = await fetch(`/api/warnings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          stepNumber: selectedStep,
          stepName: step?.name,
          deductionPct: step?.deductionPct ?? 0,
          reason,
          notes: notes || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onClose();
        window.location.reload();
      } else {
        setError(data.error || t('common.error'));
        setShowConfirm(false);
      }
    } catch {
      setError(t('common.error'));
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Confirmation dialog
  if (showConfirm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-2xl border border-danger-200 bg-card p-6 shadow-2xl animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger-100">
              <svg className="h-5 w-5 text-danger-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">{t('warning.confirmTitle')}</h3>
              <p className="text-sm text-muted-foreground">{employeeName}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-6">{t('warning.confirmMessage')}</p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowConfirm(false)} disabled={loading} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50">
              {t('common.cancel')}
            </button>
            <button onClick={handleConfirm} disabled={loading} className="rounded-lg bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-500 transition-colors disabled:opacity-50">
              {loading ? t('common.loading') : t('common.confirm')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-fade-in">
        <h2 className="text-lg font-bold text-foreground mb-1">{t('warning.title')}</h2>
        <p className="text-sm text-muted-foreground mb-6">{employeeName}</p>

        {error && (
          <div className="mb-4 rounded-lg bg-danger-50 border border-danger-200 p-3 text-sm text-danger-700">{error}</div>
        )}

        {/* Step selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">{t('warning.selectStep')}</label>
          <div className="space-y-2">
            {steps.map((step) => (
              <button
                key={step.step}
                onClick={() => setSelectedStep(step.step)}
                className={`w-full flex items-center justify-between rounded-lg border p-3 text-sm transition-all ${
                  selectedStep === step.step
                    ? 'border-danger-300 bg-danger-50 text-danger-700'
                    : 'border-border bg-background text-foreground hover:bg-muted'
                }`}
              >
                <span className="font-medium">{step.step}. {step.name}</span>
                <span className="text-xs text-muted-foreground">
                  {step.isTermination ? 'Termination' : `${step.deductionPct}% ${t('warning.deduction')}`}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Reason */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-1.5">{t('common.reason')} *</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            minLength={10}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 outline-none resize-none"
            placeholder={t('warning.reasonRequired')}
          />
          <p className="text-xs text-muted-foreground mt-1">{reason.length}/10 min</p>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-1.5">{t('common.notes')}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 outline-none resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-border">
          <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedStep === null || reason.trim().length < 10}
            className="rounded-lg bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('common.submit')}
          </button>
        </div>
      </div>
    </div>
  );
}
