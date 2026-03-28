import { generateImages, ensureJpeg } from '../../../lib/vertex-ai';
import { PROMPTS, enrichPrompt } from '../../../lib/prompts';
import { NextResponse } from 'next/server';

export const maxDuration = 120; // 2 min timeout pour la génération

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      promptId,
      imagesBase64,       // Array de base64 (multi-images)
      imageBase64,        // Rétro-compatibilité (single image)
      jpegReady,          // true si les images sont déjà converties en JPEG
      subjectDescription,
      sampleCount: requestedCount,
    } = body;

    // Normaliser les images en array
    let rawImages = imagesBase64 || (imageBase64 ? [imageBase64] : []);

    if (rawImages.length === 0) {
      return NextResponse.json(
        { error: 'Au moins une image est requise.' },
        { status: 400 }
      );
    }

    const prompt = PROMPTS[promptId];
    if (!prompt) {
      return NextResponse.json(
        { error: `Prompt ${promptId} introuvable.` },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_PROJECT_ID) {
      return NextResponse.json(
        { error: 'Configuration serveur incomplète (GOOGLE_PROJECT_ID manquant).' },
        { status: 500 }
      );
    }

    // Convertir en JPEG sauf si le client signale que c'est déjà fait
    // Le client canvas produit du JPEG, pas besoin de reconvertir à chaque prompt
    const jpegImages = jpegReady
      ? rawImages
      : await Promise.all(rawImages.map(img => ensureJpeg(img)));

    // Enrichir le prompt avec la description morphologique si fournie
    const fullPrompt = enrichPrompt(prompt.prompt, subjectDescription);

    // SampleCount : priorité requête > env > défaut 2
    const sampleCount = requestedCount
      || parseInt(process.env.SAMPLE_COUNT || '2', 10);

    // Générer les images (avec retry intégré)
    const { images, errors } = await generateImages(fullPrompt, jpegImages, sampleCount);

    return NextResponse.json({
      promptId: prompt.id,
      promptName: prompt.name,
      images: images.map((img) => `data:${img.mimeType};base64,${img.data}`),
      // Renvoyer les erreurs partielles pour information UI
      warnings: errors.length > 0 ? errors : undefined,
      requested: sampleCount,
      generated: images.length,
    });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur interne du serveur.' },
      { status: 500 }
    );
  }
}
