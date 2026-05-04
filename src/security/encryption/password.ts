/**
 * @file Password hashing and verification using bcrypt.
 */

import 'server-only';
import bcrypt from 'bcryptjs';
import { AUTH } from '@/lib/constants';

/**
 * Hash a plain-text password.
 * @param password - Plain text password
 * @returns Hashed password string
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    return await bcrypt.hash(password, AUTH.BCRYPT_SALT_ROUNDS);
  } catch (error) {
    throw new Error(`Failed to hash password: ${String(error)}`);
  }
}

/**
 * Verify a password against a hash.
 * @param password - Plain text password
 * @param hash - Bcrypt hash to compare against
 * @returns true if password matches
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error(`Failed to verify password: ${String(error)}`);
  }
}
