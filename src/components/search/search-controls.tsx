import { X } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { searchHref, selectedTags, toggleTag, type SearchState } from "@/features/search/params";
import { cn } from "@/lib/utils";

// 2〜3択の切り替え (Segmented)。URL を書き換えるリンクにしているので、JavaScript が無くても動く
function Segmented<T extends string>({
  label,
  value,
  options,
  href,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  href: (v: T) => string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div role="group" aria-label={label} className="inline-flex border border-border">
        {options.map((o, i) => (
          <Link
            key={o.value}
            href={href(o.value)}
            scroll={false}
            aria-current={o.value === value ? "true" : undefined}
            className={cn(
              "px-3 py-[7px] text-[13px] no-underline transition-colors",
              i > 0 && "border-l border-border",
              o.value === value ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent",
            )}
          >
            {o.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function SearchControls({ state }: { state: SearchState }) {
  const hasFilter = Boolean(state.q || state.author || selectedTags(state).length);
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b-2 border-border py-3">
      <Segmented
        label="複数タグの条件"
        value={state.mode}
        options={[
          { value: "and", label: "すべて含む（AND）" },
          { value: "or", label: "いずれか（OR）" },
        ]}
        href={(mode) => searchHref({ ...state, mode })}
      />
      <Segmented
        label="並び順"
        value={state.sort}
        options={[
          { value: "new", label: "新しい順" },
          { value: "popularity", label: "人気順" },
          { value: "title", label: "タイトル順" },
        ]}
        href={(sort) => searchHref({ ...state, sort })}
      />
      <Segmented
        label="表示"
        value={state.view}
        options={[
          { value: "card", label: "カード" },
          { value: "table", label: "表" },
          { value: "syn", label: "あらすじ" },
        ]}
        href={(view) => searchHref({ ...state, view })}
      />
      {hasFilter ? (
        <Button asChild variant="ghost" className="ml-auto px-1">
          <Link href={searchHref({ view: state.view })} scroll={false}>
            条件をリセット
          </Link>
        </Button>
      ) : null}
    </div>
  );
}

// 「すべて含む：〇〇 ×」(選んだタグを外せる)
export function SelectedTags({ state }: { state: SearchState }) {
  const tags = selectedTags(state);
  if (!tags.length && !state.author) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {state.author ? (
        <Link
          href={searchHref({ ...state, author: "" })}
          scroll={false}
          className="inline-flex items-center gap-1.5 bg-accent-tint py-1 pr-2 pl-2.5 text-xs text-accent-tint-foreground no-underline hover:bg-[color-mix(in_srgb,var(--brand)_18%,transparent)]"
        >
          著者: {state.author}
          <X className="size-3" aria-label="外す" />
        </Link>
      ) : null}
      {tags.length ? (
        <span className="text-xs text-muted-foreground">{state.mode === "and" ? "すべて含む：" : "いずれかを含む："}</span>
      ) : null}
      {tags.map(({ category, tag }) => (
        <Link
          key={`${category}:${tag}`}
          href={searchHref(toggleTag(state, category, tag))}
          scroll={false}
          className="inline-flex items-center gap-1.5 bg-accent-tint py-1 pr-2 pl-2.5 text-xs text-accent-tint-foreground no-underline hover:bg-[color-mix(in_srgb,var(--brand)_18%,transparent)]"
        >
          {tag}
          <X className="size-3" aria-label="外す" />
        </Link>
      ))}
    </div>
  );
}
