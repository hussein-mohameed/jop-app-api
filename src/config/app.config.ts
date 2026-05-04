/**
 * @file Application-level configuration.
 */

export const APP_CONFIG = {
  name: 'HR Management System',
  shortName: 'HR System',
  description: 'Complete Human Resources Management System',
  version: '1.0.0',

  /** Company defaults (can be overridden per deployment) */
  company: {
    name: 'Company',
    currency: 'USD',
    locale: 'en-US',
    timezone: 'UTC',
    dateFormat: 'yyyy-MM-dd',
    timeFormat: 'HH:mm',
  },

  /** Supported languages */
  languages: [
    { code: 'en', name: 'English', dir: 'ltr' as const },
    { code: 'ar', name: 'العربية', dir: 'rtl' as const },
  ],

  /** Default pagination */
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
  },
} as const;

export type AppConfig = typeof APP_CONFIG;
