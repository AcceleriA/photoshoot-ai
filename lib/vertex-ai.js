// ============================================================
// Vertex AI Imagen 3 - Client pour génération d'images
// Utilise l'API Subject Customization (referenceImages)
// ============================================================

import { GoogleAuth } from 'google-auth-library';

const PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
const LOCATION = process.env.GOOGLE_LOCATION || 'us-central1';
const MODEL = 'imagen-3.0-capability-001';

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
 * Génère des images via Vertex AI Imagen 3 avec Subject Customization
 *
 * @param {string} prompt - Le prompt de génération
 * @param {string} referenceImageBase64 - L'image de référence en base64
 * @param {string} subjectDescription - Description du sujet (ex: "homme brun cheveux courts")
 * @param {number} sampleCount - Nombre d'images à générer (1-4)
 * @returns {Promise<string[]>} - Array d'images en base64
 */
export async function generateImages(prompt, referenceImageBase64, subjectDescription, sampleCount = 4) {
  const accessToken = await getAccessToken();

  const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL}:predict`;

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
              subjectDescription: subjectDescription || 'person',
              subjectType: 'SUBJECT_TYPE_PERSON',
            },
          },
        ],
      },
    ],
    parameters: {
      sampleCount: sampleCount,
      aspectRatio: '1:1',
      outputOptions: {
        mimeType: 'image/png',
      },
    },
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Vertex AI error:', error);
    throw new Error(`Vertex AI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();

  // Extraire les images base64 de la réponse
  const images = (data.predictions || []).map(pred => pred.bytesBase64Encoded);
  return images;
}

/**
 * Analyse morphologique via GPT-4o Vision
 */
export async function analyzeMorphology(imageBase64, openaiApiKey) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
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

Termine par un resume en une phrase qui decrit le sujet (ex: "Homme d'environ 35 ans, brun, visage ovale, barbe courte, corpulence moyenne").`
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
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
