// series_cards (migration 036) の1行。一覧・カードで使う
export type SeriesCard = {
  series_id: string;
  series_title: string;
  author: string | null;
  illustrator: string | null;
  imprint: string | null;
  volume_count: number | null;
  latest_published_date: string | null;
  popularity_score: number | null;
  genre_tags: string[];
  atmosphere_tags: string[];
  sub_genre_tags: string[];
  cover_image_url: string | null;
};

// カードの上に朱色で出すラベル (推薦理由・共通点。docs/ui-design.md §5)
export type CardWithReason = SeriesCard & { reason?: string };

export type SeriesDetail = SeriesCard & {
  synopsis: string | null;
  tagline: string | null;
};

export type Volume = {
  isbn: string;
  title: string | null;
  volume_number: number | null;
  volume_number_sub: string | null;
  published_date: string | null;
  cover_image_url: string | null;
  hasSpecialEdition: boolean;
};

// タグ行: ジャンル1 · 雰囲気1 · サブジャンル2 (デザインの tagLine と同じ選び方)
export function tagLine(card: Pick<SeriesCard, "genre_tags" | "atmosphere_tags" | "sub_genre_tags">): string {
  return [...card.genre_tags.slice(0, 1), ...card.atmosphere_tags.slice(0, 1), ...card.sub_genre_tags.slice(0, 2)].join(
    " · ",
  );
}
