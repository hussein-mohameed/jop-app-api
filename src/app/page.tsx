import { redirect } from 'next/navigation';
import { getSession } from '@/security/auth/session.security';
import { ROLE_DASHBOARD_ROUTES } from '@/config/roles.config';
import type { Role } from '@/types/auth.types';

/**
 * Root page — redirects to login or dashboard based on auth state.
 */
export default async function RootPage() {
  const session = await getSession();

  if (session) {
    const dashboardRoute =
      ROLE_DASHBOARD_ROUTES[session.role as Role] ?? '/employee';
    redirect(dashboardRoute);
  }

  redirect('/login');
}
