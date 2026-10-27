import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";

import type { CardWithReason, SeriesCard, SeriesDetail, Volume } from "./types";

// ---------------------------------------------------------------------------
// 公開データ ('use cache' でキャッシュ。パイプラインの更新後は /api/revalidate で "series" を捨てる)
// ---------------------------------------------------------------------------

export async function getRecentReleases(): Promise<SeriesCard[]> {
  "use cache";
  cacheTag("series");
  cacheLife("hours");
  const { data, error } = await createPublicClient().rpc("recent_releases");
  if (error) throw error;
  return (data ?? []) as SeriesCard[];
}

// タグごとの作品数 (条件なし)。チップの一覧と、共通ジャンルの「珍しさ」の判定に使う
export async function getAllTagCounts(): Promise<{ category: string; tag: string; n: number }[]> {
  "use cache";
  cacheTag("series");
  cacheLife("hours");
  const { data, error } = await createPublicClient().rpc("facet_counts");
  if (error) throw error;
  return data ?? [];
}

export async function getSeriesDetail(id: string): Promise<{ series: SeriesDetail; volumes: Volume[] } | null> {
  "use cache";
  cacheTag("series", `series:${id}`);
  cacheLife("hours");
  // uuid でない値は DB に投げない (PostgREST が 400 を返すので、先に「見つからない」にする)
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;

  const supabase = createPublicClient();
  const [card, extra, books] = await Promise.all([
    // 特装版・予約だけのシリーズは cards_by_ids が返さないので、詳細も「見つからない」になる
    supabase.rpc("cards_by_ids", { p_ids: [id] }),
    supabase.from("openbd_test_series").select("tagline").eq("id", id).maybeSingle(),
    supabase
      .from("openbd_test_books")
      .select("isbn,title,volume_number,volume_number_sub,attached_to_isbn,published_date,cover_image_url")
      .eq("series_id", id)
      .order("volume_number", { ascending: true, nullsFirst: false })
      .order("published_date", { ascending: true, nullsFirst: false }),
  ]);
  if (card.error) throw card.error;
  const base = (card.data as SeriesCard[] | null)?.[0];
  if (!base) return null;

  // 特装版 (attached_to_isbn がある本) は行にせず、本編の行に「特装版あり」として出す
  const rows = books.data ?? [];
  const attached = new Set(rows.map((b) => b.attached_to_isbn).filter(Boolean));
  const volumes: Volume[] = rows
    .filter((b) => !b.attached_to_isbn)
    .map((b) => ({
      isbn: b.isbn,
      title: b.title,
      volume_number: b.volume_number,
      volume_number_sub: b.volume_number_sub,
      published_date: b.published_date,
      cover_image_url: b.cover_image_url,
      hasSpecialEdition: attached.has(b.isbn),
    }));

  return {
    series: {
      ...base,
      tagline: extra.data?.tagline ?? null,
    },
    volumes,
  };
}

// id の並びを保ったままカードを取る (RPC はスコア順の id だけを返すので)。
// cards_by_ids (037) は特装版・予約だけのシリーズを返さず、最新刊の日付は発売済みのものにする
async function cardsByIds(ids: string[], client = createPublicClient()): Promise<SeriesCard[]> {
  if (ids.length === 0) return [];
  const { data, error } = await client.rpc("cards_by_ids", { p_ids: ids });
  if (error) throw error;
  const byId = new Map((data as SeriesCard[]).map((c) => [c.series_id, c]));
  return ids.map((id) => byId.get(id)).filter((c): c is SeriesCard => Boolean(c));
}

// 共通ジャンルを、作品数の少ない (珍しい) 順に並べる
function rarestShared(a: string[], b: string[], counts: Map<string, number>, take: number) {
  return a
    .filter((t) => b.includes(t))
    .sort((x, y) => (counts.get(x) ?? 0) - (counts.get(y) ?? 0))
    .slice(0, take);
}

// 似ているシリーズの候補 (035 の similar_series をその場で計算)。似ている順に最大 pool 件で、共通点のラベルも付ける。
// 表示する件数はここでは選ばない (候補だけをキャッシュし、どれを出すかは表示のたびにページ側で選ぶ)
export async function getSimilarSeries(base: SeriesCard, pool = 30): Promise<CardWithReason[]> {
  "use cache";
  cacheTag("series", `series:${base.series_id}`);
  cacheLife("hours");
  const supabase = createPublicClient();
  // 未発売の作品は cards_by_ids で外れるので、その分を多めに取る
  const { data, error } = await supabase.rpc("similar_series", { p_series_id: base.series_id, p_limit: pool + 6 });
  if (error) throw error;
  const [cards, tagCounts] = await Promise.all([
    cardsByIds((data ?? []).map((r: { series_id: string }) => r.series_id), supabase),
    getAllTagCounts(),
  ]);
  const genreCounts = new Map(tagCounts.filter((t) => t.category === "genre").map((t) => [t.tag, t.n]));
  return cards.slice(0, pool).map((c) => {
    const shared = rarestShared(c.genre_tags, base.genre_tags, genreCounts, 2);
    const tags = shared.map((t) => `#${t}`).join(" ");
    const sameAuthor = Boolean(c.author && c.author === base.author);
    return { ...c, reason: sameAuthor ? ["同じ著者", tags].filter(Boolean).join(" · ") : tags };
  });
}

// ---------------------------------------------------------------------------
// ログインユーザーごとのデータ (キャッシュしない。Cookie のセッションで RLS が効く)
// ---------------------------------------------------------------------------

// あなたへのおすすめ (035 の recommend_for_me)。推薦理由は、元にした作品との関係から付ける
export async function getRecommendationsForMe(limit = 8): Promise<CardWithReason[]> {
  const supabase = await createClient();
  const [{ data, error }, fav, read] = await Promise.all([
    supabase.rpc("recommend_for_me", { p_limit: limit }),
    supabase.from("favorite_series").select("series_id").order("created_at", { ascending: false }).limit(50),
    supabase.from("read_series").select("series_id").limit(50),
  ]);
  if (error) throw error;
  const recIds = (data ?? []).map((r: { series_id: string }) => r.series_id);
  const sourceIds = [...new Set([...(fav.data ?? []), ...(read.data ?? [])].map((r) => r.series_id))];
  if (recIds.length === 0) return [];

  const [recs, sources, tagCounts] = await Promise.all([
    cardsByIds(recIds),
    cardsByIds(sourceIds),
    getAllTagCounts(),
  ]);
  const counts = new Map(tagCounts.map((t) => [t.tag, t.n]));
  const sourceTags = sources.flatMap((s) => [...s.genre_tags, ...s.sub_genre_tags]);
  const sourceFreq = new Map<string, number>();
  for (const t of sourceTags) sourceFreq.set(t, (sourceFreq.get(t) ?? 0) + 1);

  return recs.map((c) => {
    // 1. 同じ著者の作品が元にした作品にある
    const sameAuthor = sources.find((s) => s.author && s.author === c.author);
    if (sameAuthor) return { ...c, reason: `『${shorten(sameAuthor.series_title)}』と同じ著者` };
    // 2. 元にした作品と共通するタグのうち、珍しいもの
    const tags = [...c.genre_tags, ...c.sub_genre_tags];
    const shared = tags.filter((t) => sourceFreq.has(t)).sort((a, b) => (counts.get(a) ?? 0) - (counts.get(b) ?? 0));
    if (shared.length >= 2) return { ...c, reason: `${shared.slice(0, 2).map((t) => `#${t}`).join(" ")} がお気に入りに近い` };
    // 3. 元にした作品に多いタグ (傾向)
    const trend = tags.sort((a, b) => (sourceFreq.get(b) ?? 0) - (sourceFreq.get(a) ?? 0)).slice(0, 2);
    return { ...c, reason: trend.length ? `${trend.map((t) => `#${t}`).join(" ")} の傾向から` : undefined };
  });
}

function shorten(title: string, max = 12) {
  return Array.from(title).length > max ? `${Array.from(title).slice(0, max).join("")}…` : title;
}

export { cardsByIds };
