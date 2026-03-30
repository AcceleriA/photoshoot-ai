import { generateImages, ensureJpeg } from '../../../lib/vertex-ai';
import { PROMPTS, enrichPrompt } from '../../../lib/prompts';
import { validateConfig, LIMITS } from '../../../lib/config';
import { checkRateLimit } from '../../../lib/rate-limit';
import { NextResponse } from 'next/server';

export const maxDuration = 120; // 2 min timeout pour la génération

export async function POST(request) {
  try {
    // ── Validation config au premier appel ────────────────
    validateConfig();

    // ── Rate limiting par IP ──────────────────────────────
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Limite de requêtes atteinte. Réessayez plus tard.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // ── Parse du body ─────────────────────────────────────
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Corps de requête invalide (JSON attendu).' },
        { status: 400 }
      );
    }

    const {
      promptId,
      imagesBase64,       // Array de base64 (multi-images)
      imageBase64,        // Rétro-compatibilité (single image)
      jpegReady,          // true si les images sont déjà converties en JPEG
      subjectDescription,
      sampleCount: requestedCount,
    } = body;

    // ── Validation promptId (whitelist stricte) ───────────
    const numericPromptId = Number(promptId);
    if (!LIMITS.VALID_PROMPT_IDS.includes(numericPromptId)) {
      return NextResponse.json(
        { error: 'ID de prompt invalide.' },
        { status: 400 }
      );
    }

    const prompt = PROMPTS[numericPromptId];
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt introuvable.' },
        { status: 400 }
      );
    }

    // ── Validation images ─────────────────────────────────
    let rawImages = imagesBase64 || (imageBase64 ? [imageBase64] : []);

    if (!Array.isArray(rawImages)) {
      return NextResponse.json(
        { error: 'Le champ imagesBase64 doit être un tableau.' },
        { status: 400 }
      );
    }

    if (rawImages.length === 0) {
      return NextResponse.json(
        { error: 'Au moins une image est requise.' },
        { status: 400 }
      );
    }

    if (rawImages.length > LIMITS.MAX_IMAGES) {
      return NextResponse.json(
        { error: `Maximum ${LIMITS.MAX_IMAGES} images autorisées.` },
        { status: 400 }
      );
    }

    // ── Validation taille des images ──────────────────────
    // base64 : 4 chars = 3 bytes, donc length * 0.75
    // Gère le cas data URL prefix (data:image/jpeg;base64,...)
    let totalSize = 0;
    for (let i = 0; i < rawImages.length; i++) {
      const img = rawImages[i];
      if (typeof img !== 'string') {
        return NextResponse.json(
          { error: 'Chaque image doit être une chaîne base64.' },
          { status: 400 }
        );
      }
      // Retirer le prefix data URL si présent
      const base64Data = img.startsWith('data:') ? img.split(',')[1] || '' : img;
      rawImages[i] = base64Data; // normaliser pour la suite
      const estimatedBytes = Math.ceil(base64Data.length * 0.75);
      if (estimatedBytes > LIMITS.MAX_IMAGE_SIZE_BYTES) {
        return NextResponse.json(
          { error: 'Une image dépasse la taille maximale autorisée (10 Mo).' },
          { status: 413 }
        );
      }
      totalSize += estimatedBytes;
    }

    if (totalSize > LIMITS.MAX_TOTAL_PAYLOAD_BYTES) {
      return NextResponse.json(
        { error: 'Taille totale des images trop élevée (max 50 Mo).' },
        { status: 413 }
      );
    }

    // ── Validation sampleCount (plafonnement) ─────────────
    const envSampleCount = parseInt(process.env.SAMPLE_COUNT || '2', 10);
    let sampleCount = requestedCount || envSampleCount;
    sampleCount = Math.min(Math.max(1, Math.floor(sampleCount)), LIMITS.MAX_SAMPLE_COUNT);

    // ── Sanitisation subjectDescription ───────────────────
    let sanitizedDescription = undefined;
    if (subjectDescription && typeof subjectDescription === 'string') {
      sanitizedDescription = subjectDescription
        .trim()
        .slice(0, LIMITS.MAX_DESCRIPTION_LENGTH);
    }

    // ── Conversion JPEG si nécessaire ─────────────────────
    const jpegImages = jpegReady
      ? rawImages
      : await Promise.all(rawImages.map(img => ensureJpeg(img)));

    // ── Enrichir le prompt ────────────────────────────────
    const fullPrompt = enrichPrompt(prompt.prompt, sanitizedDescription);

    // ── Cap longueur du prompt enrichi ────────────────────
    if (fullPrompt.length > 10000) {
      return NextResponse.json(
        { error: 'Prompt trop long après enrichissement.' },
        { status: 400 }
      );
    }

    // ── Générer les images (avec retry intégré) ───────────
    const { images, errors } = await generateImages(fullPrompt, jpegImages, sampleCount);

    // ── Validation MIME des images générées ────────────────
    const ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/webp'];
    const BASE64_RE = /^[A-Za-z0-9+/\n\r]+=*$/;
    const validImages = images.filter(img => {
      const mime = img.mimeType || 'image/png';
      return (
        ALLOWED_MIME.includes(mime) &&
        typeof img.data === 'string' &&
        img.data.length > 0 &&
        BASE64_RE.test(img.data)
      );
    });

    return NextResponse.json({
      promptId: prompt.id,
      promptName: prompt.name,
      images: validImages.map((img) => `data:${img.mimeType};base64,${img.data}`),
      warnings: errors.length > 0 ? errors.map(() => 'Génération partielle') : undefined,
      requested: sampleCount,
      generated: validImages.length,
    });
  } catch (error) {
    // ── Erreurs sanitisées (pas de stack trace ni détails internes) ──
    console.error('Generate error:', error.message);
    const safeMessage = error.message?.includes('Variables d\'environnement')
      ? 'Configuration serveur incomplète.'
      : (error.message || 'Erreur interne du serveur.');

    return NextResponse.json(
      { error: safeMessage },
      { status: 500 }
    );
  }
}
