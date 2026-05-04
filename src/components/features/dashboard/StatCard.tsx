/**
 * @file KPI stat card — reusable metric card for dashboard.
 * Displays a single KPI with icon, value, label, and optional trend.
 * UI component only — receives data via props.
 */

'use client';

import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
}

const ACCENT_STYLES = {
  primary: {
    iconBg: 'bg-primary-100 text-primary-600',
    border: 'border-l-primary-500',
  },
  success: {
    iconBg: 'bg-success-50 text-success-600',
    border: 'border-l-success-500',
  },
  warning: {
    iconBg: 'bg-warning-50 text-warning-600',
    border: 'border-l-warning-500',
  },
  danger: {
    iconBg: 'bg-danger-50 text-danger-600',
    border: 'border-l-danger-500',
  },
  info: {
    iconBg: 'bg-info-50 text-info-600',
    border: 'border-l-info-500',
  },
  secondary: {
    iconBg: 'bg-secondary-100 text-secondary-700',
    border: 'border-l-secondary-500',
  },
} as const;

export default function StatCard({
  label,
  value,
  icon,
  trend,
  accentColor = 'primary',
}: StatCardProps) {
  const accent = ACCENT_STYLES[accentColor];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md',
        'border-l-4',
        accent.border
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          {trend && (
            <p
              className={cn(
                'mt-1 text-xs font-medium',
                trend.isPositive ? 'text-success-600' : 'text-danger-600'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', accent.iconBg)}>
          {icon}
        </div>
      </div>
    </div>
  );
}
