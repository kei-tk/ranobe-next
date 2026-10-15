import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";

import { publicEnv } from "@/lib/env";

// Server Component / Server Action / Route Handler 用。Cookie のセッションを使うので RLS がそのまま効く。
// リクエストごとに作る (Cookie はリクエストごとに違うので、使い回してはいけない)
export async function createClient() {
  // ここから先はリクエストごとの処理だと Next.js に伝える。supabase-js はトークンの期限の判定に Date.now() を
  // 使うので、これがないと静的な部分を前もって作るときに「時刻を使った」として止められる
  await connection();
  const cookieStore = await cookies();

  return createServerClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Server Component からは Cookie を書けない。トークンの更新は proxy.ts が行うので無視してよい
          }
        },
      },
    },
  );
}

// ログイン中のユーザーの id と表示用の情報。getClaims() は JWT の署名を検証するので、認可の判定に使える
// (getSession() の中身は検証されていないので、サーバー側の判定には使わない)
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;
  const meta = (claims.user_metadata ?? {}) as { display_name?: string };
  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : undefined,
    // user_metadata は利用者が書き換えられるので、表示にだけ使い、認可には使わない
    displayName: meta.display_name || (typeof claims.email === "string" ? claims.email.split("@")[0] : "ゲスト"),
  };
}
