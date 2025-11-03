# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

katasu.me は「インターネットのかたすみにある、ぽつんと画像をおいておける場所」をコンセプトとした画像共有Webアプリケーションです。Next.js 15 と Cloudflare Workers を使用して構築されています。

### リポジトリ構成

このプロジェクトはBunワークスペースを使用したモノレポ構成です：
- `apps/service` - メインのNext.jsアプリケーション
- `packages/service-db` - データベーススキーマ定義（Drizzle ORM）

## 開発コマンド

### ルートディレクトリ（Turbo経由）
- `pnpm dev` - 全ワークスペースの開発サーバー起動
- `pnpm dev:service` - serviceアプリのみ開発サーバー起動
- `pnpm build` - 全ワークスペースのビルド
- `pnpm build:service` - serviceアプリのワーカービルド
- `pnpm check` - 全ワークスペースのコード検査
- `pnpm lint` / `pnpm format` - コード品質管理
- `pnpm test` - 全ワークスペースのテスト実行

### apps/service ディレクトリ
- `pnpm dev` - 開発サーバーの起動（Turbopack使用、HTTPS有効）
- `pnpm build` - Next.js本番ビルド
- `pnpm build:worker` - OpenNext.js Cloudflareビルド
- `pnpm preview` - Cloudflare環境でのプレビュー
- `pnpm cf-typegen` - Cloudflare環境の型定義生成
- `pnpm storybook` - Storybookの起動（ポート6006）

### データベース関連（apps/service で実行）
- `pnpm db:generate` - マイグレーションファイル生成
- `pnpm db:studio` - Drizzle Studioの起動
- `pnpm db:migrate` - ローカルDBへのマイグレーション適用
- `pnpm db:migrate:dev` - 開発環境DBへのマイグレーション適用
- `pnpm db:migrate:prod` - 本番環境DBへのマイグレーション適用
- `pnpm db:seed` - シードデータの投入（ローカル/開発/本番）

## アーキテクチャ

### 技術スタック
- **フレームワーク**: Next.js 15.5.0（App Router）
- **React**: v19.1.1
- **デプロイ環境**: Cloudflare Workers（@opennextjs/cloudflare）
- **データベース**: Cloudflare D1 + Drizzle ORM
- **認証**: Better Auth
- **スタイリング**: Tailwind CSS v4
- **UIライブラリ**: Radix UI、Motion（アニメーション）
- **日本語処理**: BudouX（自然な改行位置計算）
- **パッケージマネージャー**: pnpm
- **モノレポツール**: Turborepo
- **テスト**: Vitest + @testing-library/react

### ディレクトリ構成

**コンポーネント配置の詳細なガイドラインは @docs/directory-structure.md を参照してください。**

#### apps/service
ページ単位でコンポーネントを整理し、関連するファイルを近くに配置する構成を採用しています。

```
src/
├── app/                           # Next.js App Router（ページとレイアウト）
│   ├── _components/              # app/配下で共通使用
│   ├── (main)/
│   │   └── user/[userId]/
│   │       ├── page.tsx          # ページ本体
│   │       ├── _components/      # このページ配下で共通使用
│   │       ├── _actions/         # Server Actions
│   │       ├── _schemas/         # バリデーションスキーマ
│   │       ├── _lib/             # ユーティリティ関数
│   │       ├── _types/           # 型定義
│   │       └── _constants/       # 定数定義
├── components/                    # プロジェクト全体で共有される汎用UIコンポーネント
├── assets/                        # 画像、SVGなどの静的リソース
├── styles/                        # グローバルスタイルとCSS変数
├── lib/                           # プロジェクト全体で使用されるユーティリティ関数
└── db.ts                          # Drizzle ORMのDB接続設定
```

各コンポーネントには対応する`.stories.tsx`ファイルが付属し、Storybookで動作確認できます。

#### packages/service-db
- `src/schema/` - Drizzle ORMのスキーマ定義
- `src/migrations/` - データベースマイグレーション
- `src/seeds/` - シードデータ
- `src/index.ts` - スキーマのエクスポート

### コード規約
- **フォーマッター/リンター**: Biome（ESLint/Prettierの代替）
  - インデント: スペース2文字
  - 行幅: 120文字
  - クォート: ダブルクォート
  - 改行: LF
- **Git hooks**: Lefthook
  - pre-commit: Biomeによる自動修正
  - pre-push: Biomeによるチェック
- **TypeScript**: Strict mode有効
- **パスエイリアス**: `@/*` → `./src/*`

### className

- 条件分岐などで付け外しを行なう場合は `twMerge()` を使用します
- 基本的に全てのコンポーネントはclassNameをPropsで受け取り、コンポーネントのスタイルを使用側から上書きできる作りとします

### アニメーション

- 再生速度は `duration-400` で統一します
- イージングは `ease-magnetic` を指定します
- ホバー時に要素の明るさを変える場合、`hover:brightness-90` とします。必ず暗くなるようにし、opacityを下げたりして明るくすることは許可しません
- 色、明るさなどが変化する場合は適切な transition を設定します

### 開発時の注意点
- SVGファイルはReactコンポーネントとして自動的にインポート可能（@svgr/webpack設定済み）
- CSS ModulesとPostCSSが有効（px→rem自動変換、カスタムメディアクエリ対応）
- Cloudflare環境の型定義は`cloudflare-env.d.ts`に生成される
- Storybookを使用してコンポーネントの開発・テストを行う
- データベーススキーマは`packages/service-db`で管理され、`apps/service`から参照
- マイグレーションは`apps/service`ディレクトリから実行（`bun db:generate`）
