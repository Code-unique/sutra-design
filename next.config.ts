/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // 👇 prevents Next.js from blocking builds on broken generated types
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: `customer-${process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_CODE}.cloudflarestream.com`,
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com", // optional: YouTube thumbnails
      },
      {
        protocol: "https",
        hostname: "your-thumbnail-domain.com", // optional: if custom thumbnails are hosted externally
      },
    ],
  },
};

module.exports = nextConfig;
