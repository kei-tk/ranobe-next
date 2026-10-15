import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16 で middleware.ts から名前が変わった。Supabase のセッション更新とログイン必須ページの判定だけを行う
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // 静的ファイルと画像は通さない
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)"],
};
