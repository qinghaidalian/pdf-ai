import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse is a CJS package that doesn't bundle well with Turbopack
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
