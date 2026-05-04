/**
 * @file Breakpoint design tokens for the HR Management System.
 * Mobile-first responsive breakpoints.
 */

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/** Container max-widths per breakpoint */
export const containerWidths = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/** Sidebar widths */
export const sidebarWidths = {
  collapsed: '4.5rem',   // 72px — icon only
  expanded: '16rem',     // 256px — full sidebar
} as const;

export type Breakpoints = typeof breakpoints;
