import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https://res.cloudinary.com data:",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https://api.resend.com https://api.cloudinary.com https://*.blob.vercel-storage.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    const securityHeaders = [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), payment=()',
      },
      { key: 'Content-Security-Policy', value: contentSecurityPolicy },
      ...(isProd
        ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }]
        : []),
    ];
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  // Don't write AGENTS.md/CLAUDE.md at the project root on every `next dev` run (Next 16 default).
  agentRules: false,
  // Qualities the app may request; anything else is snapped to the nearest (Next 16).
  images: {
    qualities: [60, 72, 75],
    // Admin-uploaded photos live on Cloudinary; the stock placeholders (content/images.json) are local files.
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' }],
  },
  // Native bindings (argon2 hashing, sharp for upload thumbnails) must run as real Node modules, not be bundled.
  serverExternalPackages: ['@node-rs/argon2', 'sharp'],
};

export default config;
