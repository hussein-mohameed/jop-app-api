/**
 * @file Application constants.
 * Centralized location for all magic values and configuration constants.
 */

/** Authentication constants */
export const AUTH = {
  SESSION_COOKIE_NAME: 'hr-session',
  TOKEN_EXPIRY: '7d',
  TOKEN_EXPIRY_MS: 7 * 24 * 60 * 60 * 1000,
  BCRYPT_SALT_ROUNDS: 12,
  MIN_PASSWORD_LENGTH: 8,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MS: 15 * 60 * 1000, // 15 minutes
} as const;

/** Pagination defaults */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

/** Rate limiting */
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
  LOGIN_MAX_REQUESTS: 5,
  LOGIN_WINDOW_MS: 15 * 60 * 1000,
} as const;

/** Leave defaults */
export const LEAVE = {
  MAX_DAYS_PER_REQUEST: 30,
  MIN_ADVANCE_NOTICE_DAYS: 1,
} as const;

/** Payroll constants */
export const PAYROLL = {
  MONTHS: [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December',
  ],
} as const;

/** Route paths */
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: {
    EMPLOYEE: '/employee',
    MANAGER: '/manager',
    HR: '/hr',
    ADMIN: '/admin',
  },
  API: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout',
    },
    EMPLOYEES: '/api/employees',
    DEPARTMENTS: '/api/departments',
    DASHBOARD: '/api/dashboard',
  },
} as const;

/** Public routes that don't require authentication */
export const PUBLIC_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
] as const;
