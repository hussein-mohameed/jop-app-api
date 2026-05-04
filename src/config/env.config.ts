/**
 * @file Environment configuration with runtime validation.
 * Ensures all required environment variables are set.
 */

import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().min(1, 'DIRECT_URL is required'),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),

  // Auth
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
  ENCRYPTION_KEY: z.string().min(32, 'ENCRYPTION_KEY must be at least 32 characters').optional(),

  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
});

export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validate and return typed environment configuration.
 * Call this at app startup to fail fast on missing vars.
 */
export function getEnvConfig(): EnvConfig {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const errorMessages = Object.entries(errors)
      .map(([key, msgs]) => `  ${key}: ${(msgs ?? []).join(', ')}`)
      .join('\n');

    throw new Error(
      `❌ Environment variable validation failed:\n${errorMessages}`
    );
  }

  return parsed.data;
}

/** Lazy-loaded env config singleton */
let envConfig: EnvConfig | null = null;

/**
 * Get cached environment configuration.
 */
export function env(): EnvConfig {
  if (!envConfig) {
    envConfig = getEnvConfig();
  }
  return envConfig;
}
