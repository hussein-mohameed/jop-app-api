/**
 * @file Job controller — bridge between API routes and job service.
 * NO business logic — delegates everything to the service layer.
 */

import 'server-only';
import * as jobService from '@/services/jobs/job.service';
import {
  createJobSchema, updateJobSchema, reviewJobSchema,
  jobQuerySchema, createApplicationSchema, reviewApplicationSchema,
  applicationQuerySchema,
} from '@/schemas/job.schema';
import { requireAuth } from '@/security/middleware/auth.middleware';
import { apiPermissionGuard } from '@/security/rbac/permission.guard';
import { containsXss } from '@/security/validation/xss-protection';
import { Permission } from '@/types/auth.types';

// ==================== JOB LIST & GET ====================

export async function handleListJobs(request: Request): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;

    const url = new URL(request.url);
    const validation = jobQuerySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!validation.success) {
      return Response.json({ success: false, error: 'Invalid query', data: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const result = await jobService.listJobs(validation.data);
    return Response.json(result, { status: result.success ? 200 : 500 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function handleGetJob(_request: Request, id: string): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;

    const result = await jobService.getJob(id);
    return Response.json(result, { status: result.success ? 200 : 404 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ==================== JOB CREATE & UPDATE ====================

export async function handleCreateJob(request: Request): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.POST_JOB);
    if (guard) return guard;

    const body = await request.json();
    const strings = Object.values(body).filter((v): v is string => typeof v === 'string');
    if (strings.some(containsXss)) {
      return Response.json({ success: false, error: 'Invalid input detected' }, { status: 400 });
    }

    const validation = createJobSchema.safeParse(body);
    if (!validation.success) {
      return Response.json({ success: false, error: 'Validation failed', data: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const result = await jobService.createJob(auth.session.sub, validation.data);
    return Response.json(result, { status: result.success ? 201 : 400 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function handleUpdateJob(request: Request, id: string): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.POST_JOB);
    if (guard) return guard;

    const body = await request.json();
    const strings = Object.values(body).filter((v): v is string => typeof v === 'string');
    if (strings.some(containsXss)) {
      return Response.json({ success: false, error: 'Invalid input detected' }, { status: 400 });
    }

    const validation = updateJobSchema.safeParse(body);
    if (!validation.success) {
      return Response.json({ success: false, error: 'Validation failed', data: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const result = await jobService.updateJob(id, validation.data);
    return Response.json(result, { status: result.success ? 200 : 400 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ==================== JOB REVIEW ====================

export async function handleReviewJob(request: Request, id: string): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.APPROVE_JOB_POSTING);
    if (guard) return guard;

    const body = await request.json();
    const validation = reviewJobSchema.safeParse(body);
    if (!validation.success) {
      return Response.json({ success: false, error: 'Validation failed', data: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const result = await jobService.reviewJob(id, auth.session.sub, validation.data.status);
    return Response.json(result, { status: result.success ? 200 : 400 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ==================== APPLICATIONS ====================

export async function handleListApplications(request: Request, jobId: string): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.POST_JOB);
    if (guard) return guard;

    const url = new URL(request.url);
    const validation = applicationQuerySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!validation.success) {
      return Response.json({ success: false, error: 'Invalid query', data: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const result = await jobService.listApplications(jobId, validation.data);
    return Response.json(result, { status: result.success ? 200 : 500 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function handleCreateApplication(request: Request, jobId: string): Promise<Response> {
  try {
    // Applications are public — no auth required
    const body = await request.json();
    const strings = Object.values(body).filter((v): v is string => typeof v === 'string');
    if (strings.some(containsXss)) {
      return Response.json({ success: false, error: 'Invalid input detected' }, { status: 400 });
    }

    const validation = createApplicationSchema.safeParse(body);
    if (!validation.success) {
      return Response.json({ success: false, error: 'Validation failed', data: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const result = await jobService.submitApplication(jobId, validation.data);
    return Response.json(result, { status: result.success ? 201 : 400 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function handleReviewApplication(request: Request, id: string): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.POST_JOB);
    if (guard) return guard;

    const body = await request.json();
    const validation = reviewApplicationSchema.safeParse(body);
    if (!validation.success) {
      return Response.json({ success: false, error: 'Validation failed', data: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const result = await jobService.reviewApplication(id, auth.session.sub, validation.data.status, validation.data.notes || undefined);
    return Response.json(result, { status: result.success ? 200 : 400 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
