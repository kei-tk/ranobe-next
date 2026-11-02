import { FIRST_ROW, SeriesGrid, SeriesRow } from "@/components/series/series-card";
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
  if (!SHOW_COVERS) return <SeriesList cards={cards} layout="syn" />;
  // おすすめ・新作・似ているシリーズは横スクロールの1行にする
  if (ROW.has(kind)) {
    return (
      <SeriesRow cards={cards} variant={COVER_VARIANT[kind]} eagerCount={ABOVE_FOLD.has(kind) ? FIRST_ROW.row : 0} />
    );
  }
  return <SeriesGrid cards={cards} variant={COVER_VARIANT[kind]} />;
}

const ROW = new Set<keyof typeof COVER_VARIANT>(["recommend", "release", "similar"]);
// ホームの上に出るもの。どちらが最初に見えるかはログイン状態で変わるので、両方の先頭をすぐ読み込む
const ABOVE_FOLD = new Set<keyof typeof COVER_VARIANT>(["recommend", "release"]);

// 新作・新刊のランダム表示の件数。あらすじ型は1件が大きいのでデザインどおり6件
export const RELEASE_COUNT = SHOW_COVERS ? 12 : 6;
