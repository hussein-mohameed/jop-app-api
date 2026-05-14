/**
 * @file ManagerDashboardContent — client component for manager dashboard.
 * Features: team stats, weekly attendance chart (Recharts), today's session list.
 */

'use client';

import { useTranslation } from 'react-i18next';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TeamSession {
  name: string;
  employeeId: string;
  status: string;
  isLate: boolean;
}

interface WeeklyPoint {
  day: string;
  present: number;
  total: number;
}

interface DashboardData {
  teamCount: number;
  presentToday: number;
  lateToday: number;
  absentToday: number;
  pendingLeaves: number;
  activeWarnings: number;
  todaySessions: TeamSession[];
  weeklyAttendance: WeeklyPoint[];
}

interface Props {
  data: DashboardData | null;
}

function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-3">
        <div className={`rounded-xl p-2.5 bg-${color}-50 text-${color}-600`}>{icon}</div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}

function StatusDot({ status, isLate }: { status: string; isLate: boolean }) {
  const config: Record<string, { color: string; label: string }> = {
    ACTIVE: { color: 'bg-success-500', label: 'Working' },
    ON_BREAK: { color: 'bg-warning-500', label: 'Break' },
    COMPLETED: { color: 'bg-info-500', label: 'Done' },
  };
  const c = config[status] || { color: 'bg-neutral-400', label: status };

  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${c.color}`} />
      <span className="text-xs text-muted-foreground">{c.label}</span>
      {isLate && (
        <span className="rounded bg-danger-100 px-1.5 py-0.5 text-[10px] font-semibold text-danger-700">
          Late
        </span>
      )}
    </div>
  );
}

export default function ManagerDashboardContent({ data }: Props) {
  const { t } = useTranslation();

  if (!data) {
    return (
      <div className="rounded-2xl border border-warning-200 bg-warning-50 p-8 text-center">
        <p className="text-warning-700 font-semibold">No department assigned</p>
        <p className="text-sm text-warning-600 mt-1">Contact admin to assign you to a department.</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('nav.dashboard')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('dashboard.overview')}</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t('dashboard.teamMembers')}
          value={data.teamCount}
          color="primary"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>}
        />
        <StatCard
          label={t('dashboard.todayPresent')}
          value={data.presentToday}
          color="success"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label={t('dashboard.todayLate')}
          value={data.lateToday}
          color="warning"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>}
        />
        <StatCard
          label={t('dashboard.pendingApprovals')}
          value={data.pendingLeaves}
          color="info"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* Charts + Today */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Attendance Chart */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-base font-semibold text-foreground mb-4">{t('attendance.weeklyChart')}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.weeklyAttendance}>
              <defs>
                <linearGradient id="attendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                }}
              />
              <Area type="monotone" dataKey="present" stroke="#22c55e" strokeWidth={2} fill="url(#attendGrad)" name={t('attendance.present')} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Today's Team */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-base font-semibold text-foreground mb-4">{t('attendance.todayStatus')}</h3>
          {data.todaySessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">{t('common.noData')}</p>
          ) : (
            <div className="space-y-3 max-h-[220px] overflow-y-auto">
              {data.todaySessions.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.employeeId}</p>
                  </div>
                  <StatusDot status={s.status} isLate={s.isLate} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
