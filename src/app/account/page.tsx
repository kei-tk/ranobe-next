import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { SectionHeading } from "@/components/common/section-heading";
import { SeriesCollection } from "@/components/series/series-collection";
import { cardsByIds } from "@/features/series/queries";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "マイページ" };

// マイページ (ログイン必須)。プロフィールの編集は次の段階で足す
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

  // RLS で本人の行しか読めない
  const supabase = await createClient();
  const [fav, read] = await Promise.all([
    supabase.from("favorite_series").select("series_id").order("created_at", { ascending: false }),
    supabase.from("read_series").select("series_id").order("finished_at", { ascending: false }),
  ]);
  const [favorites, reads] = await Promise.all([
    cardsByIds((fav.data ?? []).map((r) => r.series_id)),
    cardsByIds((read.data ?? []).map((r) => r.series_id)),
  ]);

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">{user.email}</span>
        <h1 className="m-0 text-[34px]">{user.displayName} さんのマイページ</h1>
      </div>
      <section className="flex flex-col gap-5">
        <SectionHeading title="お気に入り" note={`${favorites.length}作品`} />
        {favorites.length ? (
          <SeriesCollection cards={favorites} kind="library" />
        ) : (
          <p className="text-sm text-muted-foreground">作品の詳細ページで「お気に入りに追加」を押すと、ここに並びます。</p>
        )}
      </section>
      <section className="flex flex-col gap-5">
        <SectionHeading title="読了" note={`${reads.length}作品`} />
        {reads.length ? (
          <SeriesCollection cards={reads} kind="library" />
        ) : (
          <p className="text-sm text-muted-foreground">作品の詳細ページで「読み終わった」を押すと、ここに並びます。</p>
        )}
      </section>
    </div>
  );
}
