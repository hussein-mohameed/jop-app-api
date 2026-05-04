/**
 * @file Recent hires table — shows the latest employee additions.
 * UI component only — receives data via props.
 */

'use client';

import { getInitials, formatDate } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import type { RecentEmployee } from '@/hooks/dashboard/useDashboard';

interface RecentHiresProps {
  employees: RecentEmployee[];
}

export default function RecentHires({ employees }: RecentHiresProps) {
  if (employees.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        No recent hires
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {employees.map((emp) => (
        <div
          key={emp.id}
          className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 transition-colors hover:bg-muted/30 -mx-1 px-1 rounded-lg"
        >
          {/* Avatar */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
            {emp.user.avatarUrl ? (
              <img
                src={emp.user.avatarUrl}
                alt=""
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              getInitials(`${emp.user.firstName} ${emp.user.lastName}`)
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {emp.user.firstName} {emp.user.lastName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {emp.position} · {emp.department.name}
            </p>
          </div>

          {/* Status + Date */}
          <div className="flex shrink-0 flex-col items-end gap-1">
            <StatusBadge status={emp.employmentStatus} />
            <span className="text-xs text-muted-foreground">
              {formatDate(emp.hireDate)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
