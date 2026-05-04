/**
 * @file Authentication service — business logic for auth operations.
 */

import 'server-only';
import * as userRepository from '@/repositories/user.repository';
import { hashPassword, verifyPassword } from '@/security/encryption/password';
import { createSession, deleteSession } from '@/security/auth/session.security';
import { ROLE_PERMISSIONS } from '@/config/roles.config';
import { Role } from '@/types/auth.types';
import type { AuthUser, LoginRequest, RegisterRequest } from '@/types/auth.types';
import type { ApiResponse } from '@/types/common.types';

/**
 * Authenticate a user with email and password.
 */
export async function login(
  data: LoginRequest
): Promise<ApiResponse<AuthUser>> {
  try {
    // Find user by email
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Check if account is active
    if (!user.isActive) {
      return { success: false, error: 'Account is deactivated. Contact HR.' };
    }

    // Verify password
    const isValid = await verifyPassword(data.password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Get user with employee details for department
    const userWithEmployee = await userRepository.findByIdWithEmployee(user.id);
    const departmentId = userWithEmployee?.employee?.departmentId;

    // Resolve permissions for user's role
    const role = user.role as Role;
    const permissions = ROLE_PERMISSIONS[role] ?? [];

    // Create session
    await createSession({
      userId: user.id,
      email: user.email,
      role,
      departmentId,
      permissions,
    });

    // Update last login
    await userRepository.updateLastLogin(user.id);

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role,
      departmentId,
      departmentName: userWithEmployee?.employee?.department?.name,
      avatarUrl: user.avatarUrl ?? undefined,
    };

    return { success: true, data: authUser };
  } catch (error) {
    return { success: false, error: `Login failed: ${String(error)}` };
  }
}

/**
 * Register a new user account.
 */
export async function register(
  data: RegisterRequest
): Promise<ApiResponse<AuthUser>> {
  try {
    // Check duplicate email
    const exists = await userRepository.emailExists(data.email);
    if (exists) {
      return { success: false, error: 'Email is already registered' };
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await userRepository.create({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role as string as import('@prisma/client').UserRole,
    });

    const role = user.role as Role;
    const permissions = ROLE_PERMISSIONS[role] ?? [];

    // Create session
    await createSession({
      userId: user.id,
      email: user.email,
      role,
      permissions,
    });

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role,
      avatarUrl: user.avatarUrl ?? undefined,
    };

    return { success: true, data: authUser };
  } catch (error) {
    return { success: false, error: `Registration failed: ${String(error)}` };
  }
}

/**
 * Logout the current user.
 */
export async function logout(): Promise<ApiResponse> {
  try {
    await deleteSession();
    return { success: true, message: 'Logged out successfully' };
  } catch (error) {
    return { success: false, error: `Logout failed: ${String(error)}` };
  }
}
