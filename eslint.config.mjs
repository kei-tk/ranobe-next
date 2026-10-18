import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Modernist のルール (docs/ui-design.md §1.4): 角丸・影・リングのずらしは使わない。
// shadcn から部品を足したときの消し忘れも、ここで見つける
const MODERNIST_FORBIDDEN = "(^|\\s)(rounded-(?!none)|shadow-(?!none)|ring-offset-)";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector: `Literal[value=/${MODERNIST_FORBIDDEN}/]`,
          message: "角丸・影は使いません (Modernist)。rounded-none 以外の rounded-* / shadow-* / ring-offset-* を外してください",
        },
        {
          selector: `TemplateElement[value.raw=/${MODERNIST_FORBIDDEN}/]`,
          message: "角丸・影は使いません (Modernist)。rounded-none 以外の rounded-* / shadow-* / ring-offset-* を外してください",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    // 書影なし版の開発サーバーと、ビルドの確認用の出力 (NEXT_DIST_DIR で分けたもの)
    ".next-*/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // デザインのモック (claude.ai Design から書き出したもの) は検査しない
    "design/**",
  ]),
]);

export default eslintConfig;
