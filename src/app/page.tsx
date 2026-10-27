import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

import { SectionHeading } from "@/components/common/section-heading";
import { ReleaseCalendar } from "@/components/home/release-calendar";
import { RELEASE_COUNT, SeriesCollection } from "@/components/series/series-collection";
import { Button } from "@/components/ui/button";
import { getRecentReleases, getRecommendationsForMe } from "@/features/series/queries";
import { pickRandom } from "@/lib/random";
import { getCurrentUser } from "@/lib/supabase/server";
import { SHOW_COVERS } from "@/lib/variant";

// ホーム (docs/ui-design.md §3.1)
export default function HomePage() {
  return (
    <div className="flex flex-col gap-14">
      <Suspense fallback={<div className="h-24" aria-hidden />}>
        <ForYou /> 
      </Suspense>

      <section className="flex flex-col gap-5">
        <SectionHeading title="新作・新刊" note="最近発売された作品からランダムに表示" />
        <Suspense fallback={<GridSkeleton count={RELEASE_COUNT} />}>
          <RecentReleases />
        </Suspense>
      </section>

      <Suspense fallback={null}>
        <Calendar />
      </Suspense>
    </div>
  );
}

// 候補 (キャッシュ済み) から、表示のたびにランダムに12件を選ぶ
async function RecentReleases() {
  const candidates = await getRecentReleases();
  // ランダムな値はリクエストごとに変わるので、ここから先はリクエストのたびに描くと Next.js に伝える
  await connection();
  return <SeriesCollection cards={pickRandom(candidates, RELEASE_COUNT)} kind="release" />;
}

async function Calendar() {
  return <ReleaseCalendar cards={await getRecentReleases()} />;
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
  const recs = await getRecommendationsForMe(8);
  return (
    <section className="flex flex-col gap-5">
      <SectionHeading title="あなたへのおすすめ" note="お気に入り・読了した作品から選んでいます" />
      {recs.length ? (
        <SeriesCollection cards={recs} kind="recommend" />
      ) : (
        <p className="text-sm text-muted-foreground">
          作品の詳細ページで「お気に入りに追加」「読み終わった」を押すと、ここにおすすめが表示されます。
        </p>
      )}
    </section>
  );
}

function GridSkeleton({ count }: { count: number }) {
  if (SHOW_COVERS) {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(156px,1fr))] gap-x-5 gap-y-8" aria-hidden>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="flex flex-col gap-2.5">
            <div className="aspect-[3/4] animate-pulse bg-muted" />
            <div className="h-4 w-3/4 animate-pulse bg-muted" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,440px),1fr))] gap-x-8" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex flex-col gap-2 border-t-2 border-border pt-[18px] pb-[22px]">
          <div className="h-6 w-3/4 animate-pulse bg-muted" />
          <div className="h-3 w-1/2 animate-pulse bg-muted" />
          <div className="h-16 animate-pulse bg-muted" />
        </div>
      ))}
    </div>
  );
}
