/**
 * @file Bonuses collection API route.
 * GET  /api/bonuses → List bonuses
 * POST /api/bonuses → Suggest bonus
 */

import { handleListBonuses, handleSuggestBonus } from '@/controllers/bonus.controller';

export async function GET(request: Request): Promise<Response> {
  return handleListBonuses(request);
}

export async function POST(request: Request): Promise<Response> {
  return handleSuggestBonus(request);
}
