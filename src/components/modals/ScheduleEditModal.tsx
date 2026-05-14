/**
 * @file Schedule Edit Modal — allows managers to set custom work schedules.
 * Features: time pickers, day checkboxes, validation, reset to default.
 */

'use client';

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface ScheduleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeName: string;
  employeeId: string;
  current: { workStartTime: string; workEndTime: string; workDays: number[] };
  isCustom: boolean;
}

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

export default function ScheduleEditModal({
  isOpen,
  onClose,
  employeeName,
  employeeId,
  current,
  isCustom,
}: ScheduleEditModalProps) {
  const { t } = useTranslation();

  const [startTime, setStartTime] = useState(current.workStartTime);
  const [endTime, setEndTime] = useState(current.workEndTime);
  const [workDays, setWorkDays] = useState<number[]>(current.workDays);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleDay = useCallback((day: number) => {
    setWorkDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  }, []);

  const validate = (): boolean => {
    setError('');
    if (workDays.length === 0) {
      setError(t('schedule.atLeastOneDay'));
      return false;
    }
    const [sH, sM] = startTime.split(':').map(Number);
    const [eH, eM] = endTime.split(':').map(Number);
    if (eH * 60 + eM <= sH * 60 + sM) {
      setError(t('schedule.endAfterStart'));
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/schedules/${employeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workStartTime: startTime, workEndTime: endTime, workDays }),
      });
      const data = await res.json();
      if (data.success) {
        onClose();
        window.location.reload();
      } else {
        setError(data.error || t('common.error'));
      }
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/schedules/${employeeId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onClose();
        window.location.reload();
      } else {
        setError(data.error || t('common.error'));
      }
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-foreground">{t('schedule.editSchedule')}</h2>
          <p className="text-sm text-muted-foreground">{employeeName}</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg bg-danger-50 border border-danger-200 p-3 text-sm text-danger-700">
            {error}
          </div>
        )}

        {/* Time inputs */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t('schedule.workStartTime')}
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t('schedule.workEndTime')}
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 outline-none"
            />
          </div>
        </div>

        {/* Day checkboxes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            {t('schedule.workDays')}
          </label>
          <div className="flex flex-wrap gap-2">
            {DAY_KEYS.map((dayKey, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => toggleDay(idx)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                  workDays.includes(idx)
                    ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-300'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {t(`days.${dayKey}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            {isCustom && (
              <button
                onClick={handleReset}
                disabled={loading}
                className="text-sm font-medium text-danger-600 hover:text-danger-500 transition-colors disabled:opacity-50"
              >
                {t('schedule.resetToDefault')}
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-500 transition-colors disabled:opacity-50"
            >
              {loading ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
