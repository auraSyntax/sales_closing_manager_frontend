const createNextIntlPlugin = require('next-intl/plugin')(
  './i18n.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${'http://localhost:3001'}/:path*`, // Proxy to Backend using env var
      },
    ];
  },
};

module.exports = createNextIntlPlugin(nextConfig);
