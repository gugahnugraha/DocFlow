import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config, { isServer }) {
    if (isServer) {
      // Don't bundle native modules — let Node.js require them at runtime
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        "@napi-rs/canvas",
        "canvas",
      ];
    }
    return config;
  },
};

export default nextConfig;
