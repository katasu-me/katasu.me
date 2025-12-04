# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

katasu.me は「インターネットのかたすみにある、ぽつんと画像をおいておける場所」をコンセプトとした画像共有Webアプリケーションです。TanStack Start と Cloudflare Workers を使用して構築されています。

### リポジトリ構成

このプロジェクトはpnpmワークスペースを使用したモノレポ構成です：
- `apps/service` - メインのWebアプリケーション（TanStack Start）
- `packages/service-db` - データベーススキーマ定義と共通クエリ（Drizzle ORM）

## 開発コマンド

### ルートディレクトリ（Turbo経由）
- `pnpm dev` - 全ワークスペースの開発サーバー起動
- `pnpm build` - 全ワークスペースのビルド
- `pnpm build:service` - serviceアプリのみビルド
- `pnpm check` - 全ワークスペースのコード検査
- `pnpm lint` / `pnpm format` - コード品質管理
- `pnpm test` - 全ワークスペースのテスト実行

### apps/service ディレクトリ
- `pnpm dev` - 開発サーバーの起動（Vite、ポート3000）
- `pnpm build` - Vite本番ビルド
- `pnpm preview` - ビルド後のプレビュー
- `pnpm deploy` - Cloudflare Workersへのデプロイ
- `pnpm cf-typegen` - Cloudflare環境の型定義生成
- `pnpm storybook` - Storybookの起動（ポート6006）
- `pnpm test` - Vitestによるテスト実行

## アーキテクチャ

### 技術スタック
- **フレームワーク**: TanStack Start v1.139.x（TanStack Router + Vite）
- **React**: v19.2.0
- **ビルドツール**: Vite v7.1.x
- **デプロイ環境**: Cloudflare Workers（wrangler）
- **データベース**: Cloudflare D1 + Drizzle ORM v0.44.x
- **認証**: Better Auth
- **スタイリング**: Tailwind CSS v4（@tailwindcss/vite）
- **UIライブラリ**: Radix UI、Motion（アニメーション）
- **日本語処理**: BudouX（自然な改行位置計算）
- **バリデーション**: Valibot
- **パッケージマネージャー**: pnpm v10.15.x
- **モノレポツール**: Turborepo v2.6.x
- **テスト**: Vitest + @testing-library/react

### ディレクトリ構成

**コンポーネント配置の詳細なガイドラインは @docs/directory-structure.md を参照してください。**

#### apps/service
機能（feature）単位でビジネスロジックを整理し、ルーティングはTanStack Routerのファイルベースルーティングを採用しています。

```
src/
├── routes/                    # TanStack Routerのファイルベースルーティング
│   ├── __root.tsx            # ルートレイアウト
│   ├── index.tsx             # トップページ
│   ├── 404.tsx               # 404ページ
│   ├── settings.tsx          # 設定ページ
│   ├── auth/                 # 認証関連ルート
│   ├── user/                 # ユーザー関連ルート
│   ├── report/               # レポート関連ルート
│   └── api/                  # APIルート
├── features/                  # ビジネスロジック（機能単位）
│   ├── auth/                 # 認証機能
│   ├── gallery/              # ギャラリー機能
│   ├── image-delete/         # 画像削除機能
│   ├── image-edit/           # 画像編集機能
│   ├── image-upload/         # 画像アップロード機能
│   ├── image-view/           # 画像表示機能
│   ├── report/               # 通報機能
│   ├── settings/             # 設定機能
│   └── top/                  # トップページ機能
├── components/                # プロジェクト全体で共有される汎用UIコンポーネント
├── assets/                    # 画像、SVGなどの静的リソース
├── constants/                 # 定数定義
├── hooks/                     # カスタムフック
├── libs/                      # プロジェクト全体で使用されるユーティリティ関数
├── schemas/                   # バリデーションスキーマ
├── types/                     # 型定義
├── router.tsx                 # TanStack Routerの設定
├── middleware.ts              # ミドルウェア
└── routeTree.gen.ts           # 自動生成されるルートツリー
```

各コンポーネントには対応する`.stories.tsx`ファイルが付属し、Storybookで動作確認できます。

#### packages/service-db
- `src/schema/` - Drizzle ORMのスキーマ定義
- `src/queries/` - 共通のデータベースクエリ
- `src/migrations/` - データベースマイグレーション
- `src/seeds/` - シードデータ
- `src/lib/` - ユーティリティ関数
- `src/types/` - 型定義
- `src/index.ts` - エクスポート

### コード規約
- **フォーマッター/リンター**: Biome v2.3.x（ESLint/Prettierの代替）
  - インデント: スペース2文字
  - 行幅: 120文字
  - クォート: ダブルクォート
  - 改行: LF
- **Git hooks**: Lefthook
  - pre-commit: Biomeによる自動修正
  - pre-push: Biomeによるチェック
- **TypeScript**: Strict mode有効（v5.7.x）
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
- SVGファイルはReactコンポーネントとして自動的にインポート可能（vite-plugin-svgr設定済み）
- 開発サーバーはHTTPSで動作（`local.katasu.me:3000`）
- Cloudflare環境の型定義は`cloudflare-env.d.ts`に生成される
- Storybookを使用してコンポーネントの開発・テストを行う
- データベーススキーマは`packages/service-db`で管理され、`apps/service`から参照
- TanStack Routerのルートツリーは`routeTree.gen.ts`に自動生成される
