// 見た目の版 (docs/ui-design.md §8)。同じコードから2つのサイトを出すために、ビルドごとに環境変数で決める
//   cover   書影あり (デザイン案 A「グリッド」)。既定
//   nocover 書影なし (「書影なし」モックのあらすじ型)
// NEXT_PUBLIC_ にしているのは、クライアント部品 (さらに見る など) でも同じ値を使うため。ビルド時に埋め込まれる
export type UiVariant = "cover" | "nocover";

export const UI_VARIANT: UiVariant = process.env.NEXT_PUBLIC_UI_VARIANT === "nocover" ? "nocover" : "cover";

export const SHOW_COVERS = UI_VARIANT === "cover";
