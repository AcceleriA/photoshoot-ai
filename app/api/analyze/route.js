import { analyzeMorphology, ensureJpeg } from '../../../lib/vertex-ai';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { imageBase64 } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image requise' }, { status: 400 });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY non configuree' }, { status: 500 });
    }

    // Convertir en JPEG (gere HEIC, PNG, WebP, etc.)
    const jpegBase64 = await ensureJpeg(imageBase64);

    const analysis = await analyzeMorphology(jpegBase64, openaiKey);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
