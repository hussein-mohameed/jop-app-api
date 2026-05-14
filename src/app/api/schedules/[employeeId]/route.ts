/**
 * @file Schedule API route — employee-specific work schedule.
 * GET    /api/schedules/:employeeId → Get effective schedule
 * PUT    /api/schedules/:employeeId → Set custom schedule
 * DELETE /api/schedules/:employeeId → Reset to default
 */

import {
  handleGetSchedule,
  handleSetSchedule,
  handleResetSchedule,
} from '@/controllers/workSchedule.controller';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ employeeId: string }> }
): Promise<Response> {
  const { employeeId } = await params;
  return handleGetSchedule(request, employeeId);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ employeeId: string }> }
): Promise<Response> {
  const { employeeId } = await params;
  return handleSetSchedule(request, employeeId);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ employeeId: string }> }
): Promise<Response> {
  const { employeeId } = await params;
  return handleResetSchedule(request, employeeId);
}
