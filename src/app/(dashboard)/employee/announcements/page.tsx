/**
 * @file Employee announcements page — view-only.
 *
 * EMPLOYEE features:
 * - View received announcements with priority filters
 * - Mark as read
 * - No send capability
 */

'use client';

import { useState } from 'react';
import { useAnnouncements } from '@/hooks/notifications/useAnnouncements';
import AnnouncementList from '@/components/features/announcements/AnnouncementList';

export default function EmployeeAnnouncementsPage() {
  const {
    received,
    isLoading,
    error,
    fetchReceived,
    markAsRead,
    markAllAsRead,
  } = useAnnouncements();

  const [priorityFilter, setPriorityFilter] = useState<'' | 'NORMAL' | 'CRITICAL'>('');

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Announcements</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Stay updated with the latest company announcements
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-danger-500/30 bg-danger-50 px-4 py-3 text-sm text-danger-700">
          {error}
        </div>
      )}

      {received && (
        <AnnouncementList
          items={received.items}
          total={received.total}
          page={received.page}
          pageSize={received.pageSize}
          totalPages={received.totalPages}
          isLoading={isLoading}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onPageChange={(page) => fetchReceived(page)}
        />
      )}
    </div>
  );
}
