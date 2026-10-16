import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { FacetTable } from "@/components/search/facet-table";
import { ResultsView } from "@/components/search/results-view";
import { SearchControls, SelectedTags } from "@/components/search/search-controls";
import { Button } from "@/components/ui/button";
import { parseSearchState, searchHref, selectedTags, toQueryString, type SearchState } from "@/features/search/params";
import { facetCounts, searchSeries } from "@/features/search/queries";
import { getAllTagCounts } from "@/features/series/queries";

export const metadata: Metadata = { title: "さがす" };

// さがす (docs/ui-design.md §3.2)。条件はすべて URL クエリに持ち、変わるたびにサーバーで描き直す
export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchBody searchParams={searchParams} />
    </Suspense>
  );
}

function titleOf(s: SearchState) {
  if (s.q) return `「${s.q}」の検索結果`;
  if (s.author) return `${s.author} の作品`;
  if (selectedTags(s).length) return "タグで絞り込み";
  return "すべてのシリーズ";
}

async function SearchBody({ searchParams }: { searchParams: PageProps<"/search">["searchParams"] }) {
  const state = parseSearchState(await searchParams);
  const [result, counts, allTags] = await Promise.all([
    searchSeries(state, 0),
    facetCounts(state.q, state.author),
    getAllTagCounts(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">{result.total.toLocaleString()}件</span>
        <h1 className="m-0 text-[34px]">{titleOf(state)}</h1>
      </div>

      <div className="flex flex-col">
        <FacetTable state={state} counts={counts} allTags={allTags} />
        <SearchControls state={state} />
      </div>

      <SelectedTags state={state} />

      {result.total === 0 ? (
        <div className="flex flex-col items-start gap-3 py-10">
          <span className="text-lg font-extrabold">該当するシリーズが見つかりませんでした</span>
          <span className="text-[13px] text-muted-foreground">
            タグを減らすか、条件を「いずれか（OR）」にしてみてください。
          </span>
          <Button asChild variant="outline">
            <Link href={searchHref({ view: state.view })}>条件をリセット</Link>
          </Button>
        </div>
      ) : (
        // 条件が変わったら「さらに見る」で読んだ分を捨てる
        <ResultsView key={toQueryString(state)} state={state} initial={result.cards} total={result.total} />
      )}
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden>
      <div className="flex flex-col gap-1">
        <span className="h-4 w-12 animate-pulse bg-muted" />
        <span className="h-10 w-64 animate-pulse bg-muted" />
      </div>
      <div className="h-48 animate-pulse border-t-2 border-foreground bg-muted/50" />
    </div>
  );
}
