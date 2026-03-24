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
  images: {
    domains: ["images.unsplash.com", "plus.unsplash.com"],
  },
};

export default nextConfig;
