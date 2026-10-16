import { type NextRequest } from "next/server";

import { parseSearchState } from "@/features/search/params";
import { searchSeries } from "@/features/search/queries";

// 「さらに見る」で次の48件を取る。条件は URL クエリと同じ形で受け取る
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const offset = Math.max(0, Math.min(Number(params.get("offset")) || 0, 10_000));
  const result = await searchSeries(parseSearchState(params), offset);
  return Response.json(result);
}
