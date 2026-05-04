import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Employees | HR System',
  description:
    'Manage all employees — view, add, edit, and change employee statuses across the company.',
};

/**
 * Employees section layout — provides metadata for SEO.
 * The actual employees page is a client component inside page.tsx.
 */
export default function EmployeesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
