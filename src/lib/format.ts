// 日付の表示 (docs/ui-design.md §6)。DB の date は "YYYY-MM-DD" の文字列で来るので、
// Date に変換せずに数字を取り出す (タイムゾーンで1日ずれるのを防ぐ。曜日だけは UTC で計算する)
const WEEKDAYS = "日月火水木金土";

function parts(date: string | null | undefined) {
  const m = date?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return { y: Number(m[1]), mo: Number(m[2]), d: Number(m[3]) };
}

// 10/10(土)
export function formatShortDate(date: string | null | undefined): string {
  const p = parts(date);
  if (!p) return "発売日不明";
  const wd = WEEKDAYS[new Date(Date.UTC(p.y, p.mo - 1, p.d)).getUTCDay()];
  return `${p.mo}/${p.d}(${wd})`;
}

// 10.10 (新刊カレンダー)
export function formatDotDate(date: string | null | undefined): string {
  const p = parts(date);
  return p ? `${p.mo}.${String(p.d).padStart(2, "0")}` : "—";
}

// 2026/10/10
export function formatLongDate(date: string | null | undefined): string {
  const p = parts(date);
  return p ? `${p.y}/${p.mo}/${p.d}` : "—";
}

export function formatVolumes(count: number | null | undefined): string {
  return count ? `全${count}巻` : "巻数不明";
}
