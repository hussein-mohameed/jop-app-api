/**
 * @file NotificationDropdown — header bell icon with dropdown panel.
 *
 * Displays:
 * - Animated bell icon with unread count badge
 * - Dropdown with "Unread today" and "Total unread" stats
 * - Recent unread announcements preview
 * - "View all" link to announcements page
 * - "Mark all as read" action
 *
 * Design: Glassmorphism panel with smooth animations.
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAnnouncementDropdown } from '@/hooks/notifications/useAnnouncements';

interface NotificationDropdownProps {
  basePath: string;
}

export default function NotificationDropdown({ basePath }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const {
    recentUnread,
    stats,
    isLoading,
    markAsRead,
    markAllAsRead,
    refresh,
  } = useAnnouncementDropdown();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Refresh when opened
  useEffect(() => {
    if (isOpen) refresh();
  }, [isOpen, refresh]);

  const handleBellClick = () => setIsOpen(!isOpen);

  const handleViewAll = () => {
    setIsOpen(false);
    router.push(`${basePath}/announcements`);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const handleItemClick = async (id: string) => {
    await markAsRead(id);
  };

  /** Format time for dropdown items */
  function formatTime(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffMin < 1) return 'Now';
    if (diffMin < 60) return `${diffMin}m`;
    if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h`;
    return `${Math.floor(diffMin / 1440)}d`;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={handleBellClick}
        className={`relative rounded-lg p-2 transition-colors ${
          isOpen
            ? 'bg-muted text-foreground'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
        aria-label="View notifications"
        id="notification-bell"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>

        {/* Badge */}
        {stats.unreadTotal > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-danger-500 text-[10px] font-bold text-white ring-2 ring-card">
            {stats.unreadTotal > 99 ? '99+' : stats.unreadTotal}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-96 rounded-xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl animate-slide-down z-50"
          id="notification-dropdown"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-bold text-foreground">Announcements</h3>
            {stats.unreadTotal > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-4 border-b border-border px-4 py-2.5 bg-muted/50">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-danger-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">
                Today: <strong className="text-foreground">{stats.unreadToday}</strong>
              </span>
            </div>
            <div className="h-3 w-px bg-border" />
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-warning-500" />
              <span className="text-xs text-muted-foreground">
                Total unread: <strong className="text-foreground">{stats.unreadTotal}</strong>
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-2 p-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : recentUnread.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <svg
                  className="h-8 w-8 text-muted-foreground/30"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="mt-2 text-xs text-muted-foreground">All caught up!</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {recentUnread.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className="w-full text-left rounded-lg px-3 py-2.5 hover:bg-muted transition-colors group"
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Priority dot */}
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          item.priority === 'CRITICAL'
                            ? 'bg-danger-500 animate-pulse'
                            : 'bg-warning-500'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium text-foreground">
                            {item.title}
                          </p>
                          <span className="shrink-0 text-[10px] text-muted-foreground">
                            {formatTime(item.createdAt)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                          {item.content}
                        </p>
                        <p className="mt-1 text-[10px] text-muted-foreground/70">
                          From {item.sender.firstName} {item.sender.lastName}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-4 py-2.5">
            <button
              onClick={handleViewAll}
              className="w-full rounded-lg py-2 text-center text-xs font-medium text-primary-600 hover:bg-primary-50 transition-colors"
              id="view-all-announcements"
            >
              View all announcements
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
