/**
 * @file Admin dashboard page — server component wrapper.
 * Provides metadata for SEO and renders the client-side dashboard content.
 * Architecture: Page (server) → AdminDashboardContent (client) → useDashboard (hook) → API → Service → Repository
 */

import type { Metadata } from 'next';
import AdminDashboardContent from '@/components/features/dashboard/AdminDashboardContent';

export const metadata: Metadata = {
  title: 'Admin Dashboard | HR System',
  description:
    'Full oversight of company operations, departments, employees, and strategic HR metrics.',
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Company overview — employees, departments, and operational metrics.
        </p>
      </div>

      {/* Dashboard content (client component with data fetching) */}
      <AdminDashboardContent />
    </div>
  );
}
