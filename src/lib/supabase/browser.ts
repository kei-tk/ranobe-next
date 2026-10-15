import { createBrowserClient } from "@supabase/ssr";

import { publicEnv } from "@/lib/env";

// ブラウザ用。中で1つのインスタンスを使い回すので、何度呼んでもよい
export function createClient() {
  return createBrowserClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
