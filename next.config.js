/** @type {import('next').NextConfig} */

const nextConfig = {
  // Allow images from any HTTPS host (restrict in production to known domains)
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },

  // React strict mode catches common bugs during development
  reactStrictMode: true,

  // Security headers for all API routes and pages
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Methods",     value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
          { key: "Access-Control-Allow-Headers",     value: "Content-Type, Authorization" },
          { key: "X-Content-Type-Options",           value: "nosniff" },
          { key: "X-Frame-Options",                  value: "DENY" },
          { key: "Referrer-Policy",                  value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
