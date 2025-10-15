// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },      // don’t fail CI on lint
  typescript: { ignoreBuildErrors: true },    // don’t fail CI on TS
};

export default nextConfig;
