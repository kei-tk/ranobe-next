import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { publicEnv } from "@/lib/env";

// Cookie を使わない、公開データ専用のクライアント。'use cache' の中では Cookie を読めないので、
// キャッシュするデータ (作品・タグ・新刊) はこちらで取る。RLS の read-all が効くので、読めるのは公開データだけ
export function createPublicClient() {
  return createSupabaseClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
