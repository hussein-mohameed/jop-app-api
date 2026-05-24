/**
 * @file Admin announcements page — full announcement management.
 *
 * COMPANY_ADMIN features:
 * - View received announcements with priority filters
 * - View sent announcements with read stats
 * - Send new announcements to anyone (all employees / departments / specific)
 * - Tab navigation between Received and Sent
 */

'use client';

import { useState, useCallback } from 'react';
import { useAnnouncements } from '@/hooks/notifications/useAnnouncements';
import AnnouncementList from '@/components/features/announcements/AnnouncementList';
import SendAnnouncementModal from '@/components/features/announcements/SendAnnouncementModal';
import type { SentAnnouncementItem } from '@/types/announcement.types';

type TabMode = 'received' | 'sent';

export default function AdminAnnouncementsPage() {
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
    if (tab === 'sent' && !sent) {
      fetchSent();
    }
  }, [sent, fetchSent]);

  const handlePageChange = useCallback((page: number) => {
    if (activeTab === 'received') {
      fetchReceived(page);
    } else {
      fetchSent(page);
    }
  }, [activeTab, fetchReceived, fetchSent]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sentItems = (sent?.items ?? []) as SentAnnouncementItem[];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Announcements</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Send announcements to employees and manage your notifications
          </p>
        </div>
        <button
          onClick={() => setShowSendModal(true)}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-700 transition-colors"
          id="new-announcement-btn"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
          New Announcement
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Total Received</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{received?.total ?? 0}</p>
        </div>
        <div className="rounded-xl border border-danger-500/20 bg-card px-5 py-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-danger-500 animate-pulse" />
            <p className="text-sm font-medium text-muted-foreground">Unread</p>
          </div>
          <p className="mt-1 text-2xl font-bold text-danger-600">
            {received?.items.filter((a) => !a.isRead).length ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Total Sent</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{sent?.total ?? '—'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {(['received', 'sent'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'text-primary-600'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            id={`tab-${tab}`}
          >
            {tab === 'received' ? 'Received' : 'Sent'}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t bg-primary-600" />
            )}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-danger-500/30 bg-danger-50 px-4 py-3 text-sm text-danger-700">
          {error}
        </div>
      )}

      {/* Content */}
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
          onPageChange={handlePageChange}
        />
      )}

      {activeTab === 'sent' && (
        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-xl border border-border bg-card animate-pulse" />
              ))}
            </div>
          ) : sentItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16">
              <svg className="h-12 w-12 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
              <p className="mt-3 text-sm font-medium text-muted-foreground">No announcements sent yet</p>
            </div>
          ) : (
            sentItems.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-border bg-card px-5 py-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          item.priority === 'CRITICAL'
                            ? 'bg-danger-50 text-danger-700'
                            : 'bg-warning-50 text-warning-700'
                        }`}
                      >
                        {item.priority}
                      </span>
                      <h3 className="truncate text-sm font-semibold text-foreground">{item.title}</h3>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{item.content}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                    {item.recipientCount} recipients
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {item.readCount} read
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Send Modal */}
      <SendAnnouncementModal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        onSubmit={sendAnnouncement}
        canSendToAll={true}
      />
    </div>
  );
}
