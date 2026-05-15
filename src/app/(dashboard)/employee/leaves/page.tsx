/**
 * @file Employee Leaves Page — server component.
 * Validates session, fetches leave history and balances.
 */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/security/auth/session.security';
import { getEmployeeLeaves, getEmployeeLeaveBalances, getActiveLeaveTypes } from '@/queries/leave.queries';
import EmployeeLeavesContent from '@/components/features/leaves/EmployeeLeavesContent';

export const metadata: Metadata = {
  title: 'My Leaves | HR System',
  description: 'View your leave balances and request time off.',
};

export default async function EmployeeLeavesPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const currentYear = new Date().getFullYear();

  const [leaves, balances, leaveTypes] = await Promise.all([
    getEmployeeLeaves(session.sub),
    getEmployeeLeaveBalances(session.sub, currentYear),
    getActiveLeaveTypes(),
  ]);

  return (
    <div className="space-y-6">
      <EmployeeLeavesContent
        leaves={leaves}
        balances={balances}
        leaveTypes={leaveTypes}
      />
    </div>
  );
}
