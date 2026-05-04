/**
 * @file AdminDashboardContent — client component for the admin dashboard.
 * Orchestrates the useDashboard hook and all dashboard UI components.
 * UI component only — no business logic, no direct API calls.
 */

'use client';

import Link from 'next/link';
import { useDashboard } from '@/hooks/dashboard/useDashboard';
import StatCard from '@/components/features/dashboard/StatCard';
import DepartmentChart from '@/components/features/dashboard/DepartmentChart';
import RecentHires from '@/components/features/dashboard/RecentHires';
import PendingActions from '@/components/features/dashboard/PendingActions';
import EmploymentTypeDonut from '@/components/features/dashboard/EmploymentTypeDonut';

// ==================== ICON HELPERS ====================

const iconClass = 'h-5 w-5';

function UsersIcon() {
  return (
    <svg className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
    </svg>
  );
}

function XCircleIcon() {
  return (
    <svg className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

// ==================== SKELETON ====================

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* KPI Cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-4 w-20 rounded bg-neutral-200" />
                <div className="h-7 w-14 rounded bg-neutral-200" />
              </div>
              <div className="h-11 w-11 rounded-xl bg-neutral-200" />
            </div>
          </div>
        ))}
      </div>
      {/* Charts skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="h-5 w-40 rounded bg-neutral-200 mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="h-3 w-24 rounded bg-neutral-200 mb-1" />
                <div className="h-2.5 w-full rounded-full bg-neutral-100" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="h-5 w-36 rounded bg-neutral-200 mb-6" />
          <div className="flex items-center gap-6">
            <div className="h-28 w-28 rounded-full bg-neutral-200" />
            <div className="space-y-3">
              <div className="h-3 w-24 rounded bg-neutral-200" />
              <div className="h-3 w-20 rounded bg-neutral-200" />
              <div className="h-3 w-16 rounded bg-neutral-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function AdminDashboardContent() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-danger-500/30 bg-danger-50 p-6 text-center">
        <XCircleIcon />
        <p className="mt-2 text-sm font-medium text-danger-700">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const { counts, departmentDistribution, recentHires, employmentTypes, pendingActions } = data;

  return (
    <div className="space-y-6">
      {/* ===== KPI CARDS ===== */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Employees"
          value={counts.totalEmployees}
          icon={<UsersIcon />}
          accentColor="primary"
        />
        <StatCard
          label="Active"
          value={counts.activeEmployees}
          icon={<CheckCircleIcon />}
          accentColor="success"
        />
        <StatCard
          label="On Leave"
          value={counts.onLeaveEmployees}
          icon={<CalendarIcon />}
          accentColor="warning"
        />
        <StatCard
          label="Terminated"
          value={counts.terminatedEmployees}
          icon={<XCircleIcon />}
          accentColor="danger"
        />
        <StatCard
          label="Departments"
          value={counts.totalDepartments}
          icon={<BuildingIcon />}
          accentColor="info"
        />
        <StatCard
          label="Pending Leaves"
          value={counts.pendingLeaves}
          icon={<ClockIcon />}
          accentColor="warning"
        />
        <StatCard
          label="Pending Bonuses"
          value={counts.pendingBonuses}
          icon={<GiftIcon />}
          accentColor="secondary"
        />
        <StatCard
          label="Open Jobs"
          value={counts.openJobs}
          icon={<BriefcaseIcon />}
          accentColor="info"
        />
      </div>

      {/* ===== CHARTS ROW ===== */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Department Distribution */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Department Distribution</h2>
            <Link
              href="/admin/employees"
              className="text-xs font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              View all →
            </Link>
          </div>
          <DepartmentChart departments={departmentDistribution} />
        </div>

        {/* Employment Type Breakdown */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-5 text-base font-semibold text-foreground">Employment Types</h2>
          <EmploymentTypeDonut data={employmentTypes} />
        </div>
      </div>

      {/* ===== BOTTOM ROW ===== */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Hires */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Recent Hires</h2>
            <Link
              href="/admin/employees"
              className="text-xs font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              View all →
            </Link>
          </div>
          <RecentHires employees={recentHires} />
        </div>

        {/* Pending Actions */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-5 text-base font-semibold text-foreground">Pending Actions</h2>
          <PendingActions
            leaves={pendingActions.pendingLeaves}
            bonuses={pendingActions.pendingBonuses}
          />
        </div>
      </div>

      {/* ===== QUICK LINKS ===== */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-foreground">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Add Employee', href: '/admin/employees', icon: '👤', desc: 'Create a new employee record' },
            { label: 'Manage Departments', href: '/admin/departments', icon: '🏢', desc: 'View and edit departments' },
            { label: 'Review Leaves', href: '/admin/leaves', icon: '📅', desc: 'Approve or reject leave requests' },
            { label: 'Post a Job', href: '/admin/jobs', icon: '💼', desc: 'Create a new job listing' },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group flex items-start gap-3 rounded-xl border border-border p-4 transition-all hover:border-primary-300 hover:bg-primary-50/50 hover:shadow-sm"
            >
              <span className="text-xl">{action.icon}</span>
              <div>
                <p className="text-sm font-medium text-foreground group-hover:text-primary-600 transition-colors">
                  {action.label}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {action.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
