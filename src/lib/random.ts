// 配列をかたよりなく混ぜて (Fisher–Yates)、先頭から n 件を返す。元の配列は変えない
export function pickRandom<T>(items: readonly T[], n: number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}
