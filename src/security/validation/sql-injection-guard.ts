/**
 * @file SQL injection guard.
 * Additional protection layer — Prisma already parameterizes queries,
 * but this guards against raw query usage.
 */

/** Characters that should never appear in identifiers */
const DANGEROUS_PATTERNS = [
  /;\s*DROP\s+/i,
  /;\s*DELETE\s+/i,
  /;\s*UPDATE\s+/i,
  /;\s*INSERT\s+/i,
  /UNION\s+SELECT/i,
  /--/,
  /\/\*/,
  /\*\//,
  /xp_/i,
  /EXEC\s*\(/i,
];

/**
 * Check if input contains SQL injection patterns.
 * @param input - String to check
 * @returns true if suspicious patterns detected
 */
export function containsSqlInjection(input: string): boolean {
  return DANGEROUS_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * Validate a sort field to prevent SQL injection via ORDER BY.
 * Only allows alphanumeric characters and underscores.
 */
export function validateSortField(field: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field);
}

/**
 * Sanitize a value for use in Prisma raw queries (when absolutely necessary).
 */
export function sanitizeForRawQuery(input: string): string {
  return input.replace(/['";\\]/g, '');
}
