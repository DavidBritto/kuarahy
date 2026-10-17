import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.22', 'localhost:3000', '192.168.1.22:3000'],
};

export default nextConfig;
