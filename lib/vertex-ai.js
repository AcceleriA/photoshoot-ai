// ============================================================
// AI Clients - Imagen 3 Customization + GPT-5.4-nano
// Imagen 3 pour gÃ©nÃ©ration d'images avec prÃ©servation d'identitÃ© (SUBJECT_TYPE_PERSON)
// GPT-5.4-nano pour description courte du sujet
// ============================================================

import { GoogleAuth } from 'google-auth-library';
import sharp from 'sharp';

const PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
const LOCATION = process.env.GOOGLE_LOCATION || 'us-central1';
const IMAGEN_MODEL = 'imagen-3.0-capability-001';

/**
 * DÃ©tecte si un buffer est au format HEIC/HEIF via les magic bytes
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
 * Redimensionne Ã  2048px max pour optimiser les appels API
 */
export async function ensureJpeg(base64String) {
  let buffer = Buffer.from(base64String, 'base64');

  // Si HEIC, convertir d'abord avec heic-convert (dÃ©codeur JS pur)
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
 * GÃ©nÃ¨re des images via Imagen 3 Subject Customization (predict endpoint)
 * Utilise SUBJECT_TYPE_PERSON pour prÃ©server l'identitÃ© du sujet
 *
 * @param {string} prompt - Le prompt avec rÃ©fÃ©rence [1] pour le sujet
 * @param {string} referenceImageBase64 - L'image source en base64
 * @param {string} subjectDescription - Description courte du sujet (ex: "a man with curly hair and glasses")
 * @param {number} sampleCount - Nombre d'images Ã  gÃ©nÃ©rer (1-4)
 * @returns {Promise<Array<{data: string, mimeType: string}>>} - Array d'images
 */
export async function generateImages(prompt, referenceImageBase64, subjectDescription, sampleCount = 2) {
  const accessToken = await getAccessToken();
  const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${IMAGEN_MODEL}:predict`;

  const requestBody = {
    instances: [
      {
        prompt: prompt,
        referenceImages: [
          {
            referenceType: 'REFERENCE_TYPE_SUBJECT',
            referenceId: 1,
            referenceImage: {
              bytesBase64Encoded: referenceImageBase64,
            },
            subjectImageConfig: {
              subjectDescription: subjectDescription,
              subjectType: 'SUBJECT_TYPE_PERSON',
            },
          },
        ],
      },
    ],
    parameters: {
      sampleCount: sampleCount,
      personGeneration: 'allow_all',
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
    console.error('Imagen 3 API error:', error);
    throw new Error(`Imagen 3 API error: ${response.status} - ${error}`);
  }

  const data = await response.json();

  // Extraire les images des predictions
  const predictions = data.predictions || [];
  const images = predictions
    .filter((p) => p.bytesBase64Encoded)
    .map((p) => ({
      data: p.bytesBase64Encoded,
      mimeType: p.mimeType || 'image/png',
    }));

  if (images.length === 0) {
    console.error('Imagen 3 response sans image:', JSON.stringify(data).substring(0, 500));
    throw new Error('Aucune image gÃ©nÃ©rÃ©e par Imagen 3');
  }

  return images;
}

/**
 * Description courte du sujet via GPT-5.4-nano Vision
 * Retourne une phrase en anglais pour l'API Imagen 3 subjectDescription
 * Ex: "a man with short curly dark hair, round metal glasses, and a trimmed dark beard"
 */
export async function getSubjectDescription(imageBase64, openaiApiKey) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-5.4-nano',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Describe this person in ONE short English sentence for an image generation model. Focus only on: hair (color, texture, length), facial hair, glasses, face shape, and build. Be factual, no interpretation. Example format: "a man with short curly dark hair, round metal glasses, a trimmed dark beard, and a medium build"`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_completion_tokens: 100,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
