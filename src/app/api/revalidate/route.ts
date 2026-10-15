import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { z } from "zod";

import { serverEnv } from "@/lib/env";

// パイプライン (元リポジトリ) がデータを更新したあとに呼ぶ。キャッシュのタグを古い扱いにする
// 例: curl -X POST <URL>/api/revalidate -H "x-revalidate-secret: $REVALIDATE_SECRET" -d '{"tags":["series"]}'
const body = z.object({ tags: z.array(z.string().min(1).max(256)).min(1).max(50) });

function sameSecret(given: string | null, expected: string) {
  if (!given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  // 長さが違うと timingSafeEqual は例外になるので先に比べる
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!sameSecret(request.headers.get("x-revalidate-secret"), serverEnv().REVALIDATE_SECRET)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "tags を1つ以上指定してください" }, { status: 400 });
  }
  // "max": 次に見られたときに裏で作り直し、その間は古い内容を出す (Next.js 16 の推奨)
  for (const tag of parsed.data.tags) revalidateTag(tag, "max");
  return Response.json({ revalidated: parsed.data.tags });
}
