import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.64.221"],
  // 生产环境禁用缓存，保证每次请求读取最新快照
  // 参见 src/app/page.tsx 中的 dynamic = "force-dynamic"
};

export default nextConfig;
