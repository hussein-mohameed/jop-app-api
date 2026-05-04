/**
 * @file Common type definitions shared across the application.
 */

/** Standard API response wrapper */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/** Paginated response */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Pagination params */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/** Sort params */
export interface SortParams {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

/** Filter operator */
export type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in';

/** Generic filter */
export interface Filter {
  field: string;
  operator: FilterOperator;
  value: string | number | boolean | string[];
}

/** Base entity with audit fields */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Approval status used across multiple modules */
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

/** Audit action types */
export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'APPROVE'
  | 'REJECT'
  | 'VIEW'
  | 'EXPORT';

/** Notification type */
export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

/** Select option for dropdowns */
export interface SelectOption {
  label: string;
  value: string;
}

/** Date range filter */
export interface DateRange {
  from: Date;
  to: Date;
}
