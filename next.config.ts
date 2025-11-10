import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer, webpack }) => {
    // Ensure proper module resolution for client-side builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };

      // Ignore server-only packages on client side
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^pg$/,
        })
      );
    }

    return config;
  },
  // Experimental features for better compatibility
  experimental: {
    optimizePackageImports: ['@radix-ui/react-label', '@radix-ui/react-slot'],
  },
  // Server components external packages
  serverExternalPackages: ['pg', '@prisma/client'],
};

export default nextConfig;
