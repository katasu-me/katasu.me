# katasu.me

🪴 「じぶん」のための、インターネットのかたすみ

## 開発環境

### 事前準備

```bash
# direnv を使う場合（推奨）
direnv allow

# direnv を使わない場合
nix develop
```


以降の手順は、すべて devShell 内で実行する前提です。

> [!NOTE]
> devShell は `SSL_CERT_FILE` も設定します。
> NixOS ではプレビルドの workerd がシステムのCA証明書ストアを見つけられず、開発サーバーからの外部API通信（Google OAuthのトークン交換など）がTLSエラーになるためです。

### ローカル環境でのドメイン設定

#### 1. hostsファイルの編集

```bash
# macOS/Linux
sudo nano /etc/hosts

# 以下を追加
127.0.0.1    local.katasu.me
```

#### 2. 証明書の生成

mkcert は devShell に含まれているため、個別のインストールは不要です。

```bash
# ルートCAを作成し、ブラウザの信頼ストアに登録
mkcert -install

# 証明書の生成
cd apps/service
mkdir -p certificates
mkcert -cert-file certificates/local.katasu.me.pem \
       -key-file certificates/local.katasu.me-key.pem \
       local.katasu.me
```

### 環境構築

#### 1. Cloudflareへのログイン

```bash
pnpm wrangler login
```

#### 2. wrangler設定ファイルの作成

```bash
cd apps/service
cp wrangler.develop.toml wrangler.toml
```

以降の手順で作成したリソースのIDを `wrangler.toml` 内のプレースホルダー（`<DEVELOPMENT_...>`）に設定します。

コピー後、ローカルで画像アップロードのQueueコンシューマ（`src/server.ts` の `queue` エクスポート）を動作させるため、`main` を `src/server.ts` に変更します。

```toml
# wrangler.toml
main = "src/server.ts"
```

#### 3. D1データベースの作成

```bash
# 開発環境用D1データベース作成
pnpm wrangler d1 create katasu-me-dev
```

出力された `database_id` を `wrangler.toml` の `<DEVELOPMENT_DATABASE_ID>` に設定します。

#### 4. KV Namespaceの作成

```bash
# キャッシュ用KV作成
pnpm wrangler kv namespace create CACHE_KV
```

出力された `id` を `wrangler.toml` の `<DEVELOPMENT_CACHE_KV_ID>` に設定します。

#### 5. R2バケットの作成

```bash
# 画像保存用
pnpm wrangler r2 bucket create katasu-me-dev-images

# 一時アップロード用（先行アップロード・モデレーション判定に使用）
pnpm wrangler r2 bucket create katasu-me-dev-temp
```

#### 6. 環境変数の設定

```bash
cp .env.example .env.local
```

Google OAuthのAPIキー（`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`）や画像モデレーション用の `OPENAI_API_KEY` など、必要な環境変数を `.env.local` に設定します。

##### ローカルでのモデレーションスキップ

画像アップロード時のモデレーション判定（OpenAI Moderation API）をローカルでスキップするには、`.dev.vars` を作成します。

```bash
# apps/service/.dev.vars
SKIP_MODERATION = "true"
```

#### 7. データベースマイグレーション

```bash
# apps/service ディレクトリで実行
pnpm db:migrate
```

#### 8. シードデータの投入

```bash
pnpm db:seed
```

### 起動

```sh
pnpm install
pnpm run dev
```
