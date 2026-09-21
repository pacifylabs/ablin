import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Qualities the app may request; anything else is snapped to the nearest (Next 16).
  images: { qualities: [60, 72, 75] },
};

export default config;
