import type { Metadata } from 'next';
import ReportsContent from '@/components/features/reports/ReportsContent';

export const metadata: Metadata = {
  title: 'Reports & Analytics | HR System',
  description: 'Comprehensive overview of company metrics, payroll trends, and department analytics.',
};

export default function AdminReportsPage() {
  return (
    <div className="w-full">
      {/* Interactive Reports Content (Bento Grid) */}
      <ReportsContent />
    </div>
  );
}
