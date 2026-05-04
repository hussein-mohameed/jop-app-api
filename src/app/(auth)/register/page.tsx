'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/auth/useAuth';
import type { RegisterFormData } from '@/schemas/auth.schema';

/**
 * Register page — UI only, delegates to useAuth hook.
 */
export default function RegisterPage() {
  const { register, isLoading, error } = useAuth();
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setValidationError('Password must be at least 8 characters');
      return;
    }

    await register(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="animate-fade-in">
      <h2 className="mb-6 text-xl font-semibold text-white">
        Create new account
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4" id="register-form">
        {/* Error message */}
        {(error || validationError) && (
          <div
            className="rounded-lg border border-danger-500/30 bg-danger-500/10 px-4 py-3 text-sm text-danger-400"
            role="alert"
            id="register-error"
          >
            {error || validationError}
          </div>
        )}

        {/* Name fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="register-firstname"
              className="mb-1.5 block text-sm font-medium text-neutral-300"
            >
              First name
            </label>
            <input
              id="register-firstname"
              name="firstName"
              type="text"
              required
              value={formData.firstName}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-neutral-500 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              placeholder="John"
            />
          </div>
          <div>
            <label
              htmlFor="register-lastname"
              className="mb-1.5 block text-sm font-medium text-neutral-300"
            >
              Last name
            </label>
            <input
              id="register-lastname"
              name="lastName"
              type="text"
              required
              value={formData.lastName}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-neutral-500 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              placeholder="Doe"
            />
          </div>
        </div>

        {/* Email field */}
        <div>
          <label
            htmlFor="register-email"
            className="mb-1.5 block text-sm font-medium text-neutral-300"
          >
            Email address
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-neutral-500 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            placeholder="you@company.com"
          />
        </div>

        {/* Password field */}
        <div>
          <label
            htmlFor="register-password"
            className="mb-1.5 block text-sm font-medium text-neutral-300"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="register-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 pr-12 text-white placeholder-neutral-500 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              placeholder="Create a strong password"
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

        {/* Confirm Password field */}
        <div>
          <label
            htmlFor="register-confirm-password"
            className="mb-1.5 block text-sm font-medium text-neutral-300"
          >
            Confirm Password
          </label>
          <input
            id="register-confirm-password"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-neutral-500 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            placeholder="Confirm your password"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          id="register-submit"
          className="mt-2 w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/30 transition-all hover:bg-primary-500 hover:shadow-primary-500/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating account...
            </span>
          ) : (
            'Create account'
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-6 text-center text-sm text-neutral-400">
        <p>
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary-400 hover:text-primary-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
