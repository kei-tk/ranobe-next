"use client";

import Link from "next/link";
import { useState } from "react";

import { CoverImage } from "@/components/common/cover-image";
import { Button } from "@/components/ui/button";
import { tagLine, type SeriesCard } from "@/features/series/types";
import { formatDotDate, formatVolumes } from "@/lib/format";

const STEP = 30;

// 新刊カレンダー (案 B の表。docs/ui-design.md §2.2)。候補は数十〜100件なのでまとめて受け取り、30行ずつ出す
export function ReleaseCalendar({ cards }: { cards: SeriesCard[] }) {
  const [shown, setShown] = useState(STEP);
  const grid = "grid grid-cols-[72px_52px_minmax(0,1fr)] gap-5 sm:grid-cols-[72px_52px_minmax(0,1fr)_140px_64px]";

  return (
    <section className="flex flex-col">
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b-2 border-foreground pb-3">
        <h2 className="m-0 text-[26px]">新刊カレンダー</h2>
        <span className="text-xs text-muted-foreground">{cards.length}シリーズ</span>
      </div>
      <div className={`${grid} border-b border-border py-2 text-[11px] tracking-[.06em] text-muted-foreground`} aria-hidden>
        <span>発売日</span>
        <span>書影</span>
        <span>タイトル / 著者</span>
        <span className="hidden sm:block">レーベル</span>
        <span className="hidden sm:block">巻数</span>
      </div>
      <ol className="m-0 list-none p-0">
        {cards.slice(0, shown).map((c) => (
          <li key={c.series_id}>
            <Link
              href={`/series/${c.series_id}`}
              className={`${grid} items-center border-b border-line py-3 text-foreground no-underline hover:bg-accent`}
            >
              <span className="text-xl font-extrabold tracking-[-.01em]">{formatDotDate(c.latest_published_date)}</span>
              <CoverImage src={c.cover_image_url} alt={c.series_title} sizes="52px" />
              <span className="flex min-w-0 flex-col gap-[3px]">
                <span className="text-[15px] leading-snug font-bold">{c.series_title}</span>
                <span className="text-xs text-muted-foreground">
                  {c.author}
                  {"　"}
                  {tagLine(c)}
                </span>
                {/* スマホではレーベル列と巻数列を消し、ここにまとめる */}
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
      {shown < cards.length ? (
        <Button variant="outline" className="mt-5 self-start" onClick={() => setShown((n) => n + STEP)}>
          さらに見る ({cards.length - shown}件)
        </Button>
      ) : null}
    </section>
  );
}
