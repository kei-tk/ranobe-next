import Link from "next/link";
import { Suspense } from "react";

import { SectionHeading } from "@/components/common/section-heading";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/supabase/server";

// ホーム (docs/ui-design.md §3.1)。中身のカードはフェーズ3で実装する
export default function HomePage() {
  return (
    <div className="flex flex-col gap-14">
      <Suspense fallback={<div className="h-24" aria-hidden />}>
        <ForYou />
      </Suspense>

      <section className="flex flex-col gap-5">
        <SectionHeading title="新作・新刊" note="最近発売された作品からランダムに表示" />
        <p className="text-sm text-muted-foreground">(フェーズ3で、最近30日に発売された作品から12件を表示します)</p>
      </section>

      <section className="flex flex-col">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b-2 border-foreground pb-3">
          <h2 className="m-0 text-[26px]">新刊カレンダー</h2>
        </div>
        <p className="pt-4 text-sm text-muted-foreground">(フェーズ3で、発売日の新しい順の表を表示します)</p>
      </section>
    </div>
  );
}

// 「あなたへのおすすめ」はログイン状態で中身が変わるので、Suspense で分けてリクエストごとに描く
async function ForYou() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="flex flex-wrap items-center gap-5 bg-muted px-5 py-4">
        <div className="flex flex-[1_1_320px] flex-col gap-0.5">
          <span className="text-base font-extrabold">あなたへのおすすめ</span>
          <span className="text-[13px] text-muted-foreground">
            ログインすると、お気に入り・読了した作品をもとにおすすめが表示されます。
          </span>
        </div>
        <Button asChild>
          <Link href="/auth">ログイン</Link>
        </Button>
      </div>
    );
  }
  return (
    <section className="flex flex-col gap-5">
      <SectionHeading title="あなたへのおすすめ" note="お気に入り・読了した作品から選んでいます" />
      <p className="text-sm text-muted-foreground">(フェーズ3で recommend_for_me の結果を表示します)</p>
    </section>
  );
}
