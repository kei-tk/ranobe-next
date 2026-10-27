import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { CoverImage } from "@/components/common/cover-image";
import { SeriesCollection } from "@/components/series/series-collection";
import { VolumeTable } from "@/components/series/volume-table";
import { Button } from "@/components/ui/button";
import { LibraryActions } from "@/components/user/library-actions";
import { searchHref } from "@/features/search/params";
import { getSeriesDetail, getSimilarSeries } from "@/features/series/queries";
import type { SeriesCard, SeriesDetail, Volume } from "@/features/series/types";
import { getLibraryStatus } from "@/features/user/library";
import { formatDotDate, formatLongDate, formatVolumes } from "@/lib/format";
import { pickRandom } from "@/lib/random";
import { SHOW_COVERS } from "@/lib/variant";

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
      // 書影なしの版では OGP にも書影を使わない
      images: SHOW_COVERS && series.cover_image_url ? [series.cover_image_url] : undefined,
    },
  };
}

// 作品詳細。作品の情報はキャッシュし、お気に入り・読了の状態だけをリクエストごとに描く
//   書影あり: docs/ui-design.md §3.3 (左に書影、右に情報)
//   書影なし: design/mock-nocover「03 作品詳細」(大きなタイトルと、巻数・最新刊・レーベルの帯)
export default function SeriesPage({ params }: PageProps<"/series/[id]">) {
  return (
    <div className={SHOW_COVERS ? "flex flex-col gap-12" : "flex flex-col gap-9"}>
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

  return (
    <>
      {SHOW_COVERS ? <CoverLayout series={series} volumes={volumes} /> : <TextLayout series={series} volumes={volumes} />}
      <section className="flex flex-col gap-5">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-t-2 border-foreground pt-3.5">
          <h2 className={SHOW_COVERS ? "m-0 text-2xl" : "m-0 text-[26px]"}>似ているシリーズ</h2>
          <span className="text-xs text-muted-foreground">他の作品のおすすめ</span>
        </div>
        <Suspense fallback={<div className="h-64" aria-hidden />}>
          <Similar base={series} />
        </Suspense>
      </section>
    </>
  );
}

// 書影ありの版: 左に書影、右にメタ情報・タグ・ボタン・あらすじ・巻一覧
function CoverLayout({ series, volumes }: { series: SeriesDetail; volumes: Volume[] }) {
  return (
    <div className="flex flex-wrap items-start gap-12">
      <div className="w-full max-w-[280px] min-w-[220px] flex-[0_1_280px]">
        <CoverImage src={series.cover_image_url} alt={series.series_title} sizes="280px" preload />
      </div>
      <div className="flex min-w-0 flex-[1_1_440px] flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-accent-text">
            {[series.imprint, formatVolumes(series.volume_count), `最新刊 ${formatLongDate(series.latest_published_date)}`]
              .filter(Boolean)
              .join(" ／ ")}
          </span>
          <h1 className="m-0 text-[34px] leading-[1.3] text-pretty">{series.series_title}</h1>
          <Credits series={series} className="text-[15px]" />
        </div>
        <TagTable series={series} />
        <Suspense fallback={<div className="h-9" aria-hidden />}>
          <Library seriesId={series.series_id} />
        </Suspense>
        {series.synopsis ? (
          <div className="flex flex-col gap-2.5">
            <SubHeading>あらすじ</SubHeading>
            <p className="m-0 max-w-[38em] text-[15px] leading-[1.95] text-pretty">{series.synopsis}</p>
          </div>
        ) : null}
        <Volumes volumes={volumes} />
      </div>
    </div>
  );
}

// 書影なしの版: 大きなタイトル → 数字の帯 → ボタン → あらすじとタグの2列 → 巻一覧
function TextLayout({ series, volumes }: { series: SeriesDetail; volumes: Volume[] }) {
  const year = series.latest_published_date?.slice(0, 4);
  return (
    <>
      <div className="flex max-w-[52em] flex-col gap-3">
        <h1 className="m-0 text-[clamp(30px,6vw,44px)] leading-[1.25] text-pretty">{series.series_title}</h1>
        <Credits series={series} className="text-base" />
      </div>

      <div className="flex flex-col gap-5">
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
          <SubHeading>あらすじ</SubHeading>
          <p className="m-0 max-w-[38em] text-base leading-[2] text-pretty">
            {series.synopsis ?? <span className="text-muted-foreground">あらすじは登録されていません。</span>}
          </p>
        </div>
        <div className="flex flex-col gap-2.5">
          <SubHeading>タグ</SubHeading>
          <TagTable series={series} />
        </div>
      </div>

      <Volumes volumes={volumes} />
    </>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="m-0 text-[13px] tracking-[.08em]">{children}</h2>;
}

// 著者名 (押すとその著者の作品で検索) と イラスト
function Credits({ series, className }: { series: SeriesCard; className: string }) {
  return (
    <span className={className}>
      {series.author ? (
        <Link href={searchHref({ author: series.author })} className="text-foreground hover:text-accent-text">
          {series.author}
        </Link>
      ) : null}
      {series.illustrator ? <span className="text-muted-foreground">　／ イラスト {series.illustrator}</span> : null}
    </span>
  );
}

// タグの表 (ジャンル / 雰囲気 / サブジャンル)。押すとそのタグで絞り込んだ「さがす」に移る
function TagTable({ series }: { series: SeriesCard }) {
  const rows = [
    { label: "ジャンル", key: "genres", tags: series.genre_tags },
    { label: "雰囲気", key: "atmospheres", tags: series.atmosphere_tags },
    { label: "サブジャンル", key: "subGenres", tags: series.sub_genre_tags },
  ] as const;
  return (
    <dl className="m-0 flex flex-col border-t-2 border-border">
      {rows
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
  );
}

function Volumes({ volumes }: { volumes: Volume[] }) {
  if (!volumes.length) return null;
  return (
    <div className="flex flex-col gap-2.5">
      <SubHeading>巻一覧</SubHeading>
      <VolumeTable volumes={volumes} />
    </div>
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

// 似ているシリーズ: 似ている順の上位 pool 件の候補 (キャッシュ済み) から、表示のたびに shown 件を選び直す。
// 上位 fixed 件は毎回そのまま出し、残りはそれより下の候補から同じ確率で選ぶ (fixed: 0 なら全件をランダムに選ぶ)
const SIMILAR = { pool: 30, shown: 8, fixed: 0 } as const;

async function Similar({ base }: { base: SeriesCard }) {
  const candidates = await getSimilarSeries(base, SIMILAR.pool);
  if (!candidates.length) return <p className="text-sm text-muted-foreground">似ている作品が見つかりませんでした。</p>;
  // ランダムな値はリクエストごとに変わるので、ここから先はリクエストのたびに描くと Next.js に伝える
  await connection();
  const fixed = candidates.slice(0, SIMILAR.fixed);
  const picked = pickRandom(candidates.slice(SIMILAR.fixed), SIMILAR.shown - fixed.length);
  return <SeriesCollection cards={[...fixed, ...picked]} kind="similar" />;
}
