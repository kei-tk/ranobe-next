import Link from "next/link";

import {
  CATEGORY_KEYS,
  searchHref,
  toggleTag,
  type Category,
  type SearchState,
} from "@/features/search/params";
import type { FacetCount } from "@/features/search/queries";
import { cn } from "@/lib/utils";

const LABELS: Record<Category, string> = { genre: "ジャンル", atmosphere: "雰囲気", sub_genre: "サブジャンル" };
// サブジャンルは 900 近くあるので、最初は件数の多い順に 30 個だけ出し、残りは「すべて表示」で開く
const VISIBLE: Record<Category, number> = { genre: 99, atmosphere: 99, sub_genre: 30 };

// 絞り込みの表 (docs/ui-design.md §3.2)。チップの件数は「入力した語だけで絞った集合」で数えたもの。
// 一覧に出すタグの種類は、条件なしのときに存在するタグ (allTags) で決める (0件のチップも薄く出すため)
export function FacetTable({
  state,
  counts,
  allTags,
}: {
  state: SearchState;
  counts: FacetCount[];
  allTags: FacetCount[];
}) {
  const countOf = new Map(counts.map((c) => [`${c.category}:${c.tag}`, c.n]));

  return (
    <div className="flex flex-col border-t-2 border-foreground">
      {(Object.keys(LABELS) as Category[]).map((category) => {
        const selected = state[CATEGORY_KEYS[category]];
        const tags = allTags
          .filter((t) => t.category === category)
          .map((t) => ({ tag: t.tag, n: countOf.get(`${category}:${t.tag}`) ?? 0 }))
          // 選んだもの → 件数の多い順。サブジャンルは件数の差が大きいので、多い順に並べないと探せない
          .sort((a, b) => Number(selected.includes(b.tag)) - Number(selected.includes(a.tag)) || b.n - a.n);
        const visible = tags.slice(0, VISIBLE[category]);
        const rest = tags.slice(VISIBLE[category]);

        return (
          <div key={category} className="grid grid-cols-[110px_minmax(0,1fr)] items-start gap-4 border-b border-line py-3 max-sm:grid-cols-1 max-sm:gap-2">
            <div className="flex items-baseline gap-2 pt-[5px] text-[13px] font-extrabold">
              {LABELS[category]}
              {selected.length ? <span className="text-[11px] text-accent-text">{selected.length}件選択</span> : null}
            </div>
            <div className="flex flex-col gap-2">
              <ChipList state={state} category={category} tags={visible} selected={selected} />
              {rest.length ? (
                <details className="group">
                  <summary className="w-fit cursor-pointer list-none text-[13px] font-extrabold text-accent-text hover:underline">
                    <span className="group-open:hidden">すべて表示 (ほか{rest.length}件)</span>
                    <span className="hidden group-open:inline">閉じる</span>
                  </summary>
                  <div className="pt-2">
                    <ChipList state={state} category={category} tags={rest} selected={selected} />
                  </div>
                </details>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ChipList({
  state,
  category,
  tags,
  selected,
}: {
  state: SearchState;
  category: Category;
  tags: { tag: string; n: number }[];
  selected: string[];
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map(({ tag, n }) => {
        const on = selected.includes(tag);
        const base = "inline-flex items-center gap-1.5 border px-2.5 py-[5px] text-[13px] no-underline transition-colors";
        // 0件のチップは押せない (選んでいるものは外せるように押せるまま)
        if (n === 0 && !on) {
          return (
            <span key={tag} aria-disabled className={cn(base, "border-chip-border text-foreground opacity-40")}>
              {tag}
              <span className="text-[11px] opacity-75">0</span>
            </span>
          );
        }
        return (
          <Link
            key={tag}
            href={searchHref(toggleTag(state, category, tag))}
            scroll={false}
            aria-pressed={on}
            className={cn(
              base,
              on
                ? "border-primary bg-primary text-primary-foreground hover:bg-primary-hover"
                : "border-chip-border text-foreground hover:border-brand",
            )}
          >
            {tag}
            <span className="text-[11px] opacity-75">{n}</span>
          </Link>
        );
      })}
    </div>
  );
}
