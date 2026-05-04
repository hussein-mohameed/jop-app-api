/**
 * @file Auth controller — bridge between API routes and auth service.
 * Handles request parsing, validation, and response formatting.
 */

import 'server-only';
import * as authService from '@/services/auth/auth.service';
import { loginSchema, registerSchema } from '@/schemas/auth.schema';
import { sanitizeEmail } from '@/security/validation/input-sanitizer';
import { containsXss } from '@/security/validation/xss-protection';
import { checkRateLimit, rateLimitResponse } from '@/security/rate-limiting/rate-limiter';
import { getClientIp } from '@/security/middleware/auth.middleware';
import type { ApiResponse } from '@/types/common.types';
import type { AuthUser } from '@/types/auth.types';
import { Role } from '@/types/auth.types';

/**
 * Handle login request.
 */
export async function handleLogin(
  request: Request
): Promise<Response> {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetAt);
    }

    // Parse body
    const body = await request.json();

    // XSS check
    if (containsXss(body.email ?? '') || containsXss(body.password ?? '')) {
      return Response.json(
        { success: false, error: 'Invalid input detected' },
        { status: 400 }
      );
    }

    // Validate with Zod
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return Response.json(
        {
          success: false,
          error: 'Validation failed',
          data: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Sanitize
    const email = sanitizeEmail(validation.data.email);

    // Call service
    const result = await authService.login({
      email,
      password: validation.data.password,
    });

    if (!result.success) {
      return Response.json(result, { status: 401 });
    }

    return Response.json(result, { status: 200 });
  } catch (error) {
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle registration request.
 */
export async function handleRegister(
  request: Request
): Promise<Response> {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`register:${ip}`, 3, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetAt);
    }

    // Parse body
    const body = await request.json();

    // XSS check
    const stringValues = Object.values(body).filter(
      (v): v is string => typeof v === 'string'
    );
    if (stringValues.some(containsXss)) {
      return Response.json(
        { success: false, error: 'Invalid input detected' },
        { status: 400 }
      );
    }

    // Validate with Zod
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return Response.json(
        {
          success: false,
          error: 'Validation failed',
          data: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Call service
    const result = await authService.register({
      email: sanitizeEmail(validation.data.email),
      password: validation.data.password,
      firstName: validation.data.firstName,
      lastName: validation.data.lastName,
      role: Role.EMPLOYEE,
    });

    if (!result.success) {
      return Response.json(result, { status: 400 });
    }

    return Response.json(result, { status: 201 });
  } catch (error) {
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle logout request.
 */
export async function handleLogout(): Promise<Response> {
  try {
    const result = await authService.logout();
    return Response.json(result, { status: 200 });
  } catch (error) {
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
