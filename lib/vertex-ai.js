// ============================================================
// AI Clients - Gemini Flash Image + GPT-5.4-nano
// Gemini pour generation d'images avec preservation d'identite
// GPT-5.4-nano pour analyse morphologique
// ============================================================

import { GoogleAuth } from 'google-auth-library';
import sharp from 'sharp';

const PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
const LOCATION = process.env.GOOGLE_LOCATION || 'us-central1';
const GEMINI_MODEL = 'gemini-2.5-flash-image';

/**
 * Convertit n'importe quel format image (HEIC, PNG, WebP, etc.) en JPEG base64
 * Redimensionne a 2048px max pour optimiser les appels API
 */
export async function ensureJpeg(base64String) {
  const buffer = Buffer.from(base64String, 'base64');
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
 * Genere une seule image via Gemini Flash Image sur Vertex AI
 * La photo de reference est passee directement dans le content
 * Gemini preserve automatiquement l'identite du sujet
 */
async function generateSingleImage(prompt, referenceImageBase64, accessToken) {
  const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1beta1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${GEMINI_MODEL}:generateContent`;

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
    console.error('Gemini API error:', error);
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const data = await response.json();

  // Extraire l'image base64 de la reponse Gemini
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

  // Log la reponse pour debug si pas d'image
  console.error('Gemini response sans image:', JSON.stringify(data).substring(0, 500));
  throw new Error('Aucune image generee dans la reponse Gemini');
}

/**
 * Genere plusieurs images via Gemini Flash Image
 * Appelle l'API en parallele pour chaque image
 *
 * @param {string} prompt - Le prompt de generation enrichi
 * @param {string} referenceImageBase64 - L'image source en base64
 * @param {number} sampleCount - Nombre d'images a generer (defaut: 4)
 * @returns {Promise<Array<{data: string, mimeType: string}>>} - Array d'images
 */
export async function generateImages(prompt, referenceImageBase64, sampleCount = 4) {
  const accessToken = await getAccessToken();

  // Lancer les generations en parallele
  const promises = Array.from({ length: sampleCount }, (_, i) =>
    generateSingleImage(prompt, referenceImageBase64, accessToken).catch((err) => {
      console.error(`Image ${i + 1}/${sampleCount} echouee:`, err.message);
      return null;
    })
  );

  const results = await Promise.all(promises);
  const images = results.filter(Boolean);

  if (images.length === 0) {
    throw new Error('Toutes les generations ont echoue. Verifier les logs serveur.');
  }

  return images;
}

/**
 * Analyse morphologique via GPT-5.4-nano Vision
 */
export async function analyzeMorphology(imageBase64, openaiApiKey) {
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
              text: `Analyse cette photo de maniere strictement factuelle et descriptive. Decris uniquement la personne visible, jamais le decor, l'arriere-plan, les vetements ou l'eclairage.

Aucune interpretation psychologique ou sociale. Aucun embellissement. Aucune idealisation. Ne pas corriger les asymetries, imperfections ou particularites. Ne rien inventer : tout doit etre strictement observable.

Structure l'analyse en 12 sections :
1. Morphologie generale
2. Forme du visage
3. Peau
4. Yeux
5. Sourcils
6. Nez
7. Bouche et levres
8. Oreilles
9. Cheveux
10. Pilosite faciale
11. Expression neutre
12. Signes distinctifs

Termine par un resume en une phrase qui decrit le sujet (ex: "Homme d'environ 35 ans, brun, visage ovale, barbe courte, corpulence moyenne").`,
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
      max_completion_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
