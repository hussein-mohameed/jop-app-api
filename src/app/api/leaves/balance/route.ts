/**
 * @file Leave balance adjustment API route.
 * PUT /api/leaves/balance → HR adjusts employee vacation days
 */

import { requireAuth } from '@/security/middleware/auth.middleware';
import { apiPermissionGuard } from '@/security/rbac/permission.guard';
import { Permission } from '@/types/auth.types';
import prisma from '@/lib/prisma';

export async function PUT(request: Request): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.VIEW_ALL_LEAVES);
    if (guard) return guard;

    const body = await request.json();
    const { employeeId, leaveTypeId, year, totalDays } = body;

    if (!employeeId || !leaveTypeId || !year || totalDays === undefined) {
      return Response.json(
        { success: false, error: 'Missing required fields: employeeId, leaveTypeId, year, totalDays' },
        { status: 400 }
      );
    }

    if (typeof totalDays !== 'number' || totalDays < 0 || totalDays > 365) {
      return Response.json(
        { success: false, error: 'totalDays must be a number between 0 and 365' },
        { status: 400 }
      );
    }

    // Upsert the leave balance
    const balance = await prisma.leaveBalance.upsert({
      where: {
        employeeId_leaveTypeId_year: { employeeId, leaveTypeId, year },
      },
      create: {
        employeeId,
        leaveTypeId,
        year,
        totalDays,
        usedDays: 0,
        pendingDays: 0,
      },
      update: {
        totalDays,
      },
      include: {
        leaveType: { select: { name: true } },
      },
    });

    return Response.json({
      success: true,
      data: balance,
      message: `Vacation days updated to ${totalDays} for ${balance.leaveType.name} (${year})`,
    });
  } catch (error) {
    return Response.json(
      { success: false, error: `Failed to update balance: ${String(error)}` },
      { status: 500 }
    );
  }
}
