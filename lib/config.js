// ============================================================
// Config validation - vérifie les variables d'environnement au démarrage
// ============================================================

const REQUIRED_ENV_VARS = [
  'GOOGLE_PROJECT_ID',
  'GOOGLE_CLIENT_EMAIL',
  'GOOGLE_PRIVATE_KEY',
];

const OPTIONAL_ENV_VARS = [
  'SAMPLE_COUNT',
  'API_SECRET_KEY',
];

let _validated = false;

/**
 * Vérifie que toutes les variables d'environnement requises sont définies.
 * Appelé une seule fois au premier appel API.
 * @throws {Error} si une variable requise est manquante
 */
export function validateConfig() {
  if (_validated) return;

  const missing = REQUIRED_ENV_VARS.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Variables d'environnement manquantes : ${missing.join(', ')}. ` +
      'Vérifiez votre fichier .env.local.'
    );
  }

  _validated = true;
}

/**
 * Limites de sécurité centralisées
 */
export const LIMITS = {
  MAX_IMAGE_SIZE_BYTES: 10 * 1024 * 1024,    // 10 Mo par image (base64 décodé)
  MAX_TOTAL_PAYLOAD_BYTES: 50 * 1024 * 1024,  // 50 Mo total
  MAX_IMAGES: 5,                               // 5 images max par requête
  MAX_SAMPLE_COUNT: 10,                        // 10 variantes max
  MAX_DESCRIPTION_LENGTH: 1000,                // 1000 caractères pour subjectDescription
  VALID_PROMPT_IDS: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
};
