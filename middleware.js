import { NextResponse } from 'next/server';

/**
 * Middleware Next.js — appliqué à toutes les routes
 *
 * Sécurité :
 * - Headers de sécurité (X-Frame-Options, CSP, HSTS, etc.)
 * - Protection CSRF (vérifie Origin sur les POST — bloque si absent)
 * - Authentification optionnelle via API_SECRET_KEY
 */
export function middleware(request) {
  const response = NextResponse.next();

  // ── Security headers (toutes les routes) ──────────────
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );
  // CSP : unsafe-inline nécessaire pour script-src car Next.js injecte des scripts inline
  // pour le hydration (sans système de nonces configuré). unsafe-eval reste interdit.
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://aiplatform.googleapis.com"
  );

  // ── CSRF protection (POST uniquement) ─────────────────
  if (request.method === 'POST' && request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');

    // Bloquer si origin absent (requête forgée, curl sans origin)
    if (!origin) {
      return NextResponse.json(
        { error: 'Header Origin manquant.' },
        { status: 403 }
      );
    }

    // Vérifier que l'origin correspond au host
    if (host) {
      try {
        const originHost = new URL(origin).host;
        if (originHost !== host) {
          return NextResponse.json(
            { error: 'Requête cross-origin non autorisée.' },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: 'Header Origin invalide.' },
          { status: 403 }
        );
      }
    }
  }

  // ── Auth optionnelle via API_SECRET_KEY ────────────────
  if (request.nextUrl.pathname.startsWith('/api/generate')) {
    const apiKey = process.env.API_SECRET_KEY;
    if (apiKey) {
      const authHeader = request.headers.get('x-api-key');
      if (!authHeader || authHeader !== apiKey) {
        return NextResponse.json(
          { error: 'Clé API invalide ou manquante.' },
          { status: 401 }
        );
      }
    }
  }

  return response;
}

export const config = {
  matcher: ['/api/:path*', '/((?!_next/static|_next/image|favicon.ico).*)'],
};
