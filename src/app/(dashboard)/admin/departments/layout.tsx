import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Departments | HR System',
  description:
    'Manage company departments — create, edit, and control department status.',
};

/**
 * Departments section layout — provides metadata for SEO.
 */
export default function DepartmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
