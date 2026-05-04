/**
 * @file Employee status badge component.
 * Displays a colored badge based on employment status.
 */

'use client';

import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  ACTIVE: {
    label: 'Active',
    className: 'bg-success-50 text-success-700 ring-success-600/20',
  },
  INACTIVE: {
    label: 'Inactive',
    className: 'bg-neutral-100 text-neutral-600 ring-neutral-500/20',
  },
  ON_LEAVE: {
    label: 'On Leave',
    className: 'bg-warning-50 text-warning-700 ring-warning-600/20',
  },
  TERMINATED: {
    label: 'Terminated',
    className: 'bg-danger-50 text-danger-700 ring-danger-600/20',
  },
  PROBATION: {
    label: 'Probation',
    className: 'bg-info-50 text-info-700 ring-info-600/20',
  },
};

/**
 * Status badge — renders a pill with semantic color based on employment status.
 */
export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: 'bg-neutral-100 text-neutral-600 ring-neutral-500/20',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
