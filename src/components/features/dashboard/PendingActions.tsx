/**
 * @file Pending actions panel — shows items requiring admin attention.
 * Displays pending leave requests and bonus approvals.
 * UI component only — receives data via props.
 */

'use client';

import { formatDate, formatCurrency } from '@/lib/utils';
import type { PendingLeave, PendingBonus } from '@/hooks/dashboard/useDashboard';

interface PendingActionsProps {
  leaves: PendingLeave[];
  bonuses: PendingBonus[];
}

export default function PendingActions({ leaves, bonuses }: PendingActionsProps) {
  const hasNothing = leaves.length === 0 && bonuses.length === 0;

  if (hasNothing) {
    return (
      <div className="flex h-48 flex-col items-center justify-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-50">
          <svg className="h-6 w-6 text-success-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="mt-3 text-sm font-medium text-foreground">All caught up!</p>
        <p className="mt-1 text-xs text-muted-foreground">No pending actions</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pending Leave Requests */}
      {leaves.length > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            Leave Requests ({leaves.length})
          </h4>
          <div className="space-y-2">
            {leaves.map((leave) => (
              <div
                key={leave.id}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3 transition-colors hover:bg-muted/60"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {leave.employee.firstName} {leave.employee.lastName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {leave.totalDays} day{leave.totalDays !== 1 ? 's' : ''} · {formatDate(leave.startDate)}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-warning-100 px-2.5 py-0.5 text-xs font-medium text-warning-700">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Bonuses */}
      {bonuses.length > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            Bonus Approvals ({bonuses.length})
          </h4>
          <div className="space-y-2">
            {bonuses.map((bonus) => (
              <div
                key={bonus.id}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3 transition-colors hover:bg-muted/60"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {formatCurrency(bonus.amount)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    By {bonus.suggestedBy.firstName} {bonus.suggestedBy.lastName}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-warning-100 px-2.5 py-0.5 text-xs font-medium text-warning-700">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
