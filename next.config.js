/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Keep builds unblocked in Docker/CI; run `yarn lint` separately when needed.
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
