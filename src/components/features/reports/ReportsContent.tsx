'use client';

import React from 'react';
import { useReports } from '@/hooks/reports/useReports';
import Sparkline from '@/components/ui/charts/Sparkline';
import DonutChart from '@/components/ui/charts/DonutChart';
import { formatDistanceToNow } from 'date-fns';

function TrendBadge({ value, label }: { value: number, label?: string }) {
  const isPositive = value >= 0;
  return (
    <div className="flex items-center gap-1">
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
        isPositive ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-700'
      }`}>
        {isPositive ? '↑' : '↓'} {Math.abs(value)}%
      </span>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  );
}

// Map string icon names to real SVGs
function IconResolver({ name, className }: { name: string, className?: string }) {
  const base = className || "h-5 w-5";
  switch (name) {
    case 'users': return <svg className={base} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>;
    case 'money': return <svg className={base} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    case 'briefcase': return <svg className={base} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" /></svg>;
    case 'calendar': return <svg className={base} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>;
    case 'gift': return <svg className={base} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>;
    case 'shield': return <svg className={base} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>;
    default: return <div className={base} />;
  }
}

// Activity Icon
function ActivityIcon({ type }: { type: string }) {
  const map: Record<string, { color: string, icon: string }> = {
    hire: { color: 'bg-primary-100 text-primary-600', icon: 'users' },
    payroll: { color: 'bg-warning-100 text-warning-600', icon: 'money' },
    leave: { color: 'bg-secondary-100 text-secondary-600', icon: 'calendar' },
    job: { color: 'bg-info-100 text-info-600', icon: 'briefcase' },
    bonus: { color: 'bg-success-100 text-success-600', icon: 'gift' }
  };
  const conf = map[type] || { color: 'bg-neutral-100 text-neutral-600', icon: 'shield' };
  
  return (
    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${conf.color}`}>
      <IconResolver name={conf.icon} className="h-4 w-4" />
    </div>
  );
}

export default function ReportsContent() {
  const { data, isLoading } = useReports();

  if (isLoading || !data) {
    return (
      <div className="grid gap-6 animate-pulse">
        <div className="h-32 rounded-3xl bg-card border border-border" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array(4).fill(0).map((_, i) => <div key={i} className="h-40 rounded-3xl bg-card border border-border" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* ===== HERO / HEALTH SCORE ===== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 p-8 shadow-xl text-white">
        {/* Decorative background meshes */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary-500 opacity-20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 h-32 w-48 rounded-full bg-secondary-400 opacity-20 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="text-primary-100 text-sm font-semibold uppercase tracking-wider mb-2">Company Health Index</h2>
            <div className="flex items-end gap-4">
              <span className="text-6xl font-black tracking-tight">{data.healthScore.score}</span>
              <span className="text-2xl text-primary-200 font-medium mb-1">/ 100</span>
            </div>
            <p className="mt-3 text-primary-100 max-w-md">
              Overall system status is <strong className="text-white">{data.healthScore.status}</strong>. 
              Operations, payroll, and recruitment metrics are running optimally.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col items-center justify-center min-w-[140px]">
             <span className="text-sm text-primary-100 mb-1">MoM Trend</span>
             <TrendBadge value={data.healthScore.trend} />
          </div>
        </div>
      </div>

      {/* ===== METRICS BENTO GRID ===== */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {data.primaryMetrics.map(metric => (
          <div key={metric.id} className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm hover:shadow-lg transition-all duration-300">
            {/* Subtle hover gradient */}
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary-100 opacity-0 blur-2xl transition-opacity group-hover:opacity-50" />
            
            <div className="flex justify-between items-start mb-6">
              <div className={`rounded-xl p-2.5 bg-${metric.color}-50 text-${metric.color}-600`}>
                <IconResolver name={metric.icon} />
              </div>
              <TrendBadge value={metric.trend} />
            </div>
            
            <div>
              <h3 className="text-3xl font-bold text-foreground tracking-tight mb-1">{metric.value}</h3>
              <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ===== CHARTS BENTO GRID ===== */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Headcount Sparkline */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Headcount Growth</h3>
            <p className="text-sm text-muted-foreground mt-1">6-month active employee trend</p>
          </div>
          <div className="mt-8 h-24 w-full">
            <Sparkline 
              data={data.headcountTrend.map(d => d.value)} 
              color="stroke-primary-500" 
              fill={true} 
            />
          </div>
          <div className="mt-4 flex justify-between text-xs font-medium text-muted-foreground">
            <span>{data.headcountTrend[0].label}</span>
            <span>{data.headcountTrend[data.headcountTrend.length-1].label}</span>
          </div>
        </div>

        {/* Department Distribution Donut */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-foreground self-start w-full">Department Map</h3>
          <div className="mt-4">
            <DonutChart data={data.departmentDistribution} size={180} strokeWidth={28} />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground w-full">
             {data.departmentDistribution.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className={`h-2.5 w-2.5 rounded-full ${d.color.replace('text-', 'bg-')}`} />
                  {d.label}
                </div>
             ))}
          </div>
        </div>

        {/* Payroll Trend Sparkline */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Net Payroll Expense</h3>
            <p className="text-sm text-muted-foreground mt-1">4-month financial trend</p>
          </div>
          <div className="mt-8 h-24 w-full">
            <Sparkline 
              data={data.payrollTrend.map(d => d.net)} 
              color="stroke-warning-500" 
              fill={true} 
            />
          </div>
          <div className="mt-4 flex justify-between text-xs font-medium text-muted-foreground">
             <span>{data.payrollTrend[0].label}</span>
             <span>{data.payrollTrend[data.payrollTrend.length-1].label}</span>
          </div>
        </div>
      </div>

      {/* ===== BOTTOM BENTO GRID ===== */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Department Budget Burn Rate */}
        <div className="lg:col-span-2 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-6">Department Budget Burn</h3>
          <div className="space-y-5">
            {data.departmentBudgets.map((dept, i) => {
              const pct = Math.min(100, (dept.spent / dept.allocated) * 100);
              const isOver = dept.spent > dept.allocated;
              return (
                <div key={i} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium text-foreground">{dept.department}</span>
                    <span className="text-xs font-mono text-muted-foreground">
                       ${(dept.spent/1000).toFixed(0)}k / ${(dept.allocated/1000).toFixed(0)}k
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                     <div 
                       className={`h-full rounded-full transition-all duration-1000 ${isOver ? 'bg-danger-500' : 'bg-primary-500'}`} 
                       style={{ width: `${pct}%` }} 
                     />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Unified Activity Feed */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col h-[400px]">
          <h3 className="text-lg font-semibold text-foreground mb-6">System Pulse</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-6 relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-muted z-0" />
            
            {data.recentActivities.map((activity, i) => (
              <div key={activity.id} className="relative z-10 flex gap-4">
                <ActivityIcon type={activity.type} />
                <div className="flex-1 pb-1">
                  <p className="text-sm font-medium text-foreground leading-tight">{activity.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                  <span className="text-[10px] font-semibold text-muted-foreground mt-2 block uppercase tracking-wider">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}
