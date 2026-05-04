/**
 * @file Audit repository — data layer for audit log operations.
 * NO business logic — only Prisma queries.
 */

import 'server-only';
import prisma from '@/lib/prisma';
import type { AuditAction } from '@prisma/client';

// ==================== TYPES ====================

export interface AuditFilters {
  userId?: string;
  action?: AuditAction;
  entity?: string;
  entityId?: string;
}

// ==================== MUTATIONS ====================

export async function create(data: {
  userId?: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  metadata?: object;
  ipAddress?: string;
  userAgent?: string;
}) {
  return prisma.auditLog.create({ data });
}

// ==================== QUERIES ====================

export async function findMany(
  filters: AuditFilters = {},
  page = 1,
  pageSize = 20
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (filters.userId) where.userId = filters.userId;
  if (filters.action) where.action = filters.action;
  if (filters.entity) where.entity = filters.entity;
  if (filters.entityId) where.entityId = filters.entityId;

  const skip = (page - 1) * pageSize;
  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.auditLog.count({ where }),
  ]);
  return { items, total };
}
