// さがす画面の条件 ⇄ URL クエリ (docs/ui-design.md §3.2)。サーバーとクライアントの両方で使う
export type TagMode = "and" | "or";
export type SortKey = "new" | "popularity" | "title";
// 書影なし版の表示: あらすじ型 (初期値) / 文字カード型 / 目録型
export type ViewKey = "syn" | "card" | "table";

export type SearchState = {
  q: string;
  genres: string[];
  atmospheres: string[];
  subGenres: string[];
  mode: TagMode;
  sort: SortKey;
  view: ViewKey;
  author: string;
};

export const PAGE_SIZE = 48;

type RawParams = Record<string, string | string[] | undefined> | URLSearchParams;

function get(raw: RawParams, key: string): string {
  const v = raw instanceof URLSearchParams ? raw.get(key) : raw[key];
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

function list(raw: RawParams, key: string): string[] {
  return [...new Set(get(raw, key).split(",").map((s) => s.trim()).filter(Boolean))].slice(0, 30);
}

export function parseSearchState(raw: RawParams): SearchState {
  const mode = get(raw, "mode");
  const sort = get(raw, "sort");
  const view = get(raw, "view");
  return {
    q: get(raw, "q").trim().slice(0, 100),
    genres: list(raw, "genre"),
    atmospheres: list(raw, "atmosphere"),
    subGenres: list(raw, "sub"),
    mode: mode === "or" ? "or" : "and",
    sort: sort === "popularity" || sort === "title" ? sort : "new",
    view: view === "card" || view === "table" ? view : "syn",
    author: get(raw, "author").trim().slice(0, 100),
  };
}

// 初期値と同じものは URL に書かない (共有したときの URL を短くするため)
export function toQueryString(s: Partial<SearchState>): string {
  const p = new URLSearchParams();
  if (s.q) p.set("q", s.q);
  if (s.author) p.set("author", s.author);
  if (s.genres?.length) p.set("genre", s.genres.join(","));
  if (s.atmospheres?.length) p.set("atmosphere", s.atmospheres.join(","));
  if (s.subGenres?.length) p.set("sub", s.subGenres.join(","));
  if (s.mode === "or") p.set("mode", "or");
  if (s.sort && s.sort !== "new") p.set("sort", s.sort);
  if (s.view && s.view !== "syn") p.set("view", s.view);
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}

export function searchHref(s: Partial<SearchState>): string {
  return `/search${toQueryString(s)}`;
}

export const CATEGORY_KEYS = { genre: "genres", atmosphere: "atmospheres", sub_genre: "subGenres" } as const;
export type Category = keyof typeof CATEGORY_KEYS;

// あるタグを付け外しした条件
export function toggleTag(s: SearchState, category: Category, tag: string): SearchState {
  const key = CATEGORY_KEYS[category];
  const cur = s[key];
  return { ...s, [key]: cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag] };
}

export function selectedTags(s: SearchState): { category: Category; tag: string }[] {
  return [
    ...s.genres.map((tag) => ({ category: "genre" as const, tag })),
    ...s.atmospheres.map((tag) => ({ category: "atmosphere" as const, tag })),
    ...s.subGenres.map((tag) => ({ category: "sub_genre" as const, tag })),
  ];
}
