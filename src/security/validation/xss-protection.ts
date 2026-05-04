/**
 * @file XSS protection utilities.
 * Encodes HTML entities to prevent cross-site scripting.
 */

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#96;',
};

const ENTITY_REGEX = /[&<>"'`/]/g;

/**
 * Escape HTML entities in a string to prevent XSS.
 */
export function escapeHtml(input: string): string {
  return input.replace(ENTITY_REGEX, (char) => HTML_ENTITIES[char] ?? char);
}

/**
 * Strip all HTML tags from a string.
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize user-generated content for safe display.
 * Strips HTML and escapes remaining entities.
 */
export function sanitizeContent(input: string): string {
  return escapeHtml(stripHtml(input));
}

/**
 * Check if a string contains potentially malicious script content.
 */
export function containsXss(input: string): boolean {
  const xssPatterns = [
    /<script\b/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:\s*text\/html/i,
    /vbscript:/i,
    /expression\s*\(/i,
  ];

  return xssPatterns.some((pattern) => pattern.test(input));
}
