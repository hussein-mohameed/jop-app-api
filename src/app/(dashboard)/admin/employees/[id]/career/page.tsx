/**
 * @file Career History Page — standalone server component.
 * Validates role, fetches career data, and renders the client-side timeline.
 */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/security/auth/session.security';
import { getEmployeeInfo, getCareerTimeline, getSalaryTrend } from '@/queries/career.queries';
import CareerTimelineContent from '@/components/features/career/CareerTimelineContent';

export const metadata: Metadata = {
  title: 'Career History | HR System',
  description: 'View employee career timeline, position changes, and salary history.',
};

export default async function CareerHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect('/login');

  const hasPermission = (session.permissions as string[]).includes('VIEW_CAREER_HISTORY');
  if (!hasPermission) redirect('/admin');

  const [employee, timeline, salaryTrend] = await Promise.all([
    getEmployeeInfo(id),
    getCareerTimeline(id),
    getSalaryTrend(id),
  ]);

  if (!employee) {
    return (
      <div className="rounded-xl border border-danger-200 bg-danger-50 p-8 text-center">
        <p className="text-danger-700 font-semibold">Employee not found</p>
      </div>
    );
  }

  // Serialize for client component
  const employeeData = {
    ...employee,
    hireDate: employee.hireDate.toISOString(),
  };

  return (
    <div className="space-y-6">
      <CareerTimelineContent
        employee={employeeData}
        timeline={timeline}
        salaryTrend={salaryTrend}
      />
    </div>
  );
}
