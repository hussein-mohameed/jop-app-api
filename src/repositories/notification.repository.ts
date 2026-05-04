/**
 * @file Notification repository — data layer for notification operations.
 * NO business logic — only Prisma queries.
 *
 * Design: Notifications are created server-side by other services.
 * Users can only read and mark their own notifications.
 */

import 'server-only';
import prisma from '@/lib/prisma';
import type { NotificationType } from '@prisma/client';

// ==================== TYPES ====================

export interface NotificationFilters {
  isRead?: boolean;
  type?: NotificationType;
}

const notificationSelect = {
  id: true, userId: true, title: true, message: true,
  type: true, isRead: true, link: true, metadata: true, createdAt: true,
} as const;

// ==================== QUERIES ====================

export async function findByUserId(
  userId: string, filters: NotificationFilters = {},
  page = 1, pageSize = 20
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { userId };
  if (filters.isRead !== undefined) where.isRead = filters.isRead;
  if (filters.type) where.type = filters.type;

  const skip = (page - 1) * pageSize;
  const [items, total] = await Promise.all([
    prisma.notification.findMany({
      where, select: notificationSelect, skip, take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where }),
  ]);
  return { items, total };
}

export async function create(data: {
  userId: string; title: string; message: string;
  type?: NotificationType; link?: string; metadata?: object;
}) {
  return prisma.notification.create({
    data: { type: 'INFO', ...data },
    select: notificationSelect,
  });
}

export async function createMany(
  notifications: {
    userId: string; title: string; message: string;
    type?: NotificationType; link?: string;
  }[]
) {
  return prisma.notification.createMany({
    data: notifications.map((n) => ({ type: 'INFO' as NotificationType, ...n })),
  });
}

export async function markAsRead(id: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

export async function countUnread(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
}

export async function deleteOld(beforeDate: Date) {
  return prisma.notification.deleteMany({
    where: { createdAt: { lt: beforeDate }, isRead: true },
  });
}
