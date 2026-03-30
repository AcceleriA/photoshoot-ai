// ============================================================
// AI Client - Gemini 3 Pro Image Preview
// Génération d'images avec préservation d'identité native
// Supporte multi-images de référence pour meilleure cohérence
// ============================================================

import { GoogleAuth } from 'google-auth-library';
import sharp from 'sharp';

const PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
const GEMINI_MODEL = 'gemini-3-pro-image-preview';

// ============================================================
// System instruction globale - règles d'identité appliquées
// à chaque appel API (dédupliquée de TECH_BASE dans prompts.js)
// ============================================================
const SYSTEM_INSTRUCTION = `You are a professional portrait photographer AI. Your primary directive is IDENTITY PRESERVATION.

ABSOLUTE RULES:
- Use the attached photo(s) as the SOLE identity reference. Preserve exactly the same face, facial structure, bone structure, proportions, and all recognizable characteristics.
- Do NOT alter the person's identity or generate a different face. The output must be immediately recognizable as the same individual.
- Preserve exactly: nose shape and width, jaw and chin structure, eye shape and spacing, eyebrow thickness and arch, lip shape and fullness, ear shape and size, hairline and hair texture, facial hair pattern and density.
- Preserve the person's actual body type, weight, and proportions. No slimming, no idealization.
- Hands must have exactly 5 fingers each with natural proportions and realistic anatomy. If hands are not essential to the scene, keep them hidden or partially visible.
- Skin texture must match the reference: preserve grain, pores, imperfections. No artificial smoothing or beautification.
- Output must look like a real photograph from a professional full-frame camera, never like AI-generated art.`;

/**
 * Détecte si un buffer est au format HEIC/HEIF via les magic bytes
 * Recherche le box 'ftyp' dans les premiers 256 octets (gère padding/meta)
 */
function isHeic(buffer) {
  if (buffer.length < 12) return false;
  const HEIC_BRANDS = ['heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1'];

  // Recherche ftyp dans les premiers 256 octets (certains HEIC ont un padding)
  const searchLimit = Math.min(256, buffer.length - 8);
  for (let i = 0; i < searchLimit; i++) {
    if (buffer.toString('ascii', i, i + 4) === 'ftyp') {
      if (i + 8 <= buffer.length) {
        const brand = buffer.toString('ascii', i + 4, i + 8);
        return HEIC_BRANDS.includes(brand);
      }
    }
  }
  return false;
}

/**
 * Convertit n'importe quel format image (HEIC, PNG, WebP, etc.) en JPEG base64
 * Utilise heic-convert pour HEIC (sharp 0.33 ne supporte pas HEIC sur Vercel)
 * Redimensionne à 2048px max pour optimiser les appels API
 */
export async function ensureJpeg(base64String) {
  let buffer = Buffer.from(base64String, 'base64');

  // Si HEIC, convertir d'abord avec heic-convert (décodeur JS pur)
  if (isHeic(buffer)) {
    const convert = (await import('heic-convert')).default;
    const jpegFromHeic = await convert({
      buffer: buffer,
      format: 'JPEG',
      quality: 0.92,
    });
    buffer = Buffer.from(jpegFromHeic);
  }

  // Redimensionner et convertir en JPEG via sharp
  const jpegBuffer = await sharp(buffer)
    .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 92 })
    .toBuffer();
  return jpegBuffer.toString('base64');
}

/**
 * Cache du token Google Cloud
 * Évite de re-authentifier à chaque appel API (10+ appels par shooting)
 * TTL de 50 minutes (les tokens Google expirent à 60min)
 *
 * Protection race condition : utilise une Promise partagée pour éviter
 * que plusieurs requêtes simultanées ne déclenchent chacune un refresh.
 * Si le refresh échoue, le cache est invalidé pour forcer un retry.
 */
let _cachedToken = null;
let _tokenExpiresAt = 0;
let _tokenRefreshPromise = null;
const TOKEN_TTL_MS = 50 * 60 * 1000; // 50 minutes

async function getAccessToken() {
  const now = Date.now();
  if (_cachedToken && now < _tokenExpiresAt) {
    return _cachedToken;
  }

  // Si un refresh est déjà en cours, attendre son résultat (évite les doublons)
  if (_tokenRefreshPromise) {
    return _tokenRefreshPromise;
  }

  _tokenRefreshPromise = (async () => {
    try {
      const auth = new GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      });
      const client = await auth.getClient();
      const token = await client.getAccessToken();

      _cachedToken = token.token;
      _tokenExpiresAt = Date.now() + TOKEN_TTL_MS;

      return _cachedToken;
    } catch (err) {
      // Invalidation du cache en cas d'échec pour forcer un retry au prochain appel
      _cachedToken = null;
      _tokenExpiresAt = 0;
      throw err;
    } finally {
      _tokenRefreshPromise = null;
    }
  })();

  return _tokenRefreshPromise;
}

/**
 * Classifie les erreurs API en messages lisibles pour l'utilisateur
 */
function classifyError(status, errorText) {
  const lower = errorText.toLowerCase();
  if (status === 429) return 'Trop de requêtes simultanées. Patientez quelques secondes.';
  if (status === 400 && (lower.includes('safety') || lower.includes('blocked'))) {
    return 'Image filtrée par les règles de sécurité Google. Essayez une autre photo.';
  }
  if (status === 400) return 'Requête invalide. Vérifiez votre photo source.';
  if (status === 401 || status === 403) return 'Erreur d\'authentification Google Cloud. Vérifiez les credentials.';
  if (status === 503 || status === 502) return 'Service Google temporairement indisponible. Réessayez.';
  if (status >= 500) return 'Erreur serveur Google. Réessayez dans quelques instants.';
  return `Erreur inattendue (code ${status}).`;
}

/**
 * Génère une seule image via Gemini 3 Pro Image Preview sur Vertex AI
 * Supporte plusieurs images de référence pour meilleure préservation d'identité
 */
async function generateSingleImage(prompt, referenceImagesBase64, accessToken) {
  const endpoint = `https://aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/global/publishers/google/models/${GEMINI_MODEL}:generateContent`;

  // Construire les parts : prompt texte + toutes les images de référence
  const parts = [{ text: prompt }];
  for (const imgBase64 of referenceImagesBase64) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imgBase64,
      },
    });
  }

  const requestBody = {
    systemInstruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }],
    },
    contents: [
      {
        role: 'user',
        parts,
      },
    ],
    generationConfig: {
      responseModalities: ['IMAGE', 'TEXT'],
      temperature: 0.6,
    },
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    // Log tronqué, pas de données sensibles
    console.error(`Gemini API error: status=${response.status} snippet=${errorText.substring(0, 200)}`);
    const userMessage = classifyError(response.status, errorText);
    throw new Error(userMessage);
  }

  const data = await response.json();

  // Extraire l'image base64 de la réponse Gemini
  const candidates = data.candidates || [];
  for (const candidate of candidates) {
    const candidateParts = candidate.content?.parts || [];
    for (const part of candidateParts) {
      if (part.inlineData?.data) {
        // Log structuré de succès
        console.log(`Gemini image generated: refImages=${referenceImagesBase64.length} promptLen=${prompt.length}`);
        return {
          data: part.inlineData.data,
          mimeType: part.inlineData.mimeType || 'image/png',
        };
      }
    }
  }

  console.error('Gemini response sans image: candidates=%d', candidates.length);
  throw new Error('Aucune image dans la réponse. Le modèle a peut-être refusé la génération.');
}

/**
 * Retry wrapper : 1 retry avec 2s de délai
 */
async function generateWithRetry(prompt, referenceImagesBase64, accessToken) {
  try {
    return await generateSingleImage(prompt, referenceImagesBase64, accessToken);
  } catch (err) {
    console.warn('Premier essai échoué, retry dans 2s.');
    await new Promise(resolve => setTimeout(resolve, 2000));
    return await generateSingleImage(prompt, referenceImagesBase64, accessToken);
  }
}

/**
 * Génère plusieurs images via Gemini 3 Pro Image Preview
 * Appelle l'API en parallèle pour chaque image, avec retry automatique
 */
export async function generateImages(prompt, referenceImagesBase64, sampleCount = 4) {
  const accessToken = await getAccessToken();

  const promises = Array.from({ length: sampleCount }, (_, i) =>
    generateWithRetry(prompt, referenceImagesBase64, accessToken).catch((err) => {
      console.error(`Image ${i + 1}/${sampleCount} échouée après retry.`);
      return { _error: err.message };
    })
  );

  const results = await Promise.all(promises);
  const images = results.filter(r => r && !r._error);
  const errors = results.filter(r => r?._error).map(r => r._error);

  if (images.length === 0) {
    throw new Error(errors[0] || 'Toutes les générations ont échoué.');
  }

  return { images, errors };
}
