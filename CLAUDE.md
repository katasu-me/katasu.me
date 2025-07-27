# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

katasu.me は「インターネットのかたすみにある、ぽつんと画像をおいておける場所」をコンセプトとした画像共有Webアプリケーションです。Next.js 15 と Cloudflare Workers を使用して構築されています。

## 開発コマンド

### 基本コマンド
- `bun dev` - 開発サーバーの起動（Turbopack使用）
- `bun build` - 本番ビルド
- `bun preview` - Cloudflare環境でのプレビュー（ビルド後に実行）
- `bun check` - Biomeによるコード検査と自動修正（lint + format）

### コード品質管理
- `bun lint` - Biomeによるリント（自動修正付き）
- `bun format` - Biomeによるフォーマット

### Storybook
- `bun storybook` - Storybookの起動（ポート6006）
- `bun build-storybook` - Storybookの本番ビルド

### Cloudflare関連
- `bun build:worker` - OpenNext.js Cloudflareビルド
- `bun cf-typegen` - Cloudflare環境の型定義生成

## アーキテクチャ

### 技術スタック
- **フレームワーク**: Next.js 15.3.2（App Router）
- **React**: v19
- **デプロイ環境**: Cloudflare Workers（@opennextjs/cloudflare）
- **スタイリング**: Tailwind CSS v4
- **UIライブラリ**: Radix UI、Motion（アニメーション）
- **日本語処理**: BudouX（自然な改行位置計算）
- **パッケージマネージャー**: Bun
- **テスト**: bun test
    - リファレンス: https://bun.sh/docs/cli/test.md

### ディレクトリ構成

featuresベースの構成を採用し、機能単位でコンポーネントを整理しています。

- `src/app/` - Next.js App Routerのページとレイアウト
- `src/shared/` - プロジェクト全体で共有されるコード
- `src/features/` - 機能別に整理されたコンポーネント
- `src/assets/` - 画像、SVGなどの静的リソース
- `src/styles/` - グローバルスタイルとCSS変数

**shared/ と features/ 配下の構成**
必要に応じて以下のディレクトリを含むことができます：
- `components/` - コンポーネント（shared: 汎用UI、features: 機能専用）
- `constants/` - 定数定義
- `types/` - 型定義

各コンポーネントには対応する`.stories.tsx`ファイルが付属し、Storybookで動作確認できます。

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
