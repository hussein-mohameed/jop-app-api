/**
 * @file Manager Dashboard — server component with real data.
 * Validates role, fetches team data via server-only queries.
 */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/security/auth/session.security';
import { getManagerDashboardData } from '@/queries/dashboard.queries';
import ManagerDashboardContent from '@/components/features/dashboard/ManagerDashboardContent';

export const metadata: Metadata = {
  title: 'Manager Dashboard | HR System',
  description: 'Manage your team, track attendance, and review department performance.',
};

export default async function ManagerDashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  if (session.role !== 'MANAGER') redirect('/employee');

  const data = await getManagerDashboardData(session.sub);

  return (
    <div className="space-y-6">
      <ManagerDashboardContent data={data} />
    </div>
  );
}
