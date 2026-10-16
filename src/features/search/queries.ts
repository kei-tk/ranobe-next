import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import type { SeriesCard } from "@/features/series/types";
import { createPublicClient } from "@/lib/supabase/public";

import { PAGE_SIZE, type SearchState } from "./params";

export type SearchResult = { cards: SeriesCard[]; total: number };
export type FacetCount = { category: string; tag: string; n: number };

// 036 の search_series。同じ条件はしばらく使い回す (タグを付け外しして戻ったときなどに速い)
export async function searchSeries(s: SearchState, offset = 0): Promise<SearchResult> {
  "use cache";
  cacheTag("series");
  cacheLife("minutes");
  const { data, error } = await createPublicClient().rpc("search_series", {
    p_q: s.q || null,
    p_genres: s.genres,
    p_atmospheres: s.atmospheres,
    p_sub_genres: s.subGenres,
    p_tag_mode: s.mode,
    p_author: s.author || null,
    p_sort: s.sort,
    p_limit: PAGE_SIZE,
    p_offset: offset,
  });
  if (error) throw error;
  const rows = (data ?? []) as (SeriesCard & { total: number })[];
  const cards = rows.map((row) => {
    const card: SeriesCard & { total?: number } = { ...row };
    delete card.total;
    return card as SeriesCard;
  });
  return { cards, total: rows[0]?.total ?? 0 };
}

// 036 の facet_counts。入力した語と著者だけで絞った集合で数える (選んだタグには左右されない)
export async function facetCounts(q: string, author: string): Promise<FacetCount[]> {
  "use cache";
  cacheTag("series");
  cacheLife("minutes");
  const { data, error } = await createPublicClient().rpc("facet_counts", {
    p_q: q || null,
    p_author: author || null,
  });
  if (error) throw error;
  return data ?? [];
}
