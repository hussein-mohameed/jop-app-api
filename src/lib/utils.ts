/**
 * @file General utility functions.
 * Shared utilities used across the application.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with conflict resolution.
 * Combines clsx for conditional classes and tailwind-merge for deduplication.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a date to a human-readable string.
 */
export function formatDate(date: Date | string, locale = 'en-US'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format currency value.
 */
export function formatCurrency(
  amount: number,
  currency = 'USD',
  locale = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Generate a unique employee ID (e.g., EMP-00001).
 */
export function generateEmployeeId(sequence: number): string {
  return `EMP-${String(sequence).padStart(5, '0')}`;
}

/**
 * Sleep for a given number of milliseconds.
 * Useful for rate limiting and testing.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Safely parse JSON with a fallback.
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Get initials from a full name (e.g., "John Doe" → "JD").
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Truncate a string to a given length with ellipsis.
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

/**
 * Generate a cryptographically secure random password.
 * Guarantees at least 1 uppercase, 1 lowercase, 1 digit, and 1 special char.
 * Uses crypto.getRandomValues for true randomness.
 *
 * @param length Password length (minimum 12, default 16)
 * @returns Secure random password string
 */
export function generateSecurePassword(length = 16): string {
  const safeLength = Math.max(length, 12);

  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';     // No I, O (ambiguous)
  const lower = 'abcdefghjkmnpqrstuvwxyz';       // No i, l, o (ambiguous)
  const digits = '23456789';                      // No 0, 1 (ambiguous)
  const special = '@#$%&*!?+-=';
  const all = upper + lower + digits + special;

  const randomChar = (charset: string): string => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return charset[array[0] % charset.length];
  };

  // Guarantee at least one of each required type
  const mandatory = [
    randomChar(upper),
    randomChar(lower),
    randomChar(digits),
    randomChar(special),
  ];

  // Fill remaining with random characters from the full set
  const remaining = Array.from({ length: safeLength - mandatory.length }, () =>
    randomChar(all)
  );

  // Shuffle to avoid predictable positions
  const chars = [...mandatory, ...remaining];
  for (let i = chars.length - 1; i > 0; i--) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const j = array[0] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}
