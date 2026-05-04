/**
 * @file JWT security operations using jose library.
 * Handles token creation, verification, and decoding.
 */

import 'server-only';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import type { JwtPayload } from '@/types/auth.types';
import { AUTH } from '@/lib/constants';

const getSecretKey = (): Uint8Array => {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }
  return new TextEncoder().encode(secret);
};

/**
 * Create a signed JWT token.
 * @param payload - Data to encode in the token
 * @returns Signed JWT string
 */
export async function createToken(
  payload: Omit<JwtPayload, 'iat' | 'exp'>
): Promise<string> {
  try {
    return await new SignJWT(payload as unknown as JWTPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(AUTH.TOKEN_EXPIRY)
      .sign(getSecretKey());
  } catch (error) {
    throw new Error(`Failed to create JWT token: ${String(error)}`);
  }
}

/**
 * Verify and decode a JWT token.
 * @param token - JWT string to verify
 * @returns Decoded payload or null if invalid
 */
export async function verifyToken(
  token: string
): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ['HS256'],
    });
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Decode a JWT token WITHOUT verification (for debugging only).
 * @param token - JWT string to decode
 * @returns Decoded payload
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf-8')
    );
    return payload as JwtPayload;
  } catch {
    return null;
  }
}
