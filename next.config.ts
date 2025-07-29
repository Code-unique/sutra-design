// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // 👇 prevents Next.js from blocking builds on broken generated types
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
