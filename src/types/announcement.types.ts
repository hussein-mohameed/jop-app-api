/**
 * @file Announcement type definitions.
 * Used across backend and frontend for the manual notification/announcement system.
 */

/** Priority level — determines visual styling */
export type AnnouncementPriority = 'NORMAL' | 'CRITICAL';

/** Target audience type */
export type AnnouncementTargetType = 'ALL_EMPLOYEES' | 'DEPARTMENT' | 'SPECIFIC_EMPLOYEES';

/** Single targeting rule (used in create payload) */
export interface AnnouncementTargetInput {
  type: AnnouncementTargetType;
  departmentId?: string;
  employeeId?: string;
}

/** Target as stored in DB (includes id) */
export interface AnnouncementTarget {
  id: string;
  targetType: AnnouncementTargetType;
  departmentId?: string | null;
  employeeId?: string | null;
}

/** Sender info (safe to expose) */
export interface AnnouncementSender {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

/** Full announcement as returned to recipient */
export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  sender: AnnouncementSender;
  targets: AnnouncementTarget[];
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

/** Announcement as returned to sender (includes recipient stats) */
export interface SentAnnouncementItem {
  id: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  targets: AnnouncementTarget[];
  recipientCount: number;
  readCount: number;
  createdAt: string;
}

/** Unread statistics for badge/dropdown display */
export interface UnreadStats {
  unreadToday: number;
  unreadTotal: number;
}

/** Create announcement request body */
export interface CreateAnnouncementPayload {
  title: string;
  content: string;
  priority: AnnouncementPriority;
  targets: AnnouncementTargetInput[];
}
