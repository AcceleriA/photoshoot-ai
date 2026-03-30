/** @type {import('next').NextConfig} */
const nextConfig = {
  // Note : en App Router, la taille du body est gérée par Vercel (4.5MB Hobby, 100MB Pro)
  // L'ancienne clé 'api.bodyParser' n'est valide qu'en Pages Router et a été retirée.

  // Headers de sécurité appliqués à toutes les réponses
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'off' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },

  // Désactiver l'en-tête X-Powered-By (fuite d'info)
  poweredByHeader: false,
};

export default nextConfig;
