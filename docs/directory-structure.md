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
- `GalleryView/Random/DraggableImage/` - Randomの表示要素
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
- `UserImageDropArea/ImageDropArea/` + `UploadDrawer/` - ドロップエリア（トリガー）とアップロードドロワー（コンテンツ）

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

#### 例1: GalleryView
```
GalleryView/
  ├── index.tsx              # GalleryViewコンポーネント
  ├── LayoutToggle/          # ルールA: UIの一部
  ├── Random/
  │   ├── index.tsx
  │   └── DraggableImage/    # ルールA: Randomの表示要素
  └── Timeline/
```

**理由:**
- `LayoutToggle`は`GalleryView`のUI要素として直接レンダリング
- `DraggableImage`は`Random`の表示要素として直接レンダリング

#### 例2: UserImageDropArea
```
UserImageDropArea/
  ├── index.tsx              # 親コンポーネント
  ├── ImageDropArea/         # ルールB: トリガー
  └── UploadDrawer/          # ルールB: コンテンツ
      ├── index.tsx
      ├── FilmCounter/       # ルールA: ドロワーのUI部分
      └── UploadForm/        # ルールA: ドロワーのUI部分
```

**理由:**
- `ImageDropArea`（ドロップエリア）と`UploadDrawer`は独立したUIなので兄弟配置
- `FilmCounter`と`UploadForm`は`UploadDrawer`のUI構造の一部

### ❌ 悪い例（修正前）

```
image/[imageId]/_components/
  ├── EditDrawer/            # ← EditButtonから使われるが、離れた場所にある
  └── ImagePageContent/
      └── EditButton/        # ← EditDrawerを開くボタン
```

**問題点:**
- `EditButton`を見ても、`EditDrawer`が兄弟にあるとは分からない
- `EditButton`の中に`EditDrawer`があると誤解する可能性

### ✅ 良い例（修正後）

```
image/[imageId]/_components/
  ├── EditButton/            # ルールB: トリガー
  ├── EditDrawer/            # ルールB: コンテンツ
  └── ImagePageContent/      # EditButtonを使用
      ├── index.tsx
      ├── BigImage/          # ルールA: ページのUI部分
      ├── RemoveButton/      # ルールA: ページのUI部分
      └── ShareButton/       # ルールA: ページのUI部分
```

**改善点:**
- `EditButton`と`EditDrawer`が兄弟なので関係性が明確
- トリガーとコンテンツの関係が一目で分かる

## プレフィクス `_` の使用

ページ配下でのみ使うファイルには、プレフィクスに `_` をつけます。

```
user/[userId]/
  ├── page.tsx               # ページ本体
  ├── _components/           # このページ配下でのみ使用
  ├── _actions/              # このページ配下でのみ使用
  ├── _schemas/              # このページ配下でのみ使用
  ├── _lib/                  # このページ配下でのみ使用
  └── tag/[tagId]/
      ├── page.tsx
      └── _components/       # tag/[tagId]ページでのみ使用
```

**ルール:**
- 下の階層で共通して使うコンポーネントは親階層の`_components`などに配置
- 特定のページでのみ使うものは、そのページの`_components`に配置

## まとめ

| 関係性 | 配置場所 | 判断基準 |
|--------|----------|----------|
| 親のUI部分 | 親の中 | 視覚的に親の一部、直接レンダリング |
| トリガー⇔コンテンツ | 兄弟 | 独立したUI、状態で制御 |
| 複数箇所で使用 | 共通の親 | 2箇所以上から使用 |

これらのルールに従うことで、ファイル探索時の認知負荷を下げ、コンポーネントの関係性を明確にします。
