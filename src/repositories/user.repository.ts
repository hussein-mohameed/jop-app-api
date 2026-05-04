/**
 * @file User repository — data layer for user operations.
 * All database access for users goes through this repository.
 */

import 'server-only';
import prisma from '@/lib/prisma';
import type { UserRole } from '@prisma/client';

/** User data returned from repository (no password hash) */
export interface UserRecord {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl: string | null;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Full user record including password hash (for auth only) */
export interface UserWithPassword extends UserRecord {
  passwordHash: string;
}

/**
 * Find a user by email address.
 */
export async function findByEmail(
  email: string
): Promise<UserWithPassword | null> {
  try {
    return await prisma.user.findUnique({
      where: { email },
    });
  } catch (error) {
    throw new Error(`Failed to find user by email: ${String(error)}`);
  }
}

/**
 * Find a user by ID.
 */
export async function findById(id: string): Promise<UserRecord | null> {
  try {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch (error) {
    throw new Error(`Failed to find user by ID: ${String(error)}`);
  }
}

/**
 * Find a user by ID with their employee details.
 */
export async function findByIdWithEmployee(id: string) {
  try {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true,
        isActive: true,
        employee: {
          select: {
            id: true,
            employeeId: true,
            departmentId: true,
            position: true,
            department: {
              select: { name: true },
            },
          },
        },
      },
    });
  } catch (error) {
    throw new Error(`Failed to find user with employee: ${String(error)}`);
  }
}

/**
 * Create a new user.
 */
export async function create(data: {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}): Promise<UserRecord> {
  try {
    return await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role ?? 'EMPLOYEE',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch (error) {
    throw new Error(`Failed to create user: ${String(error)}`);
  }
}

/**
 * Update last login timestamp.
 */
export async function updateLastLogin(id: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  } catch (error) {
    throw new Error(`Failed to update last login: ${String(error)}`);
  }
}

/**
 * Check if an email is already registered.
 */
export async function emailExists(email: string): Promise<boolean> {
  try {
    const count = await prisma.user.count({ where: { email } });
    return count > 0;
  } catch (error) {
    throw new Error(`Failed to check email existence: ${String(error)}`);
  }
}
