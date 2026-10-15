import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { SectionHeading } from "@/components/common/section-heading";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "マイページ" };

// マイページ (ログイン必須)。お気に入り・読了の一覧とプロフィールの編集はフェーズ3で実装する
export default function AccountPage() {
  return (
    <Suspense fallback={<div className="h-32" aria-hidden />}>
      <Account />
    </Suspense>
  );
}

async function Account() {
  // proxy.ts でも未ログインは /auth に移しているが、ページ側でも確かめる (proxy だけに頼らない)
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/account");

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">{user.email}</span>
        <h1 className="m-0 text-[34px]">{user.displayName} さんのマイページ</h1>
      </div>
      <section className="flex flex-col gap-5">
        <SectionHeading title="お気に入り" />
        <p className="text-sm text-muted-foreground">(フェーズ3で表示します)</p>
      </section>
      <section className="flex flex-col gap-5">
        <SectionHeading title="読了" />
        <p className="text-sm text-muted-foreground">(フェーズ3で表示します)</p>
      </section>
    </div>
  );
}
