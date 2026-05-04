/**
 * @file Company settings API route.
 * GET  /api/settings → Get settings
 * PUT  /api/settings → Update settings
 */

import { handleGetSettings, handleUpdateSettings } from '@/controllers/companySettings.controller';

export async function GET(): Promise<Response> {
  return handleGetSettings();
}

export async function PUT(request: Request): Promise<Response> {
  return handleUpdateSettings(request);
}
