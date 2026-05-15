/**
 * @file LeaveRequestModal — modal for employees to request time off.
 * Includes auto-calculation of days (skipping Fridays based on requirements).
 */

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/ui/Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  leaveTypes: { id: string; name: string; isPaid: boolean }[];
  onSuccess: () => void;
}

export default function LeaveRequestModal({ isOpen, onClose, leaveTypes, onSuccess }: Props) {
  const { t } = useTranslation();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  // Calculate days excluding Fridays
  const totalDays = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return 0;
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 0;

    let days = 0;
    const current = new Date(start);
    
    while (current <= end) {
      // 5 is Friday in JavaScript Date (0=Sun, 1=Mon, ..., 5=Fri, 6=Sat)
      if (current.getDay() !== 5) {
        days++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [formData.startDate, formData.endDate]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({ leaveTypeId: leaveTypes[0]?.id || '', startDate: '', endDate: '', reason: '' });
      setError(null);
    }
  }, [isOpen, leaveTypes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.leaveTypeId || !formData.startDate || !formData.endDate || !formData.reason) {
      setError(t('common.fillAllFields'));
      return;
    }
    
    if (totalDays <= 0) {
      setError(t('leaves.invalidDates'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          totalDays,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || t('common.error'));
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('common.error'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={isSubmitting ? () => {} : onClose} title={t('leaves.requestLeave')}>
      <div className="mb-5 text-sm text-muted-foreground">
        <p>{t('leaves.requestDescription')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-danger-50 p-3 text-sm text-danger-600 border border-danger-200">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {t('leaves.leaveType')}
          </label>
          <select
            required
            value={formData.leaveTypeId}
            onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30"
          >
            <option value="" disabled>{t('common.select')}</option>
            {leaveTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name} {type.isPaid ? `(${t('leaves.paid')})` : `(${t('leaves.unpaid')})`}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t('leaves.startDate')}
            </label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t('leaves.endDate')}
            </label>
            <input
              type="date"
              required
              min={formData.startDate}
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30"
            />
          </div>
        </div>

        {totalDays > 0 && (
          <div className="rounded-lg bg-info-50 p-3 flex items-center gap-3 border border-info-200">
            <div className="rounded-full bg-info-100 p-1.5 text-info-700">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            </div>
            <p className="text-sm text-info-800">
              {t('leaves.totalDaysCalculated')}: <span className="font-bold">{totalDays}</span>
              <br/>
              <span className="text-xs opacity-80">{t('leaves.fridayExcluded')}</span>
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {t('leaves.reason')}
          </label>
          <textarea
            required
            minLength={10}
            rows={3}
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 resize-none"
            placeholder={t('leaves.reasonPlaceholder')}
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('common.submitting')}
              </>
            ) : (
              t('leaves.submitRequest')
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
