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
        destination: `http://localhost:3001/:path*`, // Proxy to Backend using env var
      },
    ];
  },
};

module.exports = nextConfig;
