import type { NextConfig } from "next";

// GitHub Pages project site는 /wordmon 하위 경로에서 서빙된다.
// 커스텀 도메인을 붙이면 BASE_PATH를 비우면 된다.
const basePath = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: {
    unoptimized: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
