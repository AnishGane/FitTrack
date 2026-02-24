import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  cacheComponents: true,
  allowedDevOrigins: ["192.168.0.106"],
};

export default nextConfig;
