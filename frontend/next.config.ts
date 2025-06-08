import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'production'
  }
};

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === 'development', // 開発時のみ無効化
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "offlineCache",
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
})(nextConfig);
