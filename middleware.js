import { NextResponse } from 'next/server';

/**
 * Middleware Next.js — appliqué à toutes les routes /api/*
 *
 * Sécurité :
 * - Headers de sécurité (X-Frame-Options, CSP, HSTS, etc.)
 * - Protection CSRF (vérifie Origin/Referer sur les POST)
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
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'"
  );

  // ── CSRF protection (POST uniquement) ─────────────────
  if (request.method === 'POST') {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');

    // En production, vérifier que l'origin correspond au host
    if (origin && host) {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        return NextResponse.json(
          { error: 'Requête cross-origin non autorisée.' },
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
      if (authHeader !== apiKey) {
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
