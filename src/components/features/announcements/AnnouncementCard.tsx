/**
 * @file AnnouncementCard — single announcement display card.
 *
 * Visual design:
 * - CRITICAL priority: red left border + red dot indicator
 * - NORMAL priority: orange/amber left border + amber dot indicator
 * - Unread: slightly highlighted background + colored dot
 * - Read: muted background
 * - Hover: subtle lift + shadow animation
 */

'use client';

import type { AnnouncementItem } from '@/types/announcement.types';

interface AnnouncementCardProps {
  announcement: AnnouncementItem;
  onMarkAsRead?: (id: string) => void;
}

/** Format relative time in Arabic-friendly format */
function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Get target description labels */
function getTargetLabels(targets: AnnouncementItem['targets']): string[] {
  return targets.map((t) => {
    switch (t.targetType) {
      case 'ALL_EMPLOYEES':
        return 'All Employees';
      case 'DEPARTMENT':
        return `Department`;
      case 'SPECIFIC_EMPLOYEES':
        return 'Specific Employee';
      default:
        return 'Unknown';
    }
  });
}

export default function AnnouncementCard({
  announcement,
  onMarkAsRead,
}: AnnouncementCardProps) {
  const isCritical = announcement.priority === 'CRITICAL';
  const isUnread = !announcement.isRead;

  const handleClick = () => {
    if (isUnread && onMarkAsRead) {
      onMarkAsRead(announcement.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        group relative overflow-hidden rounded-xl border transition-all duration-200
        ${isUnread
          ? 'cursor-pointer border-border bg-card shadow-sm hover:shadow-md hover:-translate-y-0.5'
          : 'border-border/60 bg-card/60'
        }
      `}
      role="article"
      id={`announcement-${announcement.id}`}
    >
      {/* Priority indicator — left border strip */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${
          isCritical ? 'bg-danger-500' : 'bg-warning-500'
        }`}
      />

      <div className="px-5 py-4 pl-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Unread dot */}
            {isUnread && (
              <span
                className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${
                  isCritical ? 'bg-danger-500 animate-pulse' : 'bg-warning-500'
                }`}
              />
            )}

            {/* Priority badge */}
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                isCritical
                  ? 'bg-danger-50 text-danger-700'
                  : 'bg-warning-50 text-warning-700'
              }`}
            >
              {isCritical ? (
                <>
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Critical
                </>
              ) : (
                'Normal'
              )}
            </span>

            {/* Title */}
            <h3
              className={`truncate text-sm font-semibold ${
                isUnread ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {announcement.title}
            </h3>
          </div>

          {/* Time */}
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatRelativeTime(announcement.createdAt)}
          </span>
        </div>

        {/* Content */}
        <p
          className={`mt-2 text-sm leading-relaxed ${
            isUnread ? 'text-foreground/80' : 'text-muted-foreground'
          }`}
        >
          {announcement.content.length > 200
            ? `${announcement.content.slice(0, 200)}…`
            : announcement.content}
        </p>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between">
          {/* Sender */}
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
              {announcement.sender.firstName[0]}
            </div>
            <span className="text-xs text-muted-foreground">
              {announcement.sender.firstName} {announcement.sender.lastName}
            </span>
          </div>

          {/* Target tags */}
          <div className="flex items-center gap-1.5">
            {getTargetLabels(announcement.targets).map((label, i) => (
              <span
                key={i}
                className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
