"use client";

import { useState, useTransition } from "react";

import { SeriesGrid } from "@/components/series/series-card";
import { Button } from "@/components/ui/button";
import { toQueryString, type SearchState } from "@/features/search/params";
import type { SeriesCard } from "@/features/series/types";

// 検索結果 (書影 / リスト) と「さらに見る」。最初の48件はサーバーで描き、続きは /api/search から取る。
// 条件が変わると親が key を変えるので、ここの状態 (追加で読んだ分) もリセットされる
export function ResultsView({
  state,
  initial,
  total,
}: {
  state: SearchState;
  initial: SeriesCard[];
  total: number;
}) {
  const [cards, setCards] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  function loadMore() {
    startTransition(async () => {
      setFailed(false);
      const qs = toQueryString(state);
      const res = await fetch(`/api/search${qs || "?"}${qs ? "&" : ""}offset=${cards.length}`);
      if (!res.ok) {
        setFailed(true);
        return;
      }
      const data: { cards: SeriesCard[] } = await res.json();
      // 途中でデータが更新されて重なっても、同じ作品を2回出さない
      setCards((prev) => {
        const seen = new Set(prev.map((c) => c.series_id));
        return [...prev, ...data.cards.filter((c) => !seen.has(c.series_id))];
      });
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <SeriesGrid cards={cards} variant={state.view === "list" ? "list" : "cover"} />
      {cards.length < total ? (
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={loadMore} disabled={pending}>
            {pending ? "読み込み中…" : `さらに見る (残り${total - cards.length}件)`}
          </Button>
          {failed ? <span className="text-[13px] text-accent-text">読み込めませんでした。もう一度お試しください</span> : null}
        </div>
      ) : null}
    </div>
  );
}

