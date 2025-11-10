import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    // Ensure proper module resolution for client-side builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
  // Experimental features for better compatibility
  experimental: {
    optimizePackageImports: ['@radix-ui/react-label', '@radix-ui/react-slot'],
  },
};

export default nextConfig;
