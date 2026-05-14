/**
 * @file Schedule queries — server-only data fetching for work schedules.
 * Used by Server Components to fetch data securely before rendering.
 */

import 'server-only';
import prisma from '@/lib/prisma';
import * as settingsRepo from '@/repositories/companySettings.repository';

/** Get company default schedule */
export async function getDefaultSchedule() {
  const settings = await settingsRepo.getSettings();
  return {
    workStartTime: settings.defaultWorkStartTime,
    workEndTime: settings.defaultWorkEndTime,
    workDays: settings.defaultWorkDays as number[],
  };
}

/** Get all employees with their schedules for admin view */
export async function getAllEmployeeSchedules(departmentId?: string) {
  const where = departmentId ? { departmentId } : {};

  const employees = await prisma.employee.findMany({
    where: { ...where, employmentStatus: 'ACTIVE' },
    select: {
      id: true,
      employeeId: true,
      position: true,
      user: { select: { firstName: true, lastName: true } },
      department: { select: { name: true } },
      workSchedule: {
        select: {
          workStartTime: true,
          workEndTime: true,
          workDays: true,
          updatedAt: true,
        },
      },
    },
    orderBy: { user: { firstName: 'asc' } },
  });

  const defaults = await getDefaultSchedule();

  return employees.map((emp) => ({
    id: emp.id,
    employeeId: emp.employeeId,
    name: `${emp.user.firstName} ${emp.user.lastName}`,
    position: emp.position,
    department: emp.department.name,
    isCustom: !!emp.workSchedule,
    schedule: emp.workSchedule
      ? {
          workStartTime: emp.workSchedule.workStartTime,
          workEndTime: emp.workSchedule.workEndTime,
          workDays: emp.workSchedule.workDays as number[],
        }
      : defaults,
  }));
}
