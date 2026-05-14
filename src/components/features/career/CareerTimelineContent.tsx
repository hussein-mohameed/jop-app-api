/**
 * @file CareerTimelineContent — client component for career history visualization.
 * Features: timeline, salary trend chart (Recharts), warning/bonus modals.
 */

'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import WarningModal from '@/components/modals/WarningModal';
import BonusModal from '@/components/modals/BonusModal';

interface CareerRecord {
  id: string;
  position: string;
  departmentId: string;
  baseSalary: number;
  workingHoursPerDay: number;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  reason: string | null;
  notes: string | null;
  department: { name: string };
  changedBy: { firstName: string; lastName: string } | null;
  summary: {
    bonuses: number;
    warnings: number;
    leaves: number;
    totalBonusAmount: number;
  };
}

interface Employee {
  id: string;
  employeeId: string;
  position: string;
  hireDate: string;
  user: { firstName: string; lastName: string; email: string; avatarUrl: string | null };
  department: { name: string };
}

interface SalaryPoint {
  position: string;
  salary: number;
  date: string;
}

interface Props {
  employee: Employee;
  timeline: CareerRecord[];
  salaryTrend: SalaryPoint[];
}

export default function CareerTimelineContent({ employee, timeline, salaryTrend }: Props) {
  const { t } = useTranslation();
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);

  const fullName = `${employee.user.firstName} ${employee.user.lastName}`;
  const currentRecord = timeline.find((r) => r.isActive);

  const chartData = salaryTrend.map((s) => ({
    ...s,
    date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
  }));

  return (
    <>
      {/* Back + Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/employees"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            {t('common.back')}
          </Link>
          <h1 className="text-2xl font-bold text-foreground">{t('career.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{fullName} — {employee.employeeId}</p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowWarningModal(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-danger-200 bg-danger-50 px-4 py-2 text-sm font-semibold text-danger-700 hover:bg-danger-100 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            {t('warning.title')}
          </button>
          <button
            onClick={() => setShowBonusModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-success-600 px-4 py-2 text-sm font-semibold text-white hover:bg-success-500 shadow-sm transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21" />
            </svg>
            {t('bonus.title')}
          </button>
        </div>
      </div>

      {/* Current Position Card */}
      {currentRecord && (
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-transparent to-secondary-50/30 pointer-events-none" />
          <div className="relative z-10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              {t('career.currentPosition')}
            </h3>
            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <p className="text-2xl font-bold text-foreground">{currentRecord.position}</p>
                <p className="text-sm text-muted-foreground">{currentRecord.department.name}</p>
              </div>
              <div className="rounded-xl bg-success-50 p-3 text-center">
                <p className="text-xl font-bold text-success-700">${currentRecord.baseSalary.toLocaleString()}</p>
                <p className="text-xs font-medium text-success-600">{t('career.salary')}</p>
              </div>
              <div className="rounded-xl bg-primary-50 p-3 text-center">
                <p className="text-xl font-bold text-primary-700">{currentRecord.workingHoursPerDay}h</p>
                <p className="text-xs font-medium text-primary-600">{t('career.workingHours')}</p>
              </div>
              <div className="rounded-xl bg-info-50 p-3 text-center">
                <p className="text-xl font-bold text-info-700">
                  {new Date(currentRecord.startDate).toLocaleDateString()}
                </p>
                <p className="text-xs font-medium text-info-600">{t('career.startDate')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Salary Trend Chart */}
      {chartData.length > 1 && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-base font-semibold text-foreground mb-4">{t('career.salaryTrend')}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="salaryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                }}
              />
              <Area type="monotone" dataKey="salary" stroke="#6366f1" strokeWidth={2} fill="url(#salaryGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Timeline */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-base font-semibold text-foreground mb-6">{t('career.timeline')}</h3>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-8">
            {timeline.map((record, idx) => (
              <div key={record.id} className="relative flex gap-6 pl-10">
                {/* Dot */}
                <div
                  className={`absolute left-2.5 top-1 h-3 w-3 rounded-full ring-2 ring-card ${
                    record.isActive
                      ? 'bg-success-500'
                      : 'bg-muted-foreground'
                  }`}
                />

                <div className="flex-1 rounded-xl border border-border bg-background p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-foreground">{record.position}</h4>
                      <p className="text-sm text-muted-foreground">{record.department.name}</p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      record.isActive
                        ? 'bg-success-50 text-success-700 ring-1 ring-success-600/20'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {record.isActive ? t('career.ongoing') : t('career.positionChanged')}
                    </span>
                  </div>

                  {/* Period details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">{t('career.salary')}</p>
                      <p className="font-semibold text-foreground">${record.baseSalary.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('career.workingHours')}</p>
                      <p className="font-semibold text-foreground">{record.workingHoursPerDay}h/day</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('career.startDate')}</p>
                      <p className="font-mono text-sm text-foreground">{new Date(record.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('career.endDate')}</p>
                      <p className="font-mono text-sm text-foreground">
                        {record.endDate ? new Date(record.endDate).toLocaleDateString() : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Period summary */}
                  <div className="flex gap-4 pt-3 border-t border-border">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-success-100 text-success-700 text-[10px] font-bold">
                        {record.summary.bonuses}
                      </span>
                      {t('career.totalBonuses')}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-danger-100 text-danger-700 text-[10px] font-bold">
                        {record.summary.warnings}
                      </span>
                      {t('career.totalWarnings')}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-info-100 text-info-700 text-[10px] font-bold">
                        {record.summary.leaves}
                      </span>
                      {t('career.totalLeaves')}
                    </div>
                  </div>

                  {/* Reason */}
                  {record.reason && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground">{t('career.promotionReason')}</p>
                      <p className="text-sm text-foreground mt-0.5">{record.reason}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <WarningModal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        employeeName={fullName}
        employeeId={employee.id}
      />
      <BonusModal
        isOpen={showBonusModal}
        onClose={() => setShowBonusModal(false)}
        employeeName={fullName}
        employeeId={employee.id}
      />
    </>
  );
}
