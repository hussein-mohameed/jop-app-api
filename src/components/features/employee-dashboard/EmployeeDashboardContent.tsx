'use client';

import React, { useState } from 'react';
import { useWorkSession } from '@/hooks/sessions/useWorkSession';

// ==================== HELPERS ====================

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}
// test

// ==================== STATUS INDICATOR ====================

function StatusBadge({ status }: { status: string | null }) {
  const config: Record<string, { color: string; bg: string; label: string; pulse: boolean }> = {
    ACTIVE: { color: 'text-success-700', bg: 'bg-success-100', label: 'Working', pulse: true },
    ON_BREAK: { color: 'text-warning-700', bg: 'bg-warning-100', label: 'On Break', pulse: true },
    COMPLETED: { color: 'text-info-700', bg: 'bg-info-100', label: 'Completed', pulse: false },
  };
  const c = config[status ?? ''] || { color: 'text-neutral-500', bg: 'bg-neutral-100', label: 'Not Started', pulse: false };

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${c.bg} ${c.color}`}>
      {c.pulse && <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-current" /></span>}
      {c.label}
    </span>
  );
}

// ==================== CIRCULAR TIMER ====================

function CircularTimer({ elapsed, max, status }: { elapsed: number; max: number; status: string | null }) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(elapsed / max, 1);
  const offset = circumference - progress * circumference;

  const colorMap: Record<string, string> = {
    ACTIVE: 'stroke-success-500',
    ON_BREAK: 'stroke-warning-500',
    COMPLETED: 'stroke-info-500',
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-90">
        <circle cx="100" cy="100" r={radius} fill="none" strokeWidth="8" className="stroke-muted" />
        <circle
          cx="100" cy="100" r={radius} fill="none" strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`transition-all duration-1000 ${colorMap[status ?? ''] || 'stroke-neutral-300'}`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-black tracking-tight text-foreground font-mono">
          {formatTime(elapsed)}
        </span>
        <StatusBadge status={status} />
      </div>
    </div>
  );
}

// ==================== BREAK PROGRESS ====================

function BreakProgress({
  breakSlots,
  takenBreaks,
  mode,
  totalBreakMin,
}: {
  breakSlots: { name: string; startTime: string; endTime: string; durationMin: number }[];
  takenBreaks: { slotName: string | null; durationMin: number | null; endedAt: string | null }[];
  mode: string;
  totalBreakMin: number;
}) {
  if (mode === 'NONE') {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Task-based — no scheduled breaks
      </div>
    );
  }

  if (mode === 'FLEXIBLE') {
    const usedMin = takenBreaks.reduce((s, b) => s + (b.durationMin ?? 0), 0);
    const pct = Math.min(100, (usedMin / totalBreakMin) * 100);
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-medium text-muted-foreground">
          <span>Break time used</span>
          <span>{usedMin} / {totalBreakMin} min</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-warning-500 transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }

  // FIXED mode — sequential slots
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {breakSlots.map((slot, i) => {
        const taken = takenBreaks.find(b => b.slotName === slot.name && b.endedAt);
        const isActive = takenBreaks.find(b => b.slotName === slot.name && !b.endedAt);
        return (
          <React.Fragment key={i}>
            {i > 0 && <div className="h-0.5 w-4 bg-muted flex-shrink-0" />}
            <div className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium flex-shrink-0 transition-all ${taken ? 'bg-success-100 text-success-700' :
                isActive ? 'bg-warning-100 text-warning-700 ring-2 ring-warning-300' :
                  'bg-muted text-muted-foreground'
              }`}>
              {taken ? (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              ) : isActive ? (
                <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning-500 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-warning-500" /></span>
              ) : (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5" /></svg>
              )}
              <span>{slot.name}</span>
              <span className="text-[10px] opacity-60">{slot.startTime}-{slot.endTime}</span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ==================== STAT CARD ====================

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-all duration-300">
      <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-${color}-100 opacity-0 blur-2xl transition-opacity group-hover:opacity-60`} />
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

// ==================== MAIN COMPONENT ====================

export default function EmployeeDashboardContent() {
  const {
    session, breakPolicy, analytics,
    isLoading, error, elapsed, breakElapsed,
    clockIn, clockOut, startBreak, resumeWork,
  } = useWorkSession();

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [breakType, setBreakType] = useState<string>('REST');

  const handleAction = async (action: string) => {
    setActionLoading(action);
    try {
      switch (action) {
        case 'clockIn': await clockIn(); break;
        case 'clockOut': await clockOut(); break;
        case 'startBreak': await startBreak(breakType); break;
        case 'resumeWork': await resumeWork(); break;
      }
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-80 rounded-3xl bg-card border border-border" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array(4).fill(0).map((_, i) => <div key={i} className="h-24 rounded-2xl bg-card border border-border" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-danger-200 bg-danger-50 p-6 text-danger-700">
        <p className="font-semibold">Error loading dashboard</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  const workingHoursMax = 8 * 3600; // 8 hours in seconds

  return (
    <div className="space-y-6">
      {/* ===== LIVE SESSION HERO ===== */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        {/* Decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-transparent to-secondary-50/30 pointer-events-none" />

        <div className="relative z-10 p-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Timer */}
            <div className="flex flex-col items-center gap-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Today&apos;s Session
              </h2>
              <CircularTimer
                elapsed={elapsed}
                max={workingHoursMax}
                status={session?.status ?? null}
              />
              {session?.isLate && (
                <span className="inline-flex items-center gap-1 rounded-full bg-danger-50 px-3 py-1 text-xs font-semibold text-danger-700">
                  ⚠ {session.lateMinutes} min late
                </span>
              )}
            </div>

            {/* Controls + Info */}
            <div className="flex-1 flex flex-col items-center lg:items-start gap-6 max-w-md">
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {!session || session.status === 'COMPLETED' ? (
                  <button
                    onClick={() => handleAction('clockIn')}
                    disabled={actionLoading === 'clockIn' || session?.status === 'COMPLETED'}
                    className="rounded-xl bg-gradient-to-r from-success-600 to-success-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-success-500/25 hover:shadow-xl hover:from-success-500 hover:to-success-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === 'clockIn' ? 'Clocking In...' : session?.status === 'COMPLETED' ? 'Day Complete ✓' : '⏱ Clock In'}
                  </button>
                ) : (
                  <>
                    {session.status === 'ACTIVE' && (
                      <>
                        <button
                          onClick={() => handleAction('startBreak')}
                          disabled={!!actionLoading}
                          className="rounded-xl bg-gradient-to-r from-warning-500 to-warning-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-warning-500/25 hover:shadow-xl transition-all disabled:opacity-50"
                        >
                          {actionLoading === 'startBreak' ? 'Starting...' : '☕ Take Break'}
                        </button>
                        <button
                          onClick={() => handleAction('clockOut')}
                          disabled={!!actionLoading}
                          className="rounded-xl bg-gradient-to-r from-danger-500 to-danger-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-danger-500/25 hover:shadow-xl transition-all disabled:opacity-50"
                        >
                          {actionLoading === 'clockOut' ? 'Ending...' : '🏁 Clock Out'}
                        </button>
                      </>
                    )}
                    {session.status === 'ON_BREAK' && (
                      <button
                        onClick={() => handleAction('resumeWork')}
                        disabled={!!actionLoading}
                        className="rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/25 hover:shadow-xl transition-all disabled:opacity-50"
                      >
                        {actionLoading === 'resumeWork' ? 'Resuming...' : '▶ Resume Work'}
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Break Type Selector (only when working) */}
              {session?.status === 'ACTIVE' && breakPolicy?.mode !== 'NONE' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Break type:</span>
                  {['REST', 'LUNCH', 'PRAYER', 'PERSONAL'].map(t => (
                    <button
                      key={t}
                      onClick={() => setBreakType(t)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${breakType === t
                          ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-300'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                    >
                      {t === 'REST' ? '☕' : t === 'LUNCH' ? '🍽' : t === 'PRAYER' ? '🕌' : '👤'} {t.charAt(0) + t.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              )}

              {/* On-Break info */}
              {session?.status === 'ON_BREAK' && (
                <div className="rounded-xl bg-warning-50 border border-warning-200 px-4 py-3 text-sm">
                  <span className="font-semibold text-warning-800">Break Duration: </span>
                  <span className="font-mono font-bold text-warning-900">{formatTime(breakElapsed)}</span>
                </div>
              )}

              {/* Session summary (when completed) */}
              {session?.status === 'COMPLETED' && (
                <div className="grid grid-cols-3 gap-4 w-full">
                  <div className="rounded-xl bg-success-50 p-3 text-center">
                    <p className="text-lg font-bold text-success-700">{formatMinutes(session.totalWorkMin)}</p>
                    <p className="text-[10px] font-semibold text-success-600 uppercase">Work</p>
                  </div>
                  <div className="rounded-xl bg-warning-50 p-3 text-center">
                    <p className="text-lg font-bold text-warning-700">{formatMinutes(session.totalBreakMin)}</p>
                    <p className="text-[10px] font-semibold text-warning-600 uppercase">Break</p>
                  </div>
                  <div className="rounded-xl bg-info-50 p-3 text-center">
                    <p className="text-lg font-bold text-info-700">{formatMinutes(session.totalWorkMin + session.totalBreakMin)}</p>
                    <p className="text-[10px] font-semibold text-info-600 uppercase">Total</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Break Progress Bar */}
          {breakPolicy && session && (
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Break Schedule</h3>
              <BreakProgress
                breakSlots={breakPolicy.breakSlots}
                takenBreaks={session.breaks}
                mode={breakPolicy.mode}
                totalBreakMin={breakPolicy.totalBreakMin}
              />
            </div>
          )}
        </div>
      </div>

      {/* ===== QUICK STATS ===== */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Monthly Hours"
          value={analytics ? formatMinutes(analytics.totalWorkMin) : '—'}
          color="primary"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Attendance Rate"
          value={analytics ? `${analytics.attendanceRate}%` : '—'}
          color="success"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Absent Days"
          value={analytics?.absentDays ?? '—'}
          color="danger"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>}
        />
        <StatCard
          label="Late Arrivals"
          value={analytics?.lateDays ?? '—'}
          color="warning"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>}
        />
      </div>

      {/* ===== TODAY'S BREAKS TIMELINE ===== */}
      {session && session.breaks.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Today&apos;s Breaks</h3>
          <div className="space-y-3">
            {session.breaks.map((b, i) => (
              <div key={b.id} className="flex items-center gap-4">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${b.endedAt ? 'bg-success-100 text-success-700' : 'bg-warning-100 text-warning-700'
                  }`}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {b.slotName || b.type.charAt(0) + b.type.slice(1).toLowerCase()}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {new Date(b.startedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      {b.endedAt && ` → ${new Date(b.endedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                    </span>
                  </div>
                  {b.durationMin != null && (
                    <span className="text-xs text-muted-foreground">{b.durationMin} min</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== MONTHLY SUMMARY ===== */}
      {analytics && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Summary</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="text-2xl font-bold text-foreground">{analytics.totalDays}</p>
              <p className="text-xs text-muted-foreground">Days Worked</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="text-2xl font-bold text-foreground">{formatMinutes(analytics.totalBreakMin)}</p>
              <p className="text-xs text-muted-foreground">Total Break Time</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="text-2xl font-bold text-foreground">{analytics.overtimeDays}</p>
              <p className="text-xs text-muted-foreground">Overtime Days</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="text-2xl font-bold text-foreground">{analytics.salaryDaySystem}-day</p>
              <p className="text-xs text-muted-foreground">Salary System</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
