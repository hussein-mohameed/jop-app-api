/**
 * @file HRDashboardContent — client component for HR dashboard.
 * Features: KPI cards, department bar chart, employment type pie chart (Recharts).
 */

'use client';

import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

interface DeptStat {
  name: string;
  employees: number;
}

interface TypeStat {
  type: string;
  count: number;
}

interface DashboardData {
  totalEmployees: number;
  activeEmployees: number;
  todayPresent: number;
  attendanceRate: number;
  pendingLeaves: number;
  pendingBonuses: number;
  departmentStats: DeptStat[];
  employmentTypes: TypeStat[];
}

interface Props {
  data: DashboardData;
}

const PIE_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4'];

function StatCard({ label, value, color, suffix }: { label: string; value: number | string; color: string; suffix?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-all">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={`text-3xl font-bold text-${color}-600 mt-1`}>
        {value}{suffix}
      </p>
    </div>
  );
}

export default function HRDashboardContent({ data }: Props) {
  const { t } = useTranslation();

  const typeLabels: Record<string, string> = {
    FULL_TIME: 'Full Time',
    PART_TIME: 'Part Time',
    CONTRACT: 'Contract',
    INTERNSHIP: 'Internship',
    REMOTE: 'Remote',
  };

  const pieData = data.employmentTypes.map((et) => ({
    name: typeLabels[et.type] || et.type,
    value: et.count,
  }));

  return (
    <>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('nav.dashboard')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('dashboard.overview')}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t('dashboard.totalEmployees')} value={data.totalEmployees} color="primary" />
        <StatCard label={t('dashboard.activeEmployees')} value={data.activeEmployees} color="success" />
        <StatCard label={t('attendance.attendanceRate')} value={data.attendanceRate} color="info" suffix="%" />
        <StatCard label={t('dashboard.todayPresent')} value={data.todayPresent} color="success" />
      </div>

      {/* Pending Actions Row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-warning-200 bg-warning-50 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-warning-800">{t('dashboard.pendingActions')}</p>
            <p className="text-xs text-warning-600 mt-0.5">{t('nav.leaves')}</p>
          </div>
          <p className="text-3xl font-bold text-warning-700">{data.pendingLeaves}</p>
        </div>
        <div className="rounded-xl border border-primary-200 bg-primary-50 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-primary-800">{t('dashboard.pendingActions')}</p>
            <p className="text-xs text-primary-600 mt-0.5">{t('nav.bonuses')}</p>
          </div>
          <p className="text-3xl font-bold text-primary-700">{data.pendingBonuses}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Department Bar Chart */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-base font-semibold text-foreground mb-4">{t('dashboard.departmentDist')}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.departmentStats} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                }}
              />
              <Bar dataKey="employees" fill="#6366f1" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Employment Type Pie Chart */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-base font-semibold text-foreground mb-4">{t('dashboard.employmentTypes')}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value: string) => <span className="text-xs text-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
