import Link from "next/link";

import { CoverImage } from "@/components/common/cover-image";
import { tagLine, type CardWithReason } from "@/features/series/types";
import { formatShortDate, formatVolumes } from "@/lib/format";
import { cn } from "@/lib/utils";

export type CardVariant = "recommend" | "release" | "list" | "cover" | "similar";

// 作品カード (docs/ui-design.md §2.1)。カード全体がリンクで、hover で文字を朱色にする
export function SeriesCardView({ card, variant }: { card: CardWithReason; variant: CardVariant }) {
  const href = `/series/${card.series_id}`;
  const releaseLine = `${formatShortDate(card.latest_published_date)} 発売 · ${formatVolumes(card.volume_count)}`;

  if (variant === "cover") {
    return (
      <Link href={href} title={card.series_title} className="group relative block overflow-hidden no-underline">
        <CoverImage src={card.cover_image_url} alt={card.series_title} sizes="(min-width: 1240px) 130px, 30vw" />
        {/* マウスを乗せると情報を重ねる。マウスの無い端末では下端に帯で常に出す */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-overlay p-2.5 text-left text-[#f3f2f2] transition-opacity duration-150",
            "[@media(hover:hover)]:inset-0 [@media(hover:hover)]:justify-end [@media(hover:hover)]:opacity-0",
            "[@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-visible:opacity-100",
          )}
        >
          <span className="line-clamp-2 text-[13px] leading-snug font-extrabold [@media(hover:none)]:line-clamp-1 [@media(hover:none)]:text-xs">
            {card.series_title}
          </span>
          <span className="text-[11px] [@media(hover:none)]:hidden">{card.author}</span>
          <span className="text-[10px] opacity-80">{releaseLine}</span>
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} className="group flex min-w-0 flex-col gap-2.5 text-foreground no-underline">
      <CoverImage src={card.cover_image_url} alt={card.series_title} />
      <div className="flex flex-col gap-[3px]">
        {(variant === "recommend" || variant === "similar") && card.reason ? (
          <span className="text-[11px] leading-snug font-bold text-accent-text">{card.reason}</span>
        ) : null}
        <span className="line-clamp-2 text-sm leading-snug font-bold group-hover:text-accent-text">{card.series_title}</span>
        <span className="text-xs text-muted-foreground">{card.author}</span>
        {variant === "release" ? <span className="text-[11px] text-subtle-foreground">{releaseLine}</span> : null}
        {variant === "list" ? (
          <span className="line-clamp-2 text-[11px] text-subtle-foreground">{tagLine(card)}</span>
        ) : null}
      </div>
    </Link>
  );
}

// カードのグリッド (cardSize「標準」: 最小 156px、間隔 縦32 横20)。書影ビューは最小 124px、間隔 6
export function SeriesGrid({ cards, variant }: { cards: CardWithReason[]; variant: CardVariant }) {
  return (
    <div
      className={cn(
        "grid",
        variant === "cover"
          ? "grid-cols-[repeat(auto-fill,minmax(124px,1fr))] gap-1.5"
          : "grid-cols-[repeat(auto-fill,minmax(156px,1fr))] gap-x-5 gap-y-8",
      )}
    >
      {cards.map((c) => (
        <SeriesCardView key={c.series_id} card={c} variant={variant} />
      ))}
    </div>
  );
}
