import { getEnrichedObjectives } from '../../../lib/prompts';
import { NextResponse } from 'next/server';

/**
 * GET /api/config
 * Retourne la configuration client : objectifs enrichis + sampleCount
 * Source unique de vérité — élimine la duplication OBJECTIVES entre serveur et client
 */
export async function GET() {
  const sampleCount = parseInt(process.env.SAMPLE_COUNT || '2', 10);
  const objectives = getEnrichedObjectives(sampleCount);

  return NextResponse.json({
    objectives,
    sampleCount,
  });
}
