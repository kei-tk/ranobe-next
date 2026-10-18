import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 書影あり / なしの開発サーバーを同時に動かすとき、ビルドの置き場所が重ならないように分ける
  distDir: process.env.NEXT_DIST_DIR || ".next",
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  images: {
    // 書影は版元ドットコムの画像をそのまま出す (Vercel の画像最適化の無料枠を使い切らないため)
    unoptimized: true,
  },
  turbopack: {
    // ホームフォルダにある別の package-lock.json を、このプロジェクトのものと取り違えないように
    root: path.resolve(import.meta.dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
