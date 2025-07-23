// next.config.mjs
import path from 'path';
import { fileURLToPath } from 'url';

/** Required to simulate __dirname in ESM */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@features': path.resolve(__dirname, 'src/features'),
      '@lib': path.resolve(__dirname, 'src/lib'),
      '@app': path.resolve(__dirname, 'src/app'),
    };

    return config;
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
