'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import I18nProvider from '@/i18n/I18nProvider';
import type { Role, Permission } from '@/types/auth.types';

interface DashboardShellProps {
  session: {
    role: Role;
    permissions: Permission[];
    email: string;
    userId: string;
  };
  children: React.ReactNode;
}

/** Derive the base dashboard path from the user's role */
function getBasePath(role: Role): string {
  switch (role) {
    case 'HR_STAFF':
    case 'HR_MANAGER':
      return '/hr';
    case 'COMPANY_ADMIN':
      return '/admin';
    case 'MANAGER':
      return '/manager';
    default:
      return '/employee';
  }
}

/**
 * Client-side dashboard shell — manages sidebar collapse state.
 * Renders Sidebar + Header + content area.
 * Wraps everything with I18nProvider for multi-language support.
 */
export default function DashboardShell({
  session,
  children,
}: DashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const basePath = getBasePath(session.role);

  return (
    <I18nProvider>
      <div className="min-h-screen bg-background">
        <Sidebar
          session={session}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <div
          className="transition-all duration-300"
          style={{
            marginLeft: sidebarCollapsed ? '4.5rem' : '16rem',
          }}
        >
          <Header
            email={session.email}
            basePath={basePath}
          />

          <main className="p-6">
            <div className="animate-fade-in">{children}</div>
          </main>
        </div>
      </div>
    </I18nProvider>
  );
}
