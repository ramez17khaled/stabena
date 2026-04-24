/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
    unoptimized: true,
  },
  async rewrites() {
    return [
      { source: '/sitemap.xml', destination: '/api/sitemap' },
    ]
  },
}

module.exports = nextConfig
