import { generateImages, ensureJpeg } from '../../../lib/vertex-ai';
import { PROMPTS } from '../../../lib/prompts';
import { NextResponse } from 'next/server';

export const maxDuration = 120; // 2 min timeout pour la génération

export async function POST(request) {
  try {
    const { promptId, imageBase64 } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image requise' }, { status: 400 });
    }

    const prompt = PROMPTS[promptId];
    if (!prompt) {
      return NextResponse.json({ error: `Prompt ${promptId} introuvable` }, { status: 400 });
    }

    if (!process.env.GOOGLE_PROJECT_ID) {
      return NextResponse.json({ error: 'GOOGLE_PROJECT_ID non configuré' }, { status: 500 });
    }

    // Convertir en JPEG (gère HEIC, PNG, WebP, etc.)
    const jpegBase64 = await ensureJpeg(imageBase64);

    // Gemini reçoit directement le prompt + l'image de référence
    // Pas d'analyse GPT intermédiaire, Gemini interprète la personne visuellement
    const images = await generateImages(prompt.prompt, jpegBase64, 2);

    return NextResponse.json({
      promptId: prompt.id,
      promptName: prompt.name,
      images: images.map((img) => `data:${img.mimeType};base64,${img.data}`),
    });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
