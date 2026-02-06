import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Increase the Body Size Limit for Server Actions
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb', // Adjust as needed (e.g., '10mb', '50mb')
    },
  },

  // 2. Allow Next.js to optimize images from Supabase
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Matches your Supabase project domain
      },
    ],
  },
};

export default nextConfig;