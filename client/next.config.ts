import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Square hosts catalog images on its CDN; allow them for next/image.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'items-images-sandbox.s3.amazonaws.com' },
      { protocol: 'https', hostname: 'items-images-production.s3.amazonaws.com' },
      { protocol: 'https', hostname: 'square-catalog-sandbox.s3.amazonaws.com' },
    ],
  },
};

export default nextConfig;
