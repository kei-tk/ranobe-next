import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { publicEnv } from "@/lib/env";

// ログインが必要なパス。ここに未ログインで来たら /auth に移す
const PROTECTED_PREFIXES = ["/account"];

// リクエストごとにセッションを確かめ、期限が近ければトークンを更新して Cookie に書き戻す
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          // 更新したトークンを、この後の Server Component (request) とブラウザ (response) の両方に渡す
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
          // 認証の Cookie を含む応答を CDN にキャッシュさせないためのヘッダー
          Object.entries(headers).forEach(([key, value]) => supabaseResponse.headers.set(key, value));
        },
      },
    },
  );

  // createServerClient と getClaims() の間に処理を挟まない (セッションの更新がずれて、突然ログアウトされる原因になる)
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims?.sub);

  const { pathname, search } = request.nextUrl;
  if (!isLoggedIn && PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    const redirect = NextResponse.redirect(url);
    // リダイレクトでも、更新したトークンの Cookie は渡す
    supabaseResponse.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }

  // supabaseResponse をそのまま返す (別の応答を返すと、更新したトークンの Cookie が失われる)
  return supabaseResponse;
}
