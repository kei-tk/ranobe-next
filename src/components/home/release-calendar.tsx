"use client";

import { useState } from "react";

import { SeriesList } from "@/components/series/series-list";
import { Button } from "@/components/ui/button";
import type { SeriesCard } from "@/features/series/types";

const STEP = 30;

// 新刊カレンダー (目録型の表。書影の列なし)。候補は数十〜100件なのでまとめて受け取り、30行ずつ出す
export function ReleaseCalendar({ cards }: { cards: SeriesCard[] }) {
  const [shown, setShown] = useState(STEP);

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-t-2 border-foreground pt-3.5">
        <h2 className="m-0 text-[26px]">新刊カレンダー</h2>
        <span className="text-xs text-muted-foreground">{cards.length}シリーズ</span>
      </div>
      <SeriesList cards={cards.slice(0, shown)} layout="table" lead="date" />
      {shown < cards.length ? (
        <Button variant="outline" className="self-start" onClick={() => setShown((n) => n + STEP)}>
          さらに見る ({cards.length - shown}件)
        </Button>
      ) : null}
    </section>
  );
}
