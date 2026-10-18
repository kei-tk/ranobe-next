# ranobeNext

ライトノベルを、ジャンルや雰囲気から探す「ラノベ書庫」の Next.js 版。
設計は [docs/](docs/) (要件定義・アーキテクチャ・画面設計) を参照。前のアプリから作り直して工夫した点は [docs/portfolio.md](docs/portfolio.md) にまとめてある。

- Next.js 16 (App Router、Cache Components) / React 19 / TypeScript
- Tailwind CSS v4 + shadcn/ui (Radix、Modernist デザインに合わせて書き換え済み)
- Supabase (Postgres + Auth)。DB のマイグレーションとデータパイプラインは元リポジトリ (`light-novel-finder`) で管理する

## はじめに

```bash
npm install
cp .env.example .env.local   # 値を入れる
npm run dev                  # http://localhost:3000
```

## よく使うコマンド

```bash
npm run lint       # ESLint (角丸・影のクラスも警告する)
npx tsc --noEmit   # 型チェック (先に npx next typegen でルートの型を作る)
npm run build      # 本番ビルド
```
