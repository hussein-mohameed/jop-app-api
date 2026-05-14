/**
 * @file Bonus Modal — issue bonuses to employees.
 * Features: amount input, reason, month/year selection, confirmation.
 */

'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface BonusModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeName: string;
  employeeId: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function BonusModal({ isOpen, onClose, employeeName, employeeId }: BonusModalProps) {
  const { t } = useTranslation();
  const now = new Date();

  const [amount, setAmount] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = () => {
    setError('');
    if (amount <= 0) { setError(t('bonus.minAmount')); return; }
    if (!reason.trim()) { setError(t('bonus.reasonRequired')); return; }
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bonuses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          amount,
          reason,
          payrollMonth: month,
          payrollYear: year,
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

  if (showConfirm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-2xl border border-success-200 bg-card p-6 shadow-2xl animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success-100">
              <svg className="h-5 w-5 text-success-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">{t('bonus.confirmTitle')}</h3>
              <p className="text-sm text-muted-foreground">{employeeName} — ${amount.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-6">{t('bonus.confirmMessage')}</p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowConfirm(false)} disabled={loading} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50">
              {t('common.cancel')}
            </button>
            <button onClick={handleConfirm} disabled={loading} className="rounded-lg bg-success-600 px-4 py-2 text-sm font-semibold text-white hover:bg-success-500 transition-colors disabled:opacity-50">
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
        <h2 className="text-lg font-bold text-foreground mb-1">{t('bonus.title')}</h2>
        <p className="text-sm text-muted-foreground mb-6">{employeeName}</p>

        {error && (
          <div className="mb-4 rounded-lg bg-danger-50 border border-danger-200 p-3 text-sm text-danger-700">{error}</div>
        )}

        {/* Amount */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-1.5">{t('bonus.amount')} *</label>
          <input
            type="number"
            min={1}
            step={1}
            value={amount || ''}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 outline-none"
            placeholder="0"
          />
        </div>

        {/* Month + Year */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t('bonus.month')}</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 outline-none"
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t('bonus.year')}</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 outline-none"
            >
              {[now.getFullYear(), now.getFullYear() - 1].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Reason */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-1.5">{t('common.reason')} *</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
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
            disabled={amount <= 0 || !reason.trim()}
            className="rounded-lg bg-success-600 px-4 py-2 text-sm font-semibold text-white hover:bg-success-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('common.submit')}
          </button>
        </div>
      </div>
    </div>
  );
}
