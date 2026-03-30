// ============================================================
// Rate limiter in-memory (pas de dépendance externe)
// Sliding window par IP — reset automatique
// ============================================================

const store = new Map();

const WINDOW_MS = 60 * 60 * 1000; // 1 heure
const MAX_REQUESTS = 30;           // 30 générations par heure par IP

/**
 * Vérifie si une IP a dépassé la limite de requêtes.
 * @param {string} ip - Adresse IP du client
 * @returns {{ allowed: boolean, remaining: number, resetAt: number }}
 */
export function checkRateLimit(ip) {
  const now = Date.now();
  const key = ip || 'unknown';

  // Nettoyer les entrées expirées (toutes les 100 appels)
  if (store.size > 100) {
    for (const [k, v] of store) {
      if (now > v.resetAt) store.delete(k);
    }
  }

  let entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    store.set(key, entry);
  }

  entry.count++;

  return {
    allowed: entry.count <= MAX_REQUESTS,
    remaining: Math.max(0, MAX_REQUESTS - entry.count),
    resetAt: entry.resetAt,
  };
}
