/**
 * @file HR Dashboard — server component with real data.
 * Validates HR role, fetches company-wide data via server-only queries.
 */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/security/auth/session.security';
import { getHRDashboardData } from '@/queries/dashboard.queries';
import HRDashboardContent from '@/components/features/dashboard/HRDashboardContent';

export const metadata: Metadata = {
  title: 'HR Dashboard | HR System',
  description: 'Manage employees, payroll, recruitment, and company-wide HR operations.',
};

export default async function HRDashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const allowedRoles = ['HR_STAFF', 'HR_MANAGER'];
  if (!allowedRoles.includes(session.role as string)) redirect('/employee');

  const data = await getHRDashboardData();

  return (
    <div className="space-y-6">
      <HRDashboardContent data={data} />
    </div>
  );
}
