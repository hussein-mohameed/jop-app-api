/**
 * @file useAuth hook — bridge layer for authentication state on the client.
 */

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthUser, Role } from '@/types/auth.types';
import type { LoginFormData, RegisterFormData } from '@/schemas/auth.schema';
import { ROUTES } from '@/lib/constants';
import { ROLE_DASHBOARD_ROUTES } from '@/config/roles.config';

interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * Authentication hook for client components.
 * Orchestrates API calls — contains no business logic.
 */
export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(ROUTES.API.AUTH.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        if (result.error === 'Validation failed' && result.data) {
          const messages = Object.values(result.data).flat().join(', ');
          setError(`Validation failed: ${messages}`);
        } else {
          setError(result.error ?? 'Login failed');
        }
        return;
      }

      setUser(result.data);

      // Redirect to role-appropriate dashboard
      const dashboardRoute =
        ROLE_DASHBOARD_ROUTES[result.data.role as Role] ?? '/employee';
      router.push(dashboardRoute);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const register = useCallback(async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(ROUTES.API.AUTH.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        if (result.error === 'Validation failed' && result.data) {
          const messages = Object.values(result.data).flat().join(', ');
          setError(`Validation failed: ${messages}`);
        } else {
          setError(result.error ?? 'Registration failed');
        }
        return;
      }

      setUser(result.data);

      // Redirect to role-appropriate dashboard
      const dashboardRoute =
        ROLE_DASHBOARD_ROUTES[result.data.role as Role] ?? '/employee';
      router.push(dashboardRoute);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      await fetch(ROUTES.API.AUTH.LOGOUT, { method: 'POST' });
      setUser(null);
      router.push(ROUTES.LOGIN);
    } catch {
      setError('Logout failed');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  return { user, isLoading, error, login, register, logout };
}
