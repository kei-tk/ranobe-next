import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "さがす" };

// さがす (docs/ui-design.md §3.2)。絞り込みの表と結果はフェーズ3で実装する
export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <Suspense fallback={<SearchTitle q="" />}>
      <SearchHeader searchParams={searchParams} />
    </Suspense>
  );
}

async function SearchHeader({ searchParams }: { searchParams: PageProps<"/search">["searchParams"] }) {
  const { q } = await searchParams;
  return <SearchTitle q={typeof q === "string" ? q : ""} />;
}

function SearchTitle({ q }: { q: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">—件</span>
      <h1 className="m-0 text-[34px]">{q ? `「${q}」の検索結果` : "すべてのシリーズ"}</h1>
      <p className="pt-4 text-sm text-muted-foreground">(フェーズ3で、絞り込みの表と結果を表示します)</p>
    </div>
  );
}
