import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { SeriesList } from "@/components/series/series-list";
import { VolumeTable } from "@/components/series/volume-table";
import { Button } from "@/components/ui/button";
import { LibraryActions } from "@/components/user/library-actions";
import { searchHref } from "@/features/search/params";
import { getSeriesDetail, getSimilarSeries } from "@/features/series/queries";
import type { SeriesCard } from "@/features/series/types";
import { getLibraryStatus } from "@/features/user/library";
import { formatDotDate } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/series/[id]">): Promise<Metadata> {
  const detail = await getSeriesDetail((await params).id);
  if (!detail) return { title: "見つかりません" };
  const { series } = detail;
  const description = series.tagline ?? series.synopsis?.slice(0, 120) ?? undefined;
  return { title: series.series_title, description, openGraph: { title: series.series_title, description } };
}

// 作品詳細 (書影なし版。design/mock-nocover「03 作品詳細」)。
// 作品の情報はキャッシュし、お気に入り・読了の状態だけをリクエストごとに描く
export default function SeriesPage({ params }: PageProps<"/series/[id]">) {
  return (
    <div className="flex flex-col gap-9">
      <Button asChild variant="ghost" className="self-start px-1 text-foreground hover:text-accent-text">
        <Link href="/search">
          <ArrowLeft />
          検索結果に戻る
        </Link>
      </Button>
      <Suspense fallback={<div className="h-96" aria-hidden />}>
        <SeriesBody params={params} />
      </Suspense>
    </div>
  );
}

async function SeriesBody({ params }: { params: PageProps<"/series/[id]">["params"] }) {
  const { id } = await params;
  const detail = await getSeriesDetail(id);
  if (!detail) notFound();
  const { series, volumes } = detail;
  const year = series.latest_published_date?.slice(0, 4);

  const tagRows = [
    { label: "ジャンル", key: "genres", tags: series.genre_tags },
    { label: "雰囲気", key: "atmospheres", tags: series.atmosphere_tags },
    { label: "サブジャンル", key: "subGenres", tags: series.sub_genre_tags },
  ] as const;

  return (
    <>
      <div className="flex max-w-[52em] flex-col gap-3">
        <h1 className="m-0 text-[clamp(30px,6vw,44px)] leading-[1.25] text-pretty">{series.series_title}</h1>
        <span className="text-base">
          {series.author ? (
            <Link href={searchHref({ author: series.author })} className="text-foreground hover:text-accent-text">
              {series.author}
            </Link>
          ) : null}
          {series.illustrator ? (
            <span className="text-muted-foreground">　／ イラスト {series.illustrator}</span>
          ) : null}
        </span>
      </div>

      <div className="flex flex-col gap-5">
        {/* 巻数・最新刊・レーベルを大きな数字で並べる帯 */}
        <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] border-t-2 border-b-2 border-t-foreground border-b-border">
          <Stat label="巻数" num={series.volume_count ? String(series.volume_count) : "—"} unit={series.volume_count ? "巻" : ""} />
          <Stat label="最新刊" num={formatDotDate(series.latest_published_date)} unit={year ?? ""} />
          <Stat label="レーベル" text={series.imprint ?? "—"} />
        </dl>
        <Suspense fallback={<div className="h-9" aria-hidden />}>
          <Library seriesId={series.series_id} />
        </Suspense>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] gap-12">
        <div className="flex flex-col gap-2.5">
          <h2 className="m-0 text-[13px] tracking-[.08em]">あらすじ</h2>
          <p className="m-0 max-w-[38em] text-base leading-[2] text-pretty">
            {series.synopsis ?? <span className="text-muted-foreground">あらすじは登録されていません。</span>}
          </p>
        </div>
        <div className="flex flex-col gap-2.5">
          <h2 className="m-0 text-[13px] tracking-[.08em]">タグ</h2>
          <dl className="m-0 flex flex-col border-t-2 border-border">
            {tagRows
              .filter((r) => r.tags.length)
              .map((r) => (
                <div key={r.key} className="grid grid-cols-[96px_minmax(0,1fr)] items-baseline gap-3 border-b border-line py-2.5">
                  <dt className="text-xs text-muted-foreground">{r.label}</dt>
                  <dd className="m-0 flex flex-wrap gap-1.5">
                    {r.tags.map((t) => (
                      <Link
                        key={t}
                        href={searchHref({ [r.key]: [t] })}
                        className="border border-brand px-2.5 py-[3px] text-[13px] text-accent-text no-underline hover:bg-accent-tint"
                      >
                        {t}
                      </Link>
                    ))}
                  </dd>
                </div>
              ))}
          </dl>
        </div>
      </div>

      {volumes.length ? (
        <div className="flex flex-col gap-2.5">
          <h2 className="m-0 text-[13px] tracking-[.08em]">巻一覧</h2>
          <VolumeTable volumes={volumes} />
        </div>
      ) : null}

      <section className="flex flex-col gap-5">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-t-2 border-foreground pt-3.5">
          <h2 className="m-0 text-[26px]">似ているシリーズ</h2>
          <span className="text-xs text-muted-foreground">他の作品のおすすめ</span>
        </div>
        <Suspense fallback={<div className="h-64" aria-hidden />}>
          <Similar base={series} />
        </Suspense>
      </section>
    </>
  );
}

function Stat({ label, num, text, unit }: { label: string; num?: string; text?: string; unit?: string }) {
  return (
    <div className="mr-4 flex flex-col gap-1.5 border-r border-line pt-3.5 pr-4 pb-4 last:border-r-0">
      <dt className="text-[11px] tracking-[.06em] text-muted-foreground">{label}</dt>
      <dd className="m-0 flex min-h-11 items-baseline gap-1">
        {num ? <span className="text-[44px] leading-none font-extrabold tracking-[-.02em]">{num}</span> : null}
        {text ? <span className="text-2xl leading-[1.3] font-extrabold">{text}</span> : null}
        {unit ? <span className="text-[13px] font-bold text-muted-foreground">{unit}</span> : null}
      </dd>
    </div>
  );
}

async function Library({ seriesId }: { seriesId: string }) {
  return <LibraryActions seriesId={seriesId} initial={await getLibraryStatus(seriesId)} />;
}

async function Similar({ base }: { base: SeriesCard }) {
  const similar = await getSimilarSeries(base, 6);
  if (!similar.length) return <p className="text-sm text-muted-foreground">似ている作品が見つかりませんでした。</p>;
  return <SeriesList cards={similar} layout="syn" />;
}
