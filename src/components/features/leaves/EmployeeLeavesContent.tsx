/**
 * @file EmployeeLeavesContent — client component for employee leaves page.
 * Displays leave balances, history, and a button to request a new leave.
 */

'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { LeaveHistoryRecord, EmployeeLeaveBalance } from '@/queries/leave.queries';
import LeaveRequestModal from '@/components/modals/LeaveRequestModal';
import StatusBadge from '@/components/ui/StatusBadge';

interface Props {
  leaves: LeaveHistoryRecord[];
  balances: EmployeeLeaveBalance[];
  leaveTypes: { id: string; name: string; code: string; isPaid: boolean; color: string | null }[];
}

export default function EmployeeLeavesContent({ leaves, balances, leaveTypes }: Props) {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Group leaves by status for quick stats
  const pendingCount = leaves.filter((l) => l.status === 'PENDING').length;
  const approvedCount = leaves.filter((l) => l.status === 'APPROVED').length;

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('leaves.myLeaves')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('leaves.description')}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-500 shadow-sm transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t('leaves.requestLeave')}
        </button>
      </div>

      {/* Balances Grid */}
      {balances.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {balances.map((balance) => {
            const chartData = [
              { name: t('leaves.usedDays'), value: balance.usedDays, color: balance.color },
              { name: t('leaves.pendingDays'), value: balance.pendingDays, color: '#f59e0b' },
              {
                name: t('leaves.remainingDays'),
                value: Math.max(0, balance.totalDays - balance.usedDays - balance.pendingDays),
                color: 'hsl(var(--muted))',
              },
            ];

            return (
              <div key={balance.leaveTypeId} className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                    <h3 className="font-semibold text-foreground">{balance.leaveTypeName}</h3>
                    <p className="text-xs font-medium text-muted-foreground mt-0.5">{balance.leaveTypeCode}</p>
                  </div>
                  <div className="rounded-lg bg-muted px-2 py-1 text-xs font-bold text-foreground">
                    {balance.totalDays} {t('leaves.daysTotal')}
                  </div>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                  <div className="h-16 w-16 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={20}
                          outerRadius={30}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ fontSize: '12px', padding: '4px 8px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{t('leaves.used')}:</span>
                      <span className="font-semibold text-foreground">{balance.usedDays}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{t('leaves.pending')}:</span>
                      <span className="font-semibold text-warning-600">{balance.pendingDays}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{t('leaves.remaining')}:</span>
                      <span className="font-bold text-success-600">
                        {Math.max(0, balance.totalDays - balance.usedDays - balance.pendingDays)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* History Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border p-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">{t('leaves.history')}</h2>
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 font-medium text-warning-700 bg-warning-50 px-2 py-1 rounded-md">
              <span className="w-2 h-2 rounded-full bg-warning-500" />
              {pendingCount} {t('leaves.pending')}
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium text-success-700 bg-success-50 px-2 py-1 rounded-md">
              <span className="w-2 h-2 rounded-full bg-success-500" />
              {approvedCount} {t('leaves.approved')}
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {leaves.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>{t('leaves.noLeavesFound')}</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="whitespace-nowrap px-5 py-3 font-semibold text-muted-foreground">{t('leaves.leaveType')}</th>
                  <th className="whitespace-nowrap px-5 py-3 font-semibold text-muted-foreground">{t('leaves.duration')}</th>
                  <th className="whitespace-nowrap px-5 py-3 font-semibold text-muted-foreground">{t('leaves.reason')}</th>
                  <th className="whitespace-nowrap px-5 py-3 font-semibold text-muted-foreground">{t('leaves.appliedOn')}</th>
                  <th className="whitespace-nowrap px-5 py-3 font-semibold text-muted-foreground">{t('leaves.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-muted/30 transition-colors">
                    <td className="whitespace-nowrap px-5 py-3 font-medium text-foreground">
                      {leave.leaveTypeName}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      <p className="font-semibold text-foreground">{leave.totalDays} {t('leaves.days')}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground max-w-[200px] truncate" title={leave.reason}>
                      {leave.reason}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                      {new Date(leave.createdAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <StatusBadge status={leave.status as any} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <LeaveRequestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          leaveTypes={leaveTypes}
          onSuccess={() => window.location.reload()}
        />
      )}
    </>
  );
}
