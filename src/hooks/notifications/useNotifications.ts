/**
 * @file Hook for managing Notifications data.
 * Provides notification list, mark-as-read, and unread count for badge display.
 */

import { useState, useEffect, useCallback } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  isRead: boolean;
  link?: string;
  createdAt: Date;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/notifications?pageSize=50');
      const json = await res.json();
      if (json.success && json.data?.items) {
        setNotifications(json.data.items.map(mapApiNotification));
      }
    } catch { /* silent fail */ }
    finally { setIsLoading(false); }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications/count');
      const json = await res.json();
      if (json.success) setUnreadCount(json.data.count);
    } catch { /* silent fail */ }
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch { /* silent fail */ }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* silent fail */ }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiNotification(item: any): Notification {
  return {
    id: item.id,
    title: item.title,
    message: item.message,
    type: item.type,
    isRead: item.isRead,
    link: item.link ?? undefined,
    createdAt: new Date(item.createdAt),
  };
}
