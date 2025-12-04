import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React strict mode for better development warnings
  reactStrictMode: true,

  // Optimize images with Next.js Image component
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
      },
    ],
  },

  // Experimental features
  experimental: {
    // Enable typed routes for better type safety
    typedRoutes: true,
  },

  // Webpack configuration for Amplify compatibility
  webpack: (config, { isServer }) => {
    // Handle Amplify modules that need special treatment
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
