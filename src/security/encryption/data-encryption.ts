/**
 * @file Data encryption for sensitive fields (e.g., salary data).
 * Uses AES-256-GCM via Web Crypto API for compatibility.
 */

import 'server-only';

const ALGORITHM = 'AES-GCM';
const IV_LENGTH = 12;

/**
 * Get the encryption key from environment.
 */
async function getKey(): Promise<CryptoKey> {
  const keyString = process.env.ENCRYPTION_KEY;
  if (!keyString) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }

  const keyData = new TextEncoder().encode(keyString.slice(0, 32));
  return crypto.subtle.importKey('raw', keyData, { name: ALGORITHM }, false, [
    'encrypt',
    'decrypt',
  ]);
}

/**
 * Encrypt sensitive data.
 * @param data - Plain text to encrypt
 * @returns Base64-encoded encrypted string (iv:ciphertext)
 */
export async function encryptData(data: string): Promise<string> {
  try {
    const key = await getKey();
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encoded = new TextEncoder().encode(data);

    const ciphertext = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv },
      key,
      encoded
    );

    const ivHex = Buffer.from(iv).toString('hex');
    const ctHex = Buffer.from(ciphertext).toString('hex');
    return `${ivHex}:${ctHex}`;
  } catch (error) {
    throw new Error(`Encryption failed: ${String(error)}`);
  }
}

/**
 * Decrypt sensitive data.
 * @param encrypted - Base64-encoded encrypted string (iv:ciphertext)
 * @returns Decrypted plain text
 */
export async function decryptData(encrypted: string): Promise<string> {
  try {
    const [ivHex, ctHex] = encrypted.split(':');
    if (!ivHex || !ctHex) {
      throw new Error('Invalid encrypted data format');
    }

    const key = await getKey();
    const iv = Buffer.from(ivHex, 'hex');
    const ciphertext = Buffer.from(ctHex, 'hex');

    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      ciphertext
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    throw new Error(`Decryption failed: ${String(error)}`);
  }
}
