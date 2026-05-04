/**
 * @file Company settings controller.
 */

import 'server-only';
import * as settingsService from '@/services/settings/companySettings.service';
import { updateSettingsSchema } from '@/schemas/companySettings.schema';
import { requireAuth } from '@/security/middleware/auth.middleware';
import { apiPermissionGuard } from '@/security/rbac/permission.guard';
import { containsXss } from '@/security/validation/xss-protection';
import { Permission } from '@/types/auth.types';

export async function handleGetSettings(): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;

    const result = await settingsService.getSettings();
    return Response.json(result, { status: result.success ? 200 : 500 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function handleUpdateSettings(request: Request): Promise<Response> {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const guard = apiPermissionGuard(auth.session, Permission.MANAGE_SETTINGS);
    if (guard) return guard;

    const body = await request.json();
    const strings = Object.values(body).filter((v): v is string => typeof v === 'string');
    if (strings.some(containsXss)) {
      return Response.json({ success: false, error: 'Invalid input detected' }, { status: 400 });
    }

    const validation = updateSettingsSchema.safeParse(body);
    if (!validation.success) {
      return Response.json(
        { success: false, error: 'Validation failed', data: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await settingsService.updateSettings(validation.data);
    return Response.json(result, { status: result.success ? 200 : 400 });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
