/**
 * @file Animation design tokens for the HR Management System.
 * Defines reusable transitions and keyframe references.
 */

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: '500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

export const durations = {
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
  slower: '500ms',
} as const;

export const easings = {
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

/** CSS keyframe animation names (defined in globals.css) */
export const keyframes = {
  fadeIn: 'fadeIn',
  fadeOut: 'fadeOut',
  slideUp: 'slideUp',
  slideDown: 'slideDown',
  slideInLeft: 'slideInLeft',
  slideInRight: 'slideInRight',
  scaleIn: 'scaleIn',
  spin: 'spin',
  pulse: 'pulse',
  shimmer: 'shimmer',
} as const;

export type Transitions = typeof transitions;
export type Keyframes = typeof keyframes;
