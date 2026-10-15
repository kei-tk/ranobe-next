import Link from "next/link";
import { Suspense } from "react";

import { HeaderNav, NavLinks } from "@/components/layout/header-nav";
import { HeaderSearch } from "@/components/layout/header-search";
import { HeaderUser } from "@/components/layout/header-user";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Input } from "@/components/ui/input";

// sticky のヘッダー (docs/ui-design.md §2)。ログイン状態は Cookie を読むので Suspense で分け、
// ほかの部分は先に描けるようにする
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b-2 border-border bg-background">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 text-foreground no-underline">
          <span aria-hidden className="block size-[18px] bg-brand" />
          <span className="text-[19px] font-black">ラノベファインダー</span>
        </Link>
        <Suspense fallback={<NavLinks />}>
          <HeaderNav />
        </Suspense>
        <div className="order-last w-full sm:order-none sm:w-auto sm:max-w-[460px] sm:flex-[1_1_280px]">
          {/* useSearchParams を使う部品は、Suspense の中に置く必要がある */}
          <Suspense fallback={<Input disabled placeholder="タイトル・著者名・タグで検索" aria-label="検索" />}>
            <HeaderSearch />
          </Suspense>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
          <Suspense fallback={<span className="block h-9 w-24" aria-hidden />}>
            <HeaderUser />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
