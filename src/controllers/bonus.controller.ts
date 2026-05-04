/**
 * @file Bonus controller — bridge between API routes and bonus service.
 * NO business logic — delegates everything to the service layer.
 */

import 'server-only';
import * as bonusService from '@/services/bonuses/bonus.service';
import { suggestBonusSchema, reviewBonusSchema, bonusQuerySchema } from '@/schemas/bonus.schema';
import { requireAuth } from '@/security/middleware/auth.middleware';
import { apiPermissionGuard } from '@/security/rbac/permission.guard';
import { containsXss } from '@/security/validation/xss-protection';
import { Permission } from '@/types/auth.types';

export async function handleListBonuses(request: Request): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.SUGGEST_BONUS);
    if (guard) return guard;

    const url = new URL(request.url);
    const rawParams = Object.fromEntries(url.searchParams);
    const validation = bonusQuerySchema.safeParse(rawParams);

    if (!validation.success) {
      return Response.json(
        { success: false, error: 'Invalid query parameters', data: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await bonusService.listBonuses(validation.data);
    return Response.json(result, { status: result.success ? 200 : 500 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function handleSuggestBonus(request: Request): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.SUGGEST_BONUS);
    if (guard) return guard;

    const body = await request.json();
    const strings = Object.values(body).filter((v): v is string => typeof v === 'string');
    if (strings.some(containsXss)) {
      return Response.json({ success: false, error: 'Invalid input detected' }, { status: 400 });
    }

    const validation = suggestBonusSchema.safeParse(body);
    if (!validation.success) {
      return Response.json(
        { success: false, error: 'Validation failed', data: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await bonusService.suggestBonus(auth.session.sub, validation.data);
    return Response.json(result, { status: result.success ? 201 : 400 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function handleReviewBonus(request: Request, id: string): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.APPROVE_BONUS);
    if (guard) return guard;

    const body = await request.json();
    const strings = Object.values(body).filter((v): v is string => typeof v === 'string');
    if (strings.some(containsXss)) {
      return Response.json({ success: false, error: 'Invalid input detected' }, { status: 400 });
    }

    const validation = reviewBonusSchema.safeParse(body);
    if (!validation.success) {
      return Response.json(
        { success: false, error: 'Validation failed', data: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await bonusService.reviewBonus(
      id, auth.session.sub, validation.data.status, validation.data.approvalNotes || undefined
    );
    return Response.json(result, { status: result.success ? 200 : 400 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
