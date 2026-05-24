/**
 * @file HR announcements page — view announcements.
 *
 * HR_STAFF / HR_MANAGER features:
 * - View received announcements with priority filters
 * - Mark as read
 * - HR_MANAGER can also send announcements
 */

'use client';

import { useState, useCallback } from 'react';
import { useAnnouncements } from '@/hooks/notifications/useAnnouncements';
import AnnouncementList from '@/components/features/announcements/AnnouncementList';
import SendAnnouncementModal from '@/components/features/announcements/SendAnnouncementModal';
import type { SentAnnouncementItem } from '@/types/announcement.types';

type TabMode = 'received' | 'sent';

export default function HRAnnouncementsPage() {
  const {
    received,
    sent,
    isLoading,
    error,
    fetchReceived,
    fetchSent,
    sendAnnouncement,
    markAsRead,
    markAllAsRead,
  } = useAnnouncements();

  const [activeTab, setActiveTab] = useState<TabMode>('received');
  const [priorityFilter, setPriorityFilter] = useState<'' | 'NORMAL' | 'CRITICAL'>('');
  const [showSendModal, setShowSendModal] = useState(false);

  const handleTabChange = useCallback((tab: TabMode) => {
    setActiveTab(tab);
    if (tab === 'sent' && !sent) fetchSent();
  }, [sent, fetchSent]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sentItems = (sent?.items ?? []) as SentAnnouncementItem[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Announcements</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View and manage company announcements
          </p>
        </div>
        <button
          onClick={() => setShowSendModal(true)}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
          New Announcement
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {(['received', 'sent'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab ? 'text-primary-600' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'received' ? 'Received' : 'Sent'}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t bg-primary-600" />
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-danger-500/30 bg-danger-50 px-4 py-3 text-sm text-danger-700">
          {error}
        </div>
      )}

      {activeTab === 'received' && received && (
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

      {activeTab === 'sent' && (
        <div className="space-y-3">
          {sentItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16">
              <p className="text-sm font-medium text-muted-foreground">No announcements sent yet</p>
            </div>
          ) : (
            sentItems.map((item) => (
              <div key={item.id} className="rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    item.priority === 'CRITICAL' ? 'bg-danger-50 text-danger-700' : 'bg-warning-50 text-warning-700'
                  }`}>
                    {item.priority}
                  </span>
                  <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.content}</p>
                <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                  <span>{item.recipientCount} recipients</span>
                  <span>{item.readCount} read</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <SendAnnouncementModal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        onSubmit={sendAnnouncement}
        canSendToAll={false}
      />
    </div>
  );
}
