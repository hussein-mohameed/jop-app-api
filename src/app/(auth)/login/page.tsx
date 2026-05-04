'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/auth/useAuth';
import type { LoginFormData } from '@/schemas/auth.schema';

/**
 * Login page — UI only, delegates to useAuth hook.
 */
export default function LoginPage() {
  const { login, isLoading, error } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(formData);
  };

  return (
    <div className="animate-fade-in">
      <h2 className="mb-6 text-xl font-semibold text-white">
        Sign in to your account
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
        {/* Error message */}
        {error && (
          <div
            className="rounded-lg border border-danger-500/30 bg-danger-500/10 px-4 py-3 text-sm text-danger-400"
            role="alert"
            id="login-error"
          >
            {error}
          </div>
        )}

        {/* Email field */}
        <div>
          <label
            htmlFor="login-email"
            className="mb-1.5 block text-sm font-medium text-neutral-300"
          >
            Email address
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-neutral-500 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            placeholder="you@company.com"
          />
        </div>

        {/* Password field */}
        <div>
          <label
            htmlFor="login-password"
            className="mb-1.5 block text-sm font-medium text-neutral-300"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 pr-12 text-white placeholder-neutral-500 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              id="toggle-password"
            >
              {showPassword ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          id="login-submit"
          className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/30 transition-all hover:bg-primary-500 hover:shadow-primary-500/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Signing in...
            </span>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-6 space-y-4 text-center text-sm text-neutral-400">
        <p>
          Don't have an account?{' '}
          <Link href="/register" className="font-medium text-primary-400 hover:text-primary-300 transition-colors">
            Create new account
          </Link>
        </p>
        <p className="text-xs text-neutral-500">
          Contact your HR department if you need access.
        </p>
      </div>
    </div>
  );
}
