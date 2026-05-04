/**
 * @file Input sanitization utilities.
 * Cleans user input to prevent injection attacks.
 */

/**
 * Sanitize a string input by trimming and removing null bytes.
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/\0/g, '')       // Remove null bytes
    .replace(/\r\n/g, '\n');  // Normalize line endings
}

/**
 * Sanitize an object's string values recursively.
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T
): T {
  const sanitized = { ...obj };

  for (const key of Object.keys(sanitized)) {
    const value = sanitized[key];
    if (typeof value === 'string') {
      (sanitized as Record<string, unknown>)[key] = sanitizeString(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      (sanitized as Record<string, unknown>)[key] = sanitizeObject(
        value as Record<string, unknown>
      );
    }
  }

  return sanitized;
}

/**
 * Validate and sanitize an email address.
 */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Remove potentially dangerous characters from file names.
 */
export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}
