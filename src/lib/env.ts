import { z } from "zod";

// NEXT_PUBLIC_ の値はビルド時に埋め込まれるので、process.env.X と直接書いて参照する必要がある
// (process.env をまるごと渡すとブラウザ側では値が入らない)
const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

export const publicEnv = publicSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
});

const serverSchema = z.object({
  REVALIDATE_SECRET: z.string().min(16),
});

// サーバー専用の値は、使う場所で呼んで検証する (クライアントのバンドルで評価させないため)
export function serverEnv() {
  return serverSchema.parse({ REVALIDATE_SECRET: process.env.REVALIDATE_SECRET });
}
