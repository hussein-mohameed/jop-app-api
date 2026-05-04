'use client';

import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants';

interface HeaderProps {
  email: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Header component with search, notifications, and user menu.
 * UI component only — no business logic.
 */
export default function Header({
  email,
  firstName,
  lastName,
}: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch(ROUTES.API.AUTH.LOGOUT, { method: 'POST' });
    router.push(ROUTES.LOGIN);
  };

  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-md"
      id="main-header"
    >
      {/* Search */}
      <div className="relative max-w-md flex-1">
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg border border-border bg-muted py-2 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30"
          id="header-search"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications bell */}
        <button
          className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="View notifications"
          id="notification-bell"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          {/* Notification badge */}
          <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-danger-500 ring-2 ring-card" />
        </button>

        {/* User menu */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          id="logout-button"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
