"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";

const DEBOUNCE_MS = 300;

// 入力に合わせて「さがす」の結果を絞り込む (docs/ui-design.md §3.2)。
// 打つたびに送らず、300ms 入力が止まってから URL の q を書き換える
export function HeaderSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 戻るボタンなどで URL の q が変わったら、入力欄も合わせる
  const urlQuery = params.get("q") ?? "";
  const [lastUrlQuery, setLastUrlQuery] = useState(urlQuery);
  if (urlQuery !== lastUrlQuery) {
    setLastUrlQuery(urlQuery);
    setValue(urlQuery);
  }

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function push(q: string) {
    // さがす画面の中ではほかの条件 (タグ・並び順など) を残し、ほかの画面からは q だけで移る
    const next = new URLSearchParams(pathname.startsWith("/search") ? params : undefined);
    if (q.trim()) next.set("q", q.trim());
    else next.delete("q");
    next.delete("offset");
    const url = `/search${next.size ? `?${next}` : ""}`;
    if (pathname.startsWith("/search")) router.replace(url, { scroll: false });
    else router.push(url);
  }

  return (
    <form
      role="search"
      className="relative flex items-center"
      onSubmit={(e) => {
        e.preventDefault();
        if (timer.current) clearTimeout(timer.current);
        push(value);
      }}
    >
      <Search aria-hidden className="pointer-events-none absolute left-2.5 size-4 opacity-60" />
      <Input
        type="search"
        name="q"
        value={value}
        onChange={(e) => {
          const q = e.target.value;
          setValue(q);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => push(q), DEBOUNCE_MS);
        }}
        placeholder="タイトル・著者名・タグで検索"
        aria-label="タイトル・著者名・タグで検索"
        className="pl-8"
      />
    </form>
  );
}
