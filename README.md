# katasu.me

🪴 インターネットのかたすみにある、ぽつんと画像をおいておける場所。

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

### 起動

```sh
pnpm install
pnpm run dev
```

