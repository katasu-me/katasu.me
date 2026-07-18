# 画像アップロードの体感高速化（先行アップロード）実装指示書

- 対象 Issue: [katasu-me/katasu.me#205](https://github.com/katasu-me/katasu.me/issues/205)
- ステータス: **アプリケーションコードは実装済み（未コミット）。インフラ設定と旧構成の撤去が未完了**
- 最終更新: 2026-07-02

このドキュメントは、実装を引き継ぐエージェント（OpenCode 等）が背景・設計・残タスクを把握するための指示書です。

## 1. 目的

投稿ボタンを押してから完了までの体感時間を短縮する。従来は submit 時に画像本体（最大10MB）を server function へ POST していたため、回線速度によっては投稿完了まで数秒〜数十秒待たされていた。

## 2. 採用したアプローチ

Issue のアイデア「フォームが submit される前にアップロード処理を実行しておく」を軸に、以下の3本柱で構成する。

1. **クライアント側前処理**: ファイル選択直後に最大辺 2048px へリサイズ + WebP（q0.9）再エンコード + ThumbHash 計算を行い、転送量そのものを削減する
2. **先行アップロード**: ファイル選択直後（フォーム入力中）に一時バケット（`TEMP_R2_BUCKET`）へ転送を済ませる。submit 時は `tempImageId` とメタデータのみを送るため即時に完了する
3. **先行モデレーション**: temp 保存直後に Queue 経由で OpenAI Moderation 判定を行い、違反画像は投稿前にフォーム上でエラー表示する（本番バケットに違反コンテンツを一切乗せないという副次的な改善も兼ねる）

付随する構成変更として、**Queue コンシューマを別 Worker（`apps/upload-worker`）から service Worker 内（`src/server.ts` の `queue` エクスポート）へ統合**した。moderate ジョブが server function と型・R2 ヘルパーを共有する必要があるため。

## 3. フローの変更

### 変更前

```
submit
  → uploadFn に FormData で画像本体を POST（ここが遅い）
  → サーバーで寸法取得 → TEMP_R2_BUCKET へ put → DB登録(status: processing) → Queue投入
  → upload-worker がconsume: variants生成 → 本番R2へput → temp削除
     → 本番公開URLでモデレーション → 違反なら削除+moderation_violation / OKなら published
```

※ 旧構成では違反画像が一時的に本番バケット（公開URL）に乗っていた。

### 変更後

```
ファイル選択（input / DnD）
  → [client] normalizeFile → processImageFile（リサイズ・再エンコード・ThumbHash）
  → [client] uploadTempFn へ先行アップロード → tempImageId 取得
  → [server] 寸法をサーバーで再取得し customMetadata(userId/width/height) 付きで temp へ put
  → [server] moderate ジョブを Queue へ投入
  → [queue]  OpenAI Moderation 判定 → マーカー(moderation/<id>)書き込み
             flagged なら temp 本体を即削除
  → [client] 4秒後に getTempModerationFn で判定結果をワンショット確認（pendingならもう1回だけ）
             flagged ならフォームにエラー表示 + 投稿ボタン無効化

submit（画像本体は送らない → 即時）
  → uploadFn に tempImageId + title/tags/thumbhash のみ POST
  → [server] マーカー確認（flaggedなら拒否）→ headTempImage で存在・所有権・寸法検証
  → [server] DB登録(status: processing, imageId = tempImageId) → publish ジョブ投入
  → [queue]  マーカー確認（未判定ならインライン判定）→ variants生成 → 本番put
             → status: published → temp・マーカー削除
```

## 4. ファイルマップ（実装済み・未コミット）

| ファイル | 役割 |
|---|---|
| `apps/service/src/features/image-upload/libs/process-image.ts` | 新規。クライアント側のリサイズ・WebP再エンコード・ThumbHash計算。小さいファイル（≤1.5MB かつリサイズ不要）は劣化回避のため素通し |
| `apps/service/src/features/image-upload/libs/moderation.ts` | 新規。OpenAI Moderation API を base64 data URL で叩く（公開URL不要 = 本番に乗せる前に判定可能）。`SKIP_MODERATION=true` でスキップ |
| `apps/service/src/features/image-upload/server-fn/upload-temp.ts` | 新規。`uploadTempFn`（先行アップロード）/ `getTempModerationFn`（判定確認）/ `deleteTempFn`（破棄時クリーンアップ） |
| `apps/service/src/features/image-upload/server-fn/upload.ts` | 変更。画像本体を受け取らず `tempImageId` ベースに。マーカー→head の順で検証 |
| `apps/service/src/features/image-upload/queue/handler.ts` | 新規。moderate / publish の2種のジョブを処理するQueueコンシューマ |
| `apps/service/src/server.ts` | 新規。TanStack Start のカスタムサーバーエントリ。`fetch` に加えて `queue` ハンドラをエクスポート |
| `apps/service/src/features/image-upload/contexts/UploadContext.tsx` | 変更。`prepareFile`（先行処理の重複防止・差し替え時破棄）、モデレーション確認、submit時のリトライ制御 |
| `apps/service/src/features/image-upload/components/UploadForm/index.tsx` | 変更。`applyFile` で選択直後に先行処理を開始。処理済みファイルでプレビュー表示。flagged時は投稿ボタン無効化 |
| `apps/service/src/libs/r2.ts` | 変更。temp画像のput/head（所有権照合）、モデレーションマーカーのCRUD、本番バリアントのput |
| `apps/service/src/features/image-upload/libs/image.ts` | 変更。`generateImageVariants`（旧upload-workerから移植。original 2048px q80 / thumbnail 500px q50） |
| `apps/service/src/features/image-upload/libs/thumbhash.ts` | 変更。デコード結果を process-image と共有するため `ImageBitmap` を受け取る形に |
| `apps/service/src/features/image-upload/schemas/upload.ts` | 変更。`tempImageId`（nanoid 21文字の正規表現）スキーマ追加。`uploadImageServerSchema` から file を除去 |
| `apps/service/src/types/upload.ts` | 変更。`UploadJobMessage` を moderate / publish の判別unionに。**type欠落メッセージ = 旧形式の在庫 = publish 扱い**（デプロイ切り替え時の互換） |
| `apps/service/src/features/image-upload/libs/process-image.spec.ts` | 新規テスト |
| `apps/service/src/libs/r2.spec.ts` | 新規テスト |

## 5. 設計上の不変条件（変更時に壊さないこと）

- **クライアント申告値を信用しない**: 寸法は `uploadTempFn` がバイト列から再取得し customMetadata に保存。`uploadFn` はそれを唯一の情報源にする
- **所有権照合**: temp オブジェクトの customMetadata `userId` と、マーカーの `userId` を必ずリクエストユーザーと照合する（他人の `tempImageId` を使った投稿・削除・違反情報の漏洩を防ぐ）
- **`uploadFn` はマーカー → head の順で確認する**: flagged 時は temp 本体が削除済みのため、head 先行だと `TEMP_IMAGE_NOT_FOUND` に化けてクライアントが無駄な再アップロードをする
- **publish の処理順序は「本番put → status更新 → temp/マーカー削除」**: at-least-once 配信でリトライが冪等になるようにするため
- **moderate 失敗時はマーカーを書かない**: publish 側のインライン判定が安全網になる（安全網が二段構え）
- **temp の削除はすべてベストエフォート**: 取り逃しは R2 ライフサイクルルールが最終回収する前提
- **`imageId` = `tempImageId`**（nanoid 21文字）。スキーマの正規表現 `^[A-Za-z0-9_-]{21}$` とR2キーのサニタイズが対応している
- クライアントの失敗時フォールバック: 先行アップロード失敗 → submit 時にリトライ / `TEMP_IMAGE_NOT_FOUND` → 一度だけ再アップロードして再試行 / デコード不能ファイル → 投稿時にエラー表示

## 6. 未完了タスク

### 6-1. service Worker への Queue コンシューマ追加（必須）

`apps/service/wrangler.develop.toml` / `wrangler.production.toml` の `[[queues.producers]]` の下に追加する（旧 upload-worker の設定値を踏襲）:

```toml
[[queues.consumers]]
queue = "katasu-me-dev-upload-processing"  # productionは katasu-me-upload-processing
max_batch_size = 1
max_batch_timeout = 1
```

注意: 1つの Queue に consumer は1つしか設定できない。**先に upload-worker 側の consumer を外してからデプロイする**（後述のデプロイ手順を参照）。

### 6-2. 旧構成の撤去（必須）

- `apps/service/vite.config.ts` の `auxiliaryWorkers`（`../upload-worker/wrangler.toml` 参照）を削除
  - なお現状の参照パスは `wrangler.toml` だが実ファイルは `wrangler.develop.toml` のため、そもそも壊れている可能性がある。撤去で解消する
- `apps/upload-worker/` をディレクトリごと削除（`generateImageVariants` 等は service 側へ移植済み）
- `.github/workflows/deploy-upload-worker.yml` を削除
- `pnpm-lock.yaml` 更新（`pnpm install`）

### 6-3. シークレット・環境変数（必須）

- `OPENAI_API_KEY` を **service Worker** に設定する（従来は upload-worker 側のみ）: `wrangler secret put OPENAI_API_KEY --config wrangler.<env>.toml`
  - `worker-configuration.d.ts` には型が生成済みなので `cf-typegen` は実施済みの模様
- ローカル開発用に `apps/service/.dev.vars` へ `SKIP_MODERATION = "true"` を追加（コードは `env.SKIP_MODERATION === "true"` で判定）

### 6-4. TEMP バケットのライフサイクルルール（必須）

コードは「投稿されず放置された temp オブジェクトはライフサイクルルールで自動削除される」ことを前提にしている。dev / prod 両方の temp バケットに設定すること:

```sh
# 例: 全オブジェクトを1日後に削除（moderation/ プレフィクスのマーカーも回収される）
wrangler r2 bucket lifecycle add katasu-me-dev-temp --expire-days 1
wrangler r2 bucket lifecycle add katasu-me-prod-temp --expire-days 1
```

注意: クライアントは `TEMP_IMAGE_NOT_FOUND` 時に一度だけ自動再アップロードするため、有効期限が短すぎても即座には壊れないが、1日未満にはしないこと（フォームを長時間放置するケースの体験が悪化する）。

### 6-5. デプロイ手順（順序が重要）

Cloudflare Queues は 1 queue = 1 consumer のため、以下の順で切り替える:

1. upload-worker の consumer を外す: `wrangler queues consumer remove <queue名> <upload-workerのWorker名>`（またはWorker自体を削除）
2. この間に投入されたメッセージは Queue に在庫として貯まる（消えない）
3. consumer 設定を追加した service Worker をデプロイ → 在庫を消化開始
   - 旧形式（`type` フィールドなし）の在庫メッセージは `handler.ts` が publish として処理する互換実装済み
4. 動作確認後、upload-worker の Worker 本体と GitHub Actions を削除

### 6-6. 動作確認（必須）

**前提: 現在このリポジトリには `node_modules` が無い。まず `pnpm install` を実行すること。**

- `pnpm check` / `pnpm test`（既存specの他、`process-image.spec.ts` と `r2.spec.ts` が追加済み）
- `pnpm dev`（`https://local.katasu.me:3000`）で agent-browser を使い以下を確認:
  1. ファイル選択 → プレビュー表示 → タイトル入力中に Network タブで `uploadTempFn` が先行して走ること → 投稿が即時完了すること
  2. ファイルを別のものに差し替え → 古い temp が `deleteTempFn` で破棄されること
  3. 投稿せずドロワーを閉じる → `deleteTempFn` が呼ばれること
  4. 大きな画像（>2048px or >1.5MB）で転送されるファイルが WebP に縮小されていること
  5. `SKIP_MODERATION` を外した状態で違反画像 → フォーム表示中にエラーが出て投稿ボタンが無効になること
  6. 投稿後、ギャラリーで status: processing → published の遷移（ThumbHashプレースホルダ → 実画像）
- ローカルの Queue コンシューマは `@cloudflare/vite-plugin` がエミュレートする。consumer 設定を service の wrangler toml に追加しないとローカルでも consume されない点に注意

## 7. 既知の考慮事項

- `uploadTempFn` の投稿上限チェックは「上限到達ユーザーの temp 保存を防ぐ」ための事前チェックであり、最終判定は `uploadFn` 側で行う（TOCTOU は許容。二重に温存されるだけで公開はされない）
- 先行モデレーションの確認は 4秒 × 最大2回のワンショット。間に合わない場合は投稿時（uploadFn のマーカー確認 → publish のインライン判定）が安全網となる
- レート制限は既存の `ACTIONS_RATE_LIMITER`（60req/60s）をキー `upload-temp:<userId>` / `upload:<userId>` で共用している
- Safari など WebP エンコード非対応環境では PNG（透過保持）/ JPEG にフォールバックする。再エンコードで肥大化した場合は元ファイルを送る
