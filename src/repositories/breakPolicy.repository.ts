/**
 * @file Break policy repository — data layer for department break schedule management.
 * Each department has at most one break policy with an ordered array of break slots.
 */

import 'server-only';
import prisma from '@/lib/prisma';
import type { BreakPolicyMode, BreakType } from '@prisma/client';

const policySelect = {
  id: true,
  departmentId: true,
  mode: true,
  totalBreakMin: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  department: { select: { id: true, name: true, code: true } },
  breakSlots: {
    select: {
      id: true, name: true, type: true,
      startTime: true, endTime: true,
      durationMin: true, sortOrder: true, isRequired: true,
    },
    orderBy: { sortOrder: 'asc' as const },
  },
} as const;

/**
 * Find break policy for a department.
 */
export async function findByDepartmentId(departmentId: string) {
  return prisma.departmentBreakPolicy.findUnique({
    where: { departmentId },
    select: policySelect,
  });
}

/**
 * Find all break policies (admin overview).
 */
export async function findAll() {
  return prisma.departmentBreakPolicy.findMany({
    select: policySelect,
    orderBy: { department: { name: 'asc' } },
  });
}

/**
 * Upsert department break policy with break slots (replace all slots on update).
 */
export async function upsertPolicy(
  departmentId: string,
  mode: BreakPolicyMode,
  totalBreakMin: number,
  slots: {
    name: string;
    type: BreakType;
    startTime: string;
    endTime: string;
    durationMin: number;
    sortOrder: number;
    isRequired: boolean;
  }[]
) {
  return prisma.$transaction(async (tx) => {
    // Delete existing slots if policy exists
    const existing = await tx.departmentBreakPolicy.findUnique({
      where: { departmentId },
    });

    if (existing) {
      await tx.breakSlot.deleteMany({ where: { policyId: existing.id } });

      return tx.departmentBreakPolicy.update({
        where: { departmentId },
        data: {
          mode,
          totalBreakMin,
          breakSlots: { create: slots },
        },
        select: policySelect,
      });
    }

    return tx.departmentBreakPolicy.create({
      data: {
        departmentId,
        mode,
        totalBreakMin,
        breakSlots: { create: slots },
      },
      select: policySelect,
    });
  });
}
