import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const configDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    // Prevent Next.js from inferring the wrong workspace root on Windows.
    root: configDir,
  },
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  cacheComponents: true,
  // Allow loading /_next assets when accessing dev server via LAN IP.
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.0.106",
    "192.168.0.130",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },
};

export default nextConfig;
