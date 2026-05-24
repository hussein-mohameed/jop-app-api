/**
 * @file AnnouncementList — displays paginated list of received announcements.
 *
 * Features:
 * - Loading skeleton animation
 * - Empty state with icon
 * - Priority filter tabs
 * - Mark all as read button
 */

'use client';

import type { AnnouncementItem } from '@/types/announcement.types';
import AnnouncementCard from './AnnouncementCard';
import Pagination from '@/components/ui/Pagination';

interface AnnouncementListProps {
  items: AnnouncementItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading: boolean;
  priorityFilter: '' | 'NORMAL' | 'CRITICAL';
  onPriorityChange: (priority: '' | 'NORMAL' | 'CRITICAL') => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onPageChange: (page: number) => void;
}

/** Loading skeleton */
function Skeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-28 rounded-xl border border-border bg-card animate-pulse"
        >
          <div className="px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-muted" />
              <div className="h-4 w-16 rounded bg-muted" />
              <div className="h-4 w-48 rounded bg-muted" />
            </div>
            <div className="mt-3 h-3 w-3/4 rounded bg-muted" />
            <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Empty state */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16">
      <svg
        className="h-12 w-12 text-muted-foreground/40"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
        />
      </svg>
      <p className="mt-3 text-sm font-medium text-muted-foreground">
        No announcements yet
      </p>
      <p className="mt-1 text-xs text-muted-foreground/70">
        New announcements from managers will appear here
      </p>
    </div>
  );
}

const priorityTabs = [
  { value: '' as const, label: 'All' },
  { value: 'CRITICAL' as const, label: 'Critical', color: 'text-danger-600' },
  { value: 'NORMAL' as const, label: 'Normal', color: 'text-warning-600' },
];

export default function AnnouncementList({
  items,
  total,
  page,
  pageSize,
  totalPages,
  isLoading,
  priorityFilter,
  onPriorityChange,
  onMarkAsRead,
  onMarkAllAsRead,
  onPageChange,
}: AnnouncementListProps) {
  const hasUnread = items.some((a) => !a.isRead);

  if (isLoading) return <Skeleton />;

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center justify-between">
        {/* Priority tabs */}
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
          {priorityTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onPriorityChange(tab.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                priorityFilter === tab.value
                  ? 'bg-card text-foreground shadow-sm'
                  : `text-muted-foreground hover:text-foreground ${tab.color ?? ''}`
              }`}
              id={`filter-priority-${tab.value || 'all'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Mark all as read */}
        {hasUnread && (
          <button
            onClick={onMarkAllAsRead}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50 transition-colors"
            id="mark-all-read-btn"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Mark all as read
          </button>
        )}
      </div>

      {/* Announcement list */}
      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {items.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              onMarkAsRead={onMarkAsRead}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
