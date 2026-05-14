/**
 * @file SchedulesContent — client component for work schedule management.
 * Displays employee schedules, recharts bar chart, and edit modal.
 */

'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ScheduleEditModal from '@/components/modals/ScheduleEditModal';

interface EmployeeSchedule {
  id: string;
  employeeId: string;
  name: string;
  position: string;
  department: string;
  isCustom: boolean;
  schedule: {
    workStartTime: string;
    workEndTime: string;
    workDays: number[];
  };
}

interface Props {
  employees: EmployeeSchedule[];
  defaults: { workStartTime: string; workEndTime: string; workDays: number[] };
}

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

function getDayShort(idx: number): string {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][idx];
}

export default function SchedulesContent({ employees, defaults }: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'custom' | 'default'>('all');
  const [editTarget, setEditTarget] = useState<EmployeeSchedule | null>(null);

  const filtered = useMemo(() => {
    return employees.filter((emp) => {
      const matchSearch = emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === 'all' ||
        (filterType === 'custom' && emp.isCustom) ||
        (filterType === 'default' && !emp.isCustom);
      return matchSearch && matchType;
    });
  }, [employees, search, filterType]);

  // Stats for chart
  const customCount = employees.filter((e) => e.isCustom).length;
  const defaultCount = employees.length - customCount;

  const chartData = [
    { name: t('schedule.customCount'), value: customCount, color: '#6366f1' },
    { name: t('schedule.defaultCount'), value: defaultCount, color: '#22c55e' },
  ];

  return (
    <>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('schedule.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('schedule.description')}</p>
      </div>

      {/* Stats + Chart */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Default Schedule Info */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {t('schedule.defaultSchedule')}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('schedule.workStartTime')}</span>
              <span className="font-mono font-bold text-foreground">{defaults.workStartTime}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('schedule.workEndTime')}</span>
              <span className="font-mono font-bold text-foreground">{defaults.workEndTime}</span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">{t('schedule.workDays')}</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {DAY_KEYS.map((key, idx) => (
                  <span
                    key={idx}
                    className={`rounded-md px-2 py-1 text-xs font-medium ${
                      defaults.workDays.includes(idx)
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-muted text-muted-foreground line-through'
                    }`}
                  >
                    {t(`days.${key}`)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {t('schedule.statsTitle')}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-primary-50 p-4 text-center">
              <p className="text-2xl font-bold text-primary-700">{customCount}</p>
              <p className="text-xs font-medium text-primary-600">{t('schedule.customCount')}</p>
            </div>
            <div className="rounded-lg bg-success-50 p-4 text-center">
              <p className="text-2xl font-bold text-success-700">{defaultCount}</p>
              <p className="text-xs font-medium text-success-600">{t('schedule.defaultCount')}</p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {t('schedule.statsTitle')}
          </h3>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="search"
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as 'all' | 'custom' | 'default')}
          className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30"
        >
          <option value="all">{t('common.all')}</option>
          <option value="custom">{t('schedule.custom')}</option>
          <option value="default">{t('schedule.default')}</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="whitespace-nowrap px-4 py-3.5 font-semibold text-muted-foreground">{t('schedule.employee')}</th>
                <th className="whitespace-nowrap px-4 py-3.5 font-semibold text-muted-foreground">{t('common.department')}</th>
                <th className="whitespace-nowrap px-4 py-3.5 font-semibold text-muted-foreground">{t('schedule.scheduleType')}</th>
                <th className="whitespace-nowrap px-4 py-3.5 font-semibold text-muted-foreground">{t('schedule.workStartTime')}</th>
                <th className="whitespace-nowrap px-4 py-3.5 font-semibold text-muted-foreground">{t('schedule.workEndTime')}</th>
                <th className="whitespace-nowrap px-4 py-3.5 font-semibold text-muted-foreground">{t('schedule.workDays')}</th>
                <th className="whitespace-nowrap px-4 py-3.5 font-semibold text-muted-foreground text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((emp) => (
                <tr key={emp.id} className="transition-colors hover:bg-muted/30">
                  <td className="whitespace-nowrap px-4 py-3">
                    <div>
                      <p className="font-medium text-foreground">{emp.name}</p>
                      <p className="text-xs text-muted-foreground">{emp.employeeId}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{emp.department}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                      emp.isCustom
                        ? 'bg-primary-50 text-primary-700 ring-primary-600/20'
                        : 'bg-success-50 text-success-700 ring-success-600/20'
                    }`}>
                      {emp.isCustom ? t('schedule.custom') : t('schedule.default')}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-foreground">{emp.schedule.workStartTime}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-foreground">{emp.schedule.workEndTime}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex gap-1">
                      {emp.schedule.workDays.map((d) => (
                        <span key={d} className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                          {getDayShort(d)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button
                      onClick={() => setEditTarget(emp)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-primary-50 hover:text-primary-600 transition-colors"
                      title={t('common.edit')}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <ScheduleEditModal
          isOpen={!!editTarget}
          onClose={() => setEditTarget(null)}
          employeeName={editTarget.name}
          employeeId={editTarget.id}
          current={editTarget.schedule}
          isCustom={editTarget.isCustom}
        />
      )}
    </>
  );
}
