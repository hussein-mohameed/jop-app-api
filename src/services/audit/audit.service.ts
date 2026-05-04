/**
 * @file Audit service — reusable helper for logging audit trail entries.
 * Imported by controllers to log mutations after successful operations.
 * Fire-and-forget — audit failures should never block the main operation.
 */

import 'server-only';
import * as auditRepo from '@/repositories/audit.repository';
import type { AuditAction } from '@prisma/client';

/**
 * Log an audit trail entry. Failures are silently caught.
 */
export async function logAudit(data: {
  userId?: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  metadata?: object;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  try {
    await auditRepo.create(data);
  } catch {
    // Audit logging should never break the main flow
    console.error('[AuditService] Failed to log audit entry:', data);
  }
}
