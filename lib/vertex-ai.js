// ============================================================
// AI Client - Gemini 3 Pro Image Preview
// Génération d'images avec préservation d'identité native
// Plus besoin d'analyse morphologique : Gemini voit la photo directement
// ============================================================

import { GoogleAuth } from 'google-auth-library';
import sharp from 'sharp';

const PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
const LOCATION = process.env.GOOGLE_LOCATION || 'us-central1';
const GEMINI_MODEL = 'gemini-3-pro-image-preview';

/**
 * Détecte si un buffer est au format HEIC/HEIF via les magic bytes
 */
function isHeic(buffer) {
  if (buffer.length < 12) return false;
  const ftypOffset = 4;
  const ftyp = buffer.slice(ftypOffset, ftypOffset + 4).toString('ascii');
  if (ftyp !== 'ftyp') return false;
  const brand = buffer.slice(8, 12).toString('ascii');
  return ['heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1'].includes(brand);
}

/**
 * Convertit n'importe quel format image (HEIC, PNG, WebP, etc.) en JPEG base64
 * Utilise heic-convert pour HEIC (sharp ne supporte pas HEIC sur Vercel)
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
 * Obtient un access token Google Cloud via Service Account
 */
async function getAccessToken() {
  const auth = new GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token;
}

/**
 * Génère une seule image via Gemini 3 Pro Image Preview sur Vertex AI
 * La photo de référence est passée directement dans le content
 * Gemini préserve automatiquement l'identité du sujet
 */
async function generateSingleImage(prompt, referenceImageBase64, accessToken) {
  const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${GEMINI_MODEL}:generateContent`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: prompt,
          },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: referenceImageBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      responseModalities: ['IMAGE', 'TEXT'],
      temperature: 0.8,
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
    const error = await response.text();
    console.error('Gemini 3 Pro API error:', error);
    throw new Error(`Gemini 3 Pro API error: ${response.status} - ${error}`);
  }

  const data = await response.json();

  // Extraire l'image base64 de la réponse Gemini
  const candidates = data.candidates || [];
  for (const candidate of candidates) {
    const parts = candidate.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return {
          data: part.inlineData.data,
          mimeType: part.inlineData.mimeType || 'image/png',
        };
      }
    }
  }

  // Log la réponse pour debug si pas d'image
  console.error('Gemini 3 Pro response sans image:', JSON.stringify(data).substring(0, 500));
  throw new Error('Aucune image générée dans la réponse Gemini 3 Pro');
}

/**
 * Génère plusieurs images via Gemini 3 Pro Image Preview
 * Appelle l'API en parallèle pour chaque image
 *
 * @param {string} prompt - Le prompt de génération enrichi
 * @param {string} referenceImageBase64 - L'image source en base64
 * @param {number} sampleCount - Nombre d'images à générer (défaut: 4)
 * @returns {Promise<Array<{data: string, mimeType: string}>>} - Array d'images
 */
export async function generateImages(prompt, referenceImageBase64, sampleCount = 4) {
  const accessToken = await getAccessToken();

  // Lancer les générations en parallèle
  const promises = Array.from({ length: sampleCount }, (_, i) =>
    generateSingleImage(prompt, referenceImageBase64, accessToken).catch((err) => {
      console.error(`Image ${i + 1}/${sampleCount} échouée:`, err.message);
      return null;
    })
  );

  const results = await Promise.all(promises);
  const images = results.filter(Boolean);

  if (images.length === 0) {
    throw new Error('Toutes les générations ont échoué. Vérifier les logs serveur.');
  }

  return images;
}
