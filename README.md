# katasu.me

🪴 「じぶん」のための、インターネットのかたすみ

## 開発環境

### ローカル環境でのドメイン設定

#### 1. hostsファイルの編集

```bash
# macOS/Linux
sudo nano /etc/hosts

# 以下を追加
127.0.0.1    local.katasu.me
```

#### 2. 証明書の生成

```bash
# mkcertのインストール
brew install mkcert  # macOS
choco install mkcert # Windows

# 証明書の生成
mkcert -install
mkcert local.katasu.me
```

#### 3. アクセス確認

```bash
# 開発サーバー起動後
open http://local.katasu.me:3000
```

### 初期環境構築

#### 1. Cloudflareへのログイン

```bash
pnpm wrangler login
```

#### 2. wrangler設定ファイルの作成

```bash
cd apps/service
cp wrangler.example.jsonc wrangler.jsonc
```

#### 3. D1データベースの作成

```bash
# 開発環境用D1データベース作成
pnpm wrangler d1 create katasu-me-dev
```

出力された `database_id` を `wrangler.jsonc` の `d1_databases` セクションに記入します。

#### 4. KV Namespaceの作成

```bash
# キャッシュ用KV作成
pnpm wrangler kv namespace create CACHE_KV
```

出力された `id` を `wrangler.jsonc` の `kv_namespaces` セクションに記入します。

#### 5. R2バケットの作成

```bash
# Next.js インクリメンタルキャッシュ用
pnpm wrangler r2 bucket create katasu-me-dev-inc-cache

# 画像保存用
pnpm wrangler r2 bucket create katasu-me-dev-images
```

#### 6. 環境変数の設定

```bash
cp .env.example .env.local
```

Google OAuthのシークレットなど、必要な環境変数を `.env.local` に設定します。

##### upload-worker用の環境変数

```bash
cd apps/upload-worker
cp .env.example .env.local
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
    
