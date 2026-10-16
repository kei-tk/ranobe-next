import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CoverImage } from "@/components/common/cover-image";
import { SeriesGrid } from "@/components/series/series-card";
import { VolumeTable } from "@/components/series/volume-table";
import { Button } from "@/components/ui/button";
import { LibraryActions } from "@/components/user/library-actions";
import { searchHref } from "@/features/search/params";
import { getSeriesDetail, getSimilarSeries } from "@/features/series/queries";
import type { SeriesCard } from "@/features/series/types";
import { getLibraryStatus } from "@/features/user/library";
import { formatLongDate, formatVolumes } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/series/[id]">): Promise<Metadata> {
  const detail = await getSeriesDetail((await params).id);
  if (!detail) return { title: "見つかりません" };
  const { series } = detail;
  const description = series.tagline ?? series.synopsis?.slice(0, 120) ?? undefined;
  return {
    title: series.series_title,
    description,
    openGraph: {
      title: series.series_title,
      description,
      images: series.cover_image_url ? [series.cover_image_url] : undefined,
    },
  };
}

// 作品詳細 (docs/ui-design.md §3.3)。作品の情報はキャッシュし、お気に入り・読了の状態だけをリクエストごとに描く
export default function SeriesPage({ params }: PageProps<"/series/[id]">) {
  return (
    <div className="flex flex-col gap-12">
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

  const tagRows = [
    { label: "ジャンル", key: "genres", tags: series.genre_tags },
    { label: "雰囲気", key: "atmospheres", tags: series.atmosphere_tags },
    { label: "サブジャンル", key: "subGenres", tags: series.sub_genre_tags },
  ] as const;

  return (
    <>
      <div className="flex flex-wrap items-start gap-12">
        <div className="w-full max-w-[280px] min-w-[220px] flex-[0_1_280px]">
          <CoverImage src={series.cover_image_url} alt={series.series_title} sizes="280px" priority />
        </div>
        <div className="flex min-w-0 flex-[1_1_440px] flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-accent-text">
              {[series.imprint, formatVolumes(series.volume_count), `最新刊 ${formatLongDate(series.latest_published_date)}`]
                .filter(Boolean)
                .join(" ／ ")}
            </span>
            <h1 className="m-0 text-[34px] leading-[1.3] text-pretty">{series.series_title}</h1>
            <span className="text-[15px]">
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

          <Suspense fallback={<div className="h-9" aria-hidden />}>
            <Library seriesId={series.series_id} />
          </Suspense>

          {series.synopsis ? (
            <div className="flex flex-col gap-2.5">
              <h2 className="m-0 text-[13px] tracking-[.08em]">あらすじ</h2>
              <p className="m-0 max-w-[38em] text-[15px] leading-[1.95] text-pretty">{series.synopsis}</p>
            </div>
          ) : null}

          {volumes.length ? (
            <div className="flex flex-col gap-2.5">
              <h2 className="m-0 text-[13px] tracking-[.08em]">巻一覧</h2>
              <VolumeTable volumes={volumes} />
            </div>
          ) : null}
        </div>
      </div>

      <section className="flex flex-col gap-5">
        <div className="flex flex-wrap items-baseline gap-3.5 border-t-2 border-foreground pt-3.5">
          <h2 className="m-0 text-2xl">似ているシリーズ</h2>
          <span className="text-xs text-muted-foreground">他の作品のおすすめ</span>
        </div>
        <Suspense fallback={<div className="h-64" aria-hidden />}>
          <Similar base={series} />
        </Suspense>
      </section>
    </>
  );
}

async function Library({ seriesId }: { seriesId: string }) {
  return <LibraryActions seriesId={seriesId} initial={await getLibraryStatus(seriesId)} />;
}

async function Similar({ base }: { base: SeriesCard }) {
  const similar = await getSimilarSeries(base, 6);
  if (!similar.length) return <p className="text-sm text-muted-foreground">似ている作品が見つかりませんでした。</p>;
  return <SeriesGrid cards={similar} variant="similar" />;
}
