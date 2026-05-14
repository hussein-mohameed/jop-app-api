/**
 * @file Admin Work Schedules Page — server component.
 * Validates role, fetches schedule data, and passes to client component.
 */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/security/auth/session.security';
import { getAllEmployeeSchedules, getDefaultSchedule } from '@/queries/schedule.queries';
import SchedulesContent from '@/components/features/schedules/SchedulesContent';

export const metadata: Metadata = {
  title: 'Work Schedules | HR System',
  description: 'Manage employee working hours and days.',
};

export default async function AdminSchedulesPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const hasPermission = (session.permissions as string[]).includes('MANAGE_WORK_SCHEDULES');
  if (!hasPermission) redirect('/admin');

  const [employees, defaults] = await Promise.all([
    getAllEmployeeSchedules(),
    getDefaultSchedule(),
  ]);

  return (
    <div className="space-y-6">
      <SchedulesContent employees={employees} defaults={defaults} />
    </div>
  );
}
