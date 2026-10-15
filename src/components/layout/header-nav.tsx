"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "ホーム", match: (p: string) => p === "/" },
  { href: "/search", label: "さがす", match: (p: string) => p.startsWith("/search") },
] as const;

// 今いるページを朱色にする。URL は実行時にしか分からないので、ヘッダーでは Suspense で包み、
// 先に描く部分 (fallback) では NavLinks を pathname なしで出す
export function HeaderNav() {
  return <NavLinks pathname={usePathname()} />;
}

export function NavLinks({ pathname }: { pathname?: string }) {
  return (
    <nav aria-label="メイン" className="flex gap-1">
      {ITEMS.map(({ href, label, match }) => {
        const active = pathname !== undefined && match(pathname);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "px-2.5 py-1.5 text-sm font-bold no-underline transition-colors hover:text-accent-text",
              active ? "text-accent-text" : "text-foreground",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
