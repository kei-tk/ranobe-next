import Link from "next/link";

import { tagLine, type CardWithReason } from "@/features/series/types";
import { formatDotDate, formatShortDate, formatVolumes } from "@/lib/format";
import { cn } from "@/lib/utils";

// 書影を使わない一覧 (design/mock-nocover「ラノベファインダー 書影なし」)。
//   syn   あらすじ型: タイトル・メタ情報・あらすじ3行・タグ。初期値
//   card  文字カード型: 罫線で区切ったマス目に、巻数を大きく
//   table 目録型: 行ごとの表
export type ListLayout = "syn" | "card" | "table";

export function SeriesList({
  cards,
  layout,
  highlight = [],
  lead = "date",
}: {
  cards: CardWithReason[];
  layout: ListLayout;
  // 選んでいるタグ (あらすじ型のチップを朱色の面にする)
  highlight?: string[];
  // 目録型の左端の列: 発売日 か 順位
  lead?: "date" | "rank";
}) {
  if (layout === "card") return <TextCardGrid cards={cards} />;
  if (layout === "table") return <SeriesTable cards={cards} lead={lead} />;
  return <SynopsisList cards={cards} highlight={highlight} />;
}

function metaLine(c: CardWithReason) {
  return [c.author, c.imprint, formatVolumes(c.volume_count), `${formatShortDate(c.latest_published_date)} 発売`]
    .filter(Boolean)
    .join(" · ");
}

// あらすじ型: 2列 (幅 440px 以上)。各作品の上に 2px の線
function SynopsisList({ cards, highlight }: { cards: CardWithReason[]; highlight: string[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,440px),1fr))] gap-x-8">
      {cards.map((c) => (
        <Link
          key={c.series_id}
          href={`/series/${c.series_id}`}
          className="group flex min-w-0 flex-col gap-1.5 border-t-2 border-border pt-[18px] pb-[22px] text-foreground no-underline"
        >
          {c.reason ? <span className="text-[11px] font-bold text-accent-text">{c.reason}</span> : null}
          <span className="text-[19px] leading-[1.4] font-extrabold text-pretty group-hover:text-accent-text">
            {c.series_title}
          </span>
          <span className="text-xs text-muted-foreground">{metaLine(c)}</span>
          {c.synopsis ? <span className="line-clamp-3 text-sm leading-[1.8]">{c.synopsis}</span> : null}
          <span className="mt-1 flex flex-wrap gap-1">
            {/* 「青春」のように分類をまたいで同じ名前のタグがあるので、重複を除いてから6個 */}
            {[...new Set([...c.genre_tags, ...c.atmosphere_tags, ...c.sub_genre_tags])].slice(0, 6).map((t) => (
              <span
                key={t}
                className={cn(
                  "px-2 py-0.5 text-[11px]",
                  highlight.includes(t) ? "bg-accent-tint text-accent-tint-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {t}
              </span>
            ))}
          </span>
        </Link>
      ))}
    </div>
  );
}

// 文字カード型: マス目 (最小 220px)。罫線は上と左を外枠に、各マスは右と下
function TextCardGrid({ cards }: { cards: CardWithReason[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] border-t border-l border-line">
      {cards.map((c) => (
        <Link
          key={c.series_id}
          href={`/series/${c.series_id}`}
          className="flex min-h-[212px] min-w-0 flex-col gap-2 border-r border-b border-line p-4 text-foreground no-underline hover:bg-muted"
        >
          <span className="flex items-start justify-between gap-3">
            <span className="flex min-w-0 flex-col gap-0.5">
              {c.reason ? <span className="text-[11px] leading-snug font-bold text-accent-text">{c.reason}</span> : null}
              <span className="text-[11px] font-bold text-muted-foreground">{c.imprint}</span>
            </span>
            {c.volume_count ? (
              <span className="flex shrink-0 items-baseline gap-0.5">
                <span className="text-4xl leading-[.9] font-extrabold tracking-[-.02em]">{c.volume_count}</span>
                <span className="text-[11px] font-bold">巻</span>
              </span>
            ) : null}
          </span>
          <span className="line-clamp-3 text-lg leading-[1.4] font-extrabold text-pretty">{c.series_title}</span>
          <span className="text-xs text-muted-foreground">{c.author}</span>
          <span className="mt-auto flex justify-between gap-2 border-t border-line pt-2.5 text-[11px] text-subtle-foreground">
            <span className="min-w-0 truncate">{tagLine(c)}</span>
            <span className="shrink-0">{formatShortDate(c.latest_published_date)}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}

// 目録型: 発売日 (または順位) | タイトル / 著者 | レーベル | 巻数。スマホではレーベルと巻数をタイトルの下にまとめる
function SeriesTable({ cards, lead }: { cards: CardWithReason[]; lead: "date" | "rank" }) {
  const grid = "grid grid-cols-[72px_minmax(0,1fr)] gap-5 sm:grid-cols-[72px_minmax(0,1fr)_140px_64px]";
  return (
    <div className="flex flex-col">
      <div className={`${grid} border-b border-border py-2 text-[11px] tracking-[.06em] text-muted-foreground`} aria-hidden>
        <span>{lead === "rank" ? "No." : "最新刊"}</span>
        <span>タイトル / 著者</span>
        <span className="hidden sm:block">レーベル</span>
        <span className="hidden sm:block">巻数</span>
      </div>
      <ol className="m-0 list-none p-0">
        {cards.map((c, i) => (
          <li key={c.series_id}>
            <Link
              href={`/series/${c.series_id}`}
              className={`${grid} items-center border-b border-line py-3 text-foreground no-underline hover:bg-accent`}
            >
              <span className="text-xl font-extrabold tracking-[-.01em]">
                {lead === "rank" ? String(i + 1).padStart(2, "0") : formatDotDate(c.latest_published_date)}
              </span>
              <span className="flex min-w-0 flex-col gap-[3px]">
                {c.reason ? <span className="text-[11px] font-bold text-accent-text">{c.reason}</span> : null}
                <span className="text-[15px] leading-snug font-bold">{c.series_title}</span>
                <span className="text-xs text-muted-foreground">
                  {c.author}
                  {"　"}
                  {tagLine(c)}
                </span>
                <span className="text-xs text-muted-foreground sm:hidden">
                  {[c.imprint, formatVolumes(c.volume_count)].filter(Boolean).join(" · ")}
                </span>
              </span>
              <span className="hidden text-[13px] sm:block">{c.imprint}</span>
              <span className="hidden text-[13px] sm:block">{formatVolumes(c.volume_count)}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
