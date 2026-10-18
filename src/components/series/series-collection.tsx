import { SeriesGrid } from "@/components/series/series-card";
import { SeriesList } from "@/components/series/series-list";
import type { CardWithReason } from "@/features/series/types";
import { SHOW_COVERS } from "@/lib/variant";

// ホーム・似ているシリーズ・マイページの作品の並べ方。版によって切り替える
//   書影あり: 書影のカード (用途ごとに出す情報が違う)
//   書影なし: あらすじ型
const COVER_VARIANT = {
  recommend: "recommend",
  release: "release",
  similar: "similar",
  library: "list",
} as const;

export function SeriesCollection({
  cards,
  kind,
}: {
  cards: CardWithReason[];
  kind: keyof typeof COVER_VARIANT;
}) {
  return SHOW_COVERS ? <SeriesGrid cards={cards} variant={COVER_VARIANT[kind]} /> : <SeriesList cards={cards} layout="syn" />;
}

// 新作・新刊のランダム表示の件数。あらすじ型は1件が大きいのでデザインどおり6件
export const RELEASE_COUNT = SHOW_COVERS ? 12 : 6;
