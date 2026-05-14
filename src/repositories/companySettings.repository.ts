/**
 * @file Company settings repository — data layer for global company configuration.
 * Uses a singleton pattern: always upserts to ensure exactly one settings row exists.
 */

import 'server-only';
import prisma from '@/lib/prisma';

const settingsSelect = {
  id: true,
  companyName: true,
  salaryDaySystem: true,
  defaultVacationDays: true,
  workingHoursPerDay: true,
  lateGraceMinutes: true,
  overtimeMultiplier: true,
  disciplineSteps: true,
  defaultWorkStartTime: true,
  defaultWorkEndTime: true,
  defaultWorkDays: true,
  createdAt: true,
  updatedAt: true,
} as const;

/**
 * Get or create the company settings singleton.
 */
export async function getSettings() {
  let settings = await prisma.companySettings.findFirst({
    select: settingsSelect,
  });

  if (!settings) {
    settings = await prisma.companySettings.create({
      data: {},
      select: settingsSelect,
    });
  }

  return settings;
}

/**
 * Update company settings.
 */
export async function updateSettings(data: {
  companyName?: string;
  salaryDaySystem?: number;
  defaultVacationDays?: number;
  workingHoursPerDay?: number;
  lateGraceMinutes?: number;
  overtimeMultiplier?: number;
  disciplineSteps?: object;
  defaultWorkStartTime?: string;
  defaultWorkEndTime?: string;
  defaultWorkDays?: number[];
}) {
  const existing = await getSettings();
  return prisma.companySettings.update({
    where: { id: existing.id },
    data,
    select: settingsSelect,
  });
}
