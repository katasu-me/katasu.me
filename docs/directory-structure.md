# ディレクトリ構成ガイドライン

このドキュメントでは、プロジェクト内のコンポーネント配置に関するルールを定義します。

## 基本方針

**「関連ファイルを近くに置く」ことで、ファイル探索の認知負荷を下げる**

ただし、「近くに置きすぎる」と逆に認知負荷が上がる場合があります。
コンポーネント間の**関係性の種類**を見極めて、適切な配置を決定します。

## 配置ルール

コンポーネントを配置する際は、親コンポーネントとの関係性を以下の3つのルールで判断します。

### ルールA: 視覚的に親の一部 → 同じディレクトリ内に配置

**判断基準:**
- 親のJSX内で直接レンダリングされる
- 子が親のUIの一部として見える
- 子単体では意味を成さない（親に依存している）

**配置:**
```
ParentComponent/
  ├── index.tsx
  └── ChildComponent/       # 親の一部として配置
      └── index.tsx
```

**コード例:**
```tsx
// ParentComponent/index.tsx
export default function ParentComponent() {
  return (
    <div>
      <ChildComponent />    {/* 親のUI構造の一部 */}
    </div>
  );
}
```

**実例:**
- `GalleryRandom/DraggableImage/` - GalleryRandomの表示要素
- `UploadDrawer/FilmCounter/` - ドロワーのタイトル部分
- `UploadForm/ImagePlaceholder/` - フォームのプレビュー部分

---

### ルールB: 独立したUI（トリガー⇔コンテンツ）→ 兄弟として配置

**判断基準:**
- トリガーとコンテンツの関係
- 状態（open/close）で制御される
- 視覚的に別のUI要素として存在
- トリガーを見ただけでは、そのコンテンツが何かは分からない

**配置:**
```
_components/
  ├── TriggerButton/         # トリガー（ボタンなど）
  └── ContentDrawer/         # コンテンツ（ドロワー/モーダルなど）
```

**コード例:**
```tsx
// TriggerButton/index.tsx
export default function TriggerButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>開く</button>
      <ContentDrawer open={open} onOpenChange={setOpen} />
    </>
  );
}
```

**実例:**
- `ImageDropArea/` + `UploadDrawer/` - ドロップエリア（トリガー）とアップロードドロワー（コンテンツ）
- `EditButton/` + `EditDrawer/` - 編集ボタン（トリガー）と編集ドロワー（コンテンツ）

**ネーミング規則:**
- トリガー: `〜Button`, `〜Area`, `〜Link` など（UIとして見える部分）
- コンテンツ: `〜Drawer`, `〜Modal`, `〜Dialog` など（独立したUI）

---

### ルールC: 複数箇所から使用 → 共通の親に配置

**判断基準:**
- 2箇所以上から使用される
- 汎用的なコンポーネント
- 特定の親に依存しない

**配置:**
```
_components/           # 共通の親ディレクトリ
  ├── SharedComponent/ # 複数から使用されるコンポーネント
  ├── PageA/
  └── PageB/
```

**移動基準:**
- 1箇所でのみ使用 → 使用場所の近くに配置
- 2箇所以上で使用 → 共通の親に昇格

---

## 判断フロー

```
コンポーネントを配置する
    ↓
複数箇所から使用される？
    ├─ Yes → ルールC: 共通の親に配置
    └─ No → 1箇所のみで使用
        ↓
    親のUIの一部として直接レンダリング？
        ├─ Yes → ルールA: 親の中に配置
        └─ No → トリガー⇔コンテンツの関係？
            ├─ Yes → ルールB: 兄弟として配置
            └─ No → ルールA: 親の中に配置
```

## 具体例

### ✅ 良い例

#### 例1: gallery feature
```
features/gallery/
  ├── components/
  │   ├── GalleryMasonry/      # メイソンリー表示
  │   ├── GalleryRandom/       # ランダム表示
  │   │   ├── index.tsx
  │   │   ├── DraggableImage/  # ルールA: GalleryRandomの表示要素
  │   │   └── DraggableImages/ # ルールA: GalleryRandomの表示要素
  │   └── GalleryToggle/       # 表示切り替えトグル
  ├── constants/
  ├── libs/
  ├── schemas/
  └── server-fn/
```

**理由:**
- `DraggableImage`と`DraggableImages`は`GalleryRandom`の表示要素として直接レンダリング

#### 例2: image-upload feature
```
features/image-upload/
  ├── components/
  │   ├── ImageDropArea/      # ルールB: トリガー
  │   ├── UploadDrawer/       # ルールB: コンテンツ
  │   │   ├── index.tsx
  │   │   └── FilmCounter/    # ルールA: ドロワーのUI部分
  │   ├── UploadForm/
  │   │   ├── index.tsx
  │   │   └── ImagePlaceholder/  # ルールA: フォームのUI部分
  │   └── UploadSnackbar/     # アップロード通知
  ├── constants/
  ├── contexts/
  ├── libs/
  ├── schemas/
  └── server-fn/
```

**理由:**
- `ImageDropArea`（ドロップエリア）と`UploadDrawer`は独立したUIなので兄弟配置
- `FilmCounter`は`UploadDrawer`のUI構造の一部
- `ImagePlaceholder`は`UploadForm`のUI構造の一部

### ❌ 悪い例

```
features/image-edit/
  ├── components/
  │   ├── EditDrawer/        # ← EditButtonから使われるが、離れた場所にある
  │   └── SomeWrapper/
  │       └── EditButton/    # ← EditDrawerを開くボタン
```

**問題点:**
- `EditButton`を見ても、`EditDrawer`が兄弟にあるとは分からない
- `EditButton`の中に`EditDrawer`があると誤解する可能性

### ✅ 良い例

```
features/image-edit/
  ├── components/
  │   ├── EditButton/        # ルールB: トリガー
  │   ├── EditDrawer/        # ルールB: コンテンツ
  │   │   └── index.tsx
  │   └── EditForm/          # ルールA: ドロワーのUI部分
  │       └── index.tsx
  ├── schemas/
  └── server-fn/
```

**改善点:**
- `EditButton`と`EditDrawer`が兄弟なので関係性が明確
- トリガーとコンテンツの関係が一目で分かる

#### 例3: image-view feature
```
features/image-view/
  ├── components/
  │   ├── BigImage/          # 画像の拡大表示
  │   └── ShareButton/       # 共有ボタン
  └── server-fn/
```

## features ディレクトリの構成

機能（feature）単位でビジネスロジックを整理しています。

```
features/
  ├── auth/                  # 認証機能
  │   ├── components/
  │   │   ├── SignInButton/
  │   │   ├── SignInDrawer/
  │   │   ├── SignUpForm/
  │   │   └── StartButton/
  │   ├── libs/
  │   ├── schemas/
  │   └── server-fn/
  ├── gallery/               # ギャラリー機能
  ├── image-delete/          # 画像削除機能
  ├── image-edit/            # 画像編集機能
  ├── image-upload/          # 画像アップロード機能
  ├── image-view/            # 画像表示機能
  ├── report/                # 通報機能
  ├── settings/              # 設定機能
  └── top/                   # トップページ機能
```

**各featureディレクトリの構成:**
- `components/` - UI コンポーネント
- `libs/` - ユーティリティ関数
- `schemas/` - バリデーションスキーマ
- `server-fn/` - サーバー関数
- `contexts/` - React Context（必要な場合）
- `constants/` - 定数定義（必要な場合）
- `assets/` - 静的リソース（必要な場合）

## プレフィクス `_` の使用

TanStack Routerのファイルベースルーティングでは、`_`プレフィクスはレイアウトルートを示します。

```
routes/
  ├── __root.tsx             # ルートレイアウト
  ├── index.tsx              # トップページ
  ├── 404.tsx                # 404ページ
  ├── settings.tsx           # 設定ページ
  ├── closed-beta.tsx        # クローズドベータページ
  ├── api/                   # APIルート
  │   ├── auth/
  │   └── r2/
  ├── auth/                  # 認証関連ルート
  │   ├── error.tsx
  │   └── signup.tsx
  ├── report/                # 通報関連ルート
  │   ├── _layout.tsx        # レイアウト
  │   └── _layout/
  │       ├── image.tsx
  │       └── user.tsx
  └── user/                  # ユーザー関連ルート
      ├── _layout.$userId.tsx        # レイアウト
      └── _layout.$userId/
          ├── index.tsx
          ├── image.$imageId.tsx
          └── tag/
              ├── index.tsx
              └── $tagId.tsx
```

**ルール:**
- `_layout.tsx` - レイアウトルート（URLパスには含まれない）
- `$param` - 動的ルートパラメータ

## まとめ

| 関係性 | 配置場所 | 判断基準 |
|--------|----------|----------|
| 親のUI部分 | 親の中 | 視覚的に親の一部、直接レンダリング |
| トリガー⇔コンテンツ | 兄弟 | 独立したUI、状態で制御 |
| 複数箇所で使用 | 共通の親 | 2箇所以上から使用 |

これらのルールに従うことで、ファイル探索時の認知負荷を下げ、コンポーネントの関係性を明確にします。
