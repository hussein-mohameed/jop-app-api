/**
 * @file Employee dashboard page — server component wrapper.
 * Renders the premium employee dashboard with live session tracking.
 */

import type { Metadata } from 'next';
import EmployeeDashboardContent from '@/components/features/employee-dashboard/EmployeeDashboardContent';

export const metadata: Metadata = {
  title: 'Employee Dashboard | HR System',
  description: 'Track your work sessions, breaks, attendance, and view your payslip summaries.',
};

export default function EmployeeDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your work sessions, breaks, and attendance.
        </p>
      </div>

      <EmployeeDashboardContent />
    </div>
  );
}
