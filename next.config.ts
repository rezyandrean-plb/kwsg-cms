import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Experimental features for better compatibility
  experimental: {
    optimizePackageImports: ['@radix-ui/react-label', '@radix-ui/react-slot'],
  },
  // Server components external packages
  serverExternalPackages: ['pg', '@prisma/client'],
};

export default nextConfig;
