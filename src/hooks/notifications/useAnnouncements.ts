/**
 * @file Hook for managing the Announcements system.
 * Provides received/sent announcements, unread stats, send, mark-read, and dropdown data.
 *
 * Design: Separates "received" and "sent" data since they serve different UI views.
 * The dropdown uses separate API calls for recent unread + stats (lightweight).
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AnnouncementItem, SentAnnouncementItem, UnreadStats, CreateAnnouncementPayload } from '@/types/announcement.types';

// ==================== HOOK: Dropdown (Header badge + dropdown) ====================

/**
 * Lightweight hook for the header notification dropdown.
 * Only fetches unread stats + recent items.
 */
export function useAnnouncementDropdown() {
  const [recentUnread, setRecentUnread] = useState<AnnouncementItem[]>([]);
  const [stats, setStats] = useState<UnreadStats>({ unreadToday: 0, unreadTotal: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/announcements/unread-stats');
      const json = await res.json();
      if (json.success) setStats(json.data);
    } catch { /* silent fail */ }
  }, []);

  const fetchRecent = useCallback(async () => {
    try {
      const res = await fetch('/api/announcements/recent');
      const json = await res.json();
      if (json.success) setRecentUnread(json.data);
    } catch { /* silent fail */ }
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchStats(), fetchRecent()]);
    setIsLoading(false);
  }, [fetchStats, fetchRecent]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/announcements/${id}/read`, { method: 'PATCH' });
      setRecentUnread((prev) => prev.filter((a) => a.id !== id));
      setStats((prev) => ({
        unreadToday: Math.max(0, prev.unreadToday - 1),
        unreadTotal: Math.max(0, prev.unreadTotal - 1),
      }));
    } catch { /* silent fail */ }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/announcements/read-all', { method: 'PATCH' });
      setRecentUnread([]);
      setStats({ unreadToday: 0, unreadTotal: 0 });
    } catch { /* silent fail */ }
  };

  return {
    recentUnread,
    stats,
    isLoading,
    markAsRead,
    markAllAsRead,
    refresh,
  };
}

// ==================== HOOK: Full Page ====================

/**
 * Full-featured hook for the announcements page.
 * Manages received announcements, sent announcements, and CRUD operations.
 */
export function useAnnouncements() {
  const [received, setReceived] = useState<{
    items: AnnouncementItem[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } | null>(null);

  const [sent, setSent] = useState<{
    items: SentAnnouncementItem[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Received ──

  const fetchReceived = useCallback(async (page = 1, pageSize = 20) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/announcements?page=${page}&pageSize=${pageSize}`);
      const json = await res.json();
      if (json.success) {
        setReceived(json.data);
      } else {
        setError(json.error ?? 'Failed to fetch announcements');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Sent ──

  const fetchSent = useCallback(async (page = 1, pageSize = 20) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/announcements/sent?page=${page}&pageSize=${pageSize}`);
      const json = await res.json();
      if (json.success) {
        setSent(json.data);
      } else {
        setError(json.error ?? 'Failed to fetch sent announcements');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Initial fetch ──

  useEffect(() => {
    fetchReceived();
  }, [fetchReceived]);

  // ── Actions ──

  const sendAnnouncement = useCallback(async (
    payload: CreateAnnouncementPayload
  ): Promise<{ success: boolean; error?: string; message?: string }> => {
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        fetchSent();
      }
      return json;
    } catch {
      return { success: false, error: 'Failed to send announcement' };
    }
  }, [fetchSent]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await fetch(`/api/announcements/${id}/read`, { method: 'PATCH' });
      setReceived((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((a) =>
            a.id === id ? { ...a, isRead: true, readAt: new Date().toISOString() } : a
          ),
        };
      });
    } catch { /* silent fail */ }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await fetch('/api/announcements/read-all', { method: 'PATCH' });
      setReceived((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((a) => ({
            ...a,
            isRead: true,
            readAt: new Date().toISOString(),
          })),
        };
      });
    } catch { /* silent fail */ }
  }, []);

  return {
    received,
    sent,
    isLoading,
    error,
    fetchReceived,
    fetchSent,
    sendAnnouncement,
    markAsRead,
    markAllAsRead,
  };
}
