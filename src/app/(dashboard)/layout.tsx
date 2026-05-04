import { redirect } from 'next/navigation';
import { getSession } from '@/security/auth/session.security';
import type { Role, Permission } from '@/types/auth.types';
import DashboardShell from './DashboardShell';

/**
 * Dashboard layout — requires authentication.
 * Provides sidebar + header shell for all dashboard pages.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const sessionData = {
    role: session.role as Role,
    permissions: session.permissions as Permission[],
    email: session.email,
    userId: session.sub,
  };

  return (
    <DashboardShell session={sessionData}>
      {children}
    </DashboardShell>
  );
}
