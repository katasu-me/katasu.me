# タグ入力オートコンプリート 実装計画書

AIエージェント向けの実装計画書。画像の投稿ドロワー・編集ドロワーのタグ入力欄で、ユーザーが過去に使ったタグをIMEのように自動補完（サジェスト）表示する。

## 背景と要件

- 対象は投稿フォーム（`UploadForm`）と編集フォーム（`EditForm`）のタグ入力欄
- 補完候補は「そのユーザー自身が過去に画像へ付けたことのあるタグ」のみ。他ユーザーのタグは出さない
- 入力文字列に応じて候補を絞り込む（IMEの変換候補のような体験）
- 新規ライブラリは導入しない（既存の自前ドロップダウンを活用）

## 現状把握（実装前に読むべきファイル）

**この機能の土台はほぼ完成している。** 残作業は「候補データの配線」と「入力値による絞り込み」の2点。

| 領域 | 状態 | ファイル |
|---|---|---|
| 補完UI | **実装済み** | `apps/service/src/components/TagInput/index.tsx` |
| 候補の受け口 | **実装済み**（`suggestTags: string[]` prop） | 同上 `index.tsx:14` |
| 呼び出し側 | `suggestTags={[]}` 固定 ← **ここを差し替える** | `UploadForm/index.tsx`, `EditForm/index.tsx` |
| DBクエリ | **実装済み**（`fetchTagsByUserId`） | `packages/service-db/src/queries/tag.ts:69` |
| KVキャッシュ | **実装済み**（キー定義＋無効化） | `apps/service/src/libs/cache.ts:22-31` |
| 入力値での絞り込み | **未実装** ← 追加する | `TagInput/index.tsx:45` |

### TagInput の既存実装

- `apps/service/src/components/TagInput/index.tsx`（投稿・編集フォームで共有。チップ形式＋補完ドロップダウン）
  - `suggestTags` から入力済みタグを除外して表示（`:45` の `filteredSuggestTags`）
  - ArrowUp/Down・Tab・Enter・Escape のキーボード操作、IME対応（`compositionstart/end` を `isComposingRef` で監視）、ドロップダウンの上下自動配置まで完備
  - ドロップダウンは `inputValue.trim() !== ""` で開く（`:242-247`）
  - **注意: 現状は入力文字列による候補の絞り込みをしていない**。`suggestTags` を渡すと「入力済み除外後の全候補」が常に出る
- テスト: `TagInput/index.spec.tsx`、Storybook: `TagInput/index.stories.tsx`

### データ層の既存実装

- `fetchTagsByUserId(db, userId, { order: "usage" | "name", limit? })`（`packages/service-db/src/queries/tag.ts:69`）
  - `imageTag` を leftJoin して使用数を集計し、**使用数0のタグは除外済み**。戻り値は `ActionResult<Tag[]>`
  - **注意: `hiddenAt`（非表示化されたタグ）のフィルタはしていない**。補完候補からは除外すること（後述）
- KVキャッシュ: `CACHE_KEYS.userTagsByUsage(userId)` / `userTagsByName(userId)`（`apps/service/src/libs/cache.ts:27-30`）
  - upload / edit / delete の各 server-fn が既に両キーを無効化している（`image-upload/server-fn/upload.ts:117`、`image-edit/server-fn/edit-image.ts:100`、`image-delete/server-fn/delete-image.ts:68`）。**サーバー側キャッシュ無効化の追加実装は不要**
- server-fn のテンプレート: `apps/service/src/features/gallery/server-fn/tag-list-page.ts`（`getCached` + `fetchTagsByUserId` の組み合わせ）
- queryOptions エクスポートのテンプレート: `apps/service/src/features/gallery/server-fn/user-page.ts:79-85`
- 認証: `requireAuth()`（`apps/service/src/features/auth/libs/auth.ts:93`）、クライアント側は `useSession()`（`apps/service/src/features/auth/libs/auth-client.ts`。使用例: `UploadContext.tsx:110-112`）
- feature間import の前例: `UploadContext.tsx:4-6` が `@/features/gallery/server-fn/*` の QUERY_KEY を import している

## 設計方針

### データフロー

```
[サーバー]
suggestTagsFn (新規 server-fn, GET)
  └ requireAuth() で自分の userId を取得（クライアントから userId は受け取らない）
  └ getCached(CACHE_KV, userTagsByUsage(userId), () => fetchTagsByUserId(DB, userId, { order: "usage" }))
  └ hiddenAt が null のタグのみに絞り、タグ名の string[] を返す

[クライアント]
UploadForm / EditForm
  └ useQuery(suggestTagsQueryOptions(userId))   ※userId は useSession() から（queryKey分離用）
  └ TagInput に suggestTags={data ?? []} を渡す

[TagInput]
  └ inputValue で候補を部分一致フィルタして表示（新規追加）
```

### 設計上の決定事項

1. **候補の並び順は使用頻度順**（`order: "usage"`）。よく使うタグほど上に出す
2. **`hiddenAt` が設定されたタグは候補から除外する**。`fetchTagsByUserId` は既存の呼び出し元（gallery系）に影響するため変更せず、新規 server-fn 側で `filter((t) => !t.hiddenAt)` する
3. **絞り込みはクライアント側で行う**。候補はユーザー1人分のタグ全量（KVキャッシュ済み）で高々数十〜数百件想定のため、サーバー側検索APIは作らない。1回取得して `inputValue` でフィルタする
4. **絞り込みは前方一致優先＋部分一致**。IMEの変換候補に近い体験にするため、前方一致するものを先頭に、それ以外の部分一致を後ろに並べる。英字は大文字小文字を区別しない
5. **ドロップダウンを開く条件は現状維持**（入力が空でないとき）。空入力＋フォーカスで全候補を出す挙動は今回のスコープ外
6. **server-fn の置き場所は `features/gallery/server-fn/`**。タグ関連の server-fn（`tag-page.ts`、`tag-list-page.ts`）が既にここにあり、upload feature から gallery の server-fn を import する前例もあるため
7. 新規ライブラリ（cmdk / downshift / Radix Popover 等）は**導入しない**

## 実装手順

### Step 1: server-fn の新規作成

**新規ファイル**: `apps/service/src/features/gallery/server-fn/suggest-tags.ts`

`tag-list-page.ts` をテンプレートに作成する。

```ts
import { env } from "cloudflare:workers";
import { fetchTagsByUserId } from "@katasu.me/service-db";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { requireAuth } from "@/features/auth/libs/auth";
import { CACHE_KEYS, getCached } from "@/libs/cache";

export const suggestTagsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { session } = await requireAuth();
  const userId = session.user.id;

  const result = await getCached(env.CACHE_KV, CACHE_KEYS.userTagsByUsage(userId), async () => {
    return fetchTagsByUserId(env.DB, userId, { order: "usage" });
  });

  if (!result.success) {
    // 補完は補助機能なので、失敗してもフォーム自体は使えるよう空配列で握りつぶす
    return [];
  }

  // 非表示化（モデレーション）されたタグは候補に出さない
  return (result.data ?? []).filter((tag) => !tag.hiddenAt).map((tag) => tag.name);
});

export const SUGGEST_TAGS_QUERY_KEY = "suggest-tags";

export const suggestTagsQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: [SUGGEST_TAGS_QUERY_KEY, userId],
    queryFn: () => suggestTagsFn(),
  });
```

注意点:

- `userId` はクライアントから受け取らず `requireAuth()` で取得する（他人のタグ一覧を引けないようにするため）
- `queryKey` に `userId` を含めるのはアカウント切り替え時のキャッシュ分離のため。queryFn 自体は入力を取らない
- KVキャッシュのキーは既存の `userTagsByUsage` を再利用する。upload / edit / delete 時の無効化が既に実装されているため、投稿後にKV側は自動で最新化される

### Step 2: TagInput に入力値での絞り込みを追加

**変更ファイル**: `apps/service/src/components/TagInput/index.tsx`

`filteredSuggestTags`（`:45`）を、入力済み除外に加えて `inputValue` での絞り込みを行うよう変更する。

```ts
// IMEの変換候補のように、入力に応じて候補を絞り込む（前方一致を優先表示）
const filteredSuggestTags = (() => {
  const candidates = suggestTags.filter((tag) => !tags.includes(tag));
  const query = inputValue.trim().toLowerCase();

  if (query === "") {
    return candidates;
  }

  const prefixMatches = candidates.filter((tag) => tag.toLowerCase().startsWith(query));
  const partialMatches = candidates.filter(
    (tag) => !tag.toLowerCase().startsWith(query) && tag.toLowerCase().includes(query),
  );

  return [...prefixMatches, ...partialMatches];
})();
```

実装時の注意:

- `suggestTags` は使用頻度順で渡ってくるため、前方一致グループ・部分一致グループの中では元の順序（頻度順）を保つこと（`filter` は順序を保持するのでこのままでよい）
- IME変換中も `onChange` は発火して `inputValue` が更新されるため、**変換中でもリアルタイムに絞り込まれる**。追加対応は不要
- 絞り込み結果が変わると候補リストの長さが変わるため、`highlightedIndex` が範囲外を指す可能性がある。`handleInputChange`（`:232`）では既に `setHighlightedIndex(-1)` されているので入力変更時は問題ないが、確認しておくこと
- 候補0件のときはドロップダウン非表示（`:346` の `filteredSuggestTags.length > 0` 条件で既に対応済み）
- タグが `maxTags` 件に達している場合、候補を選んでも `addTag` 内のガードで追加されないだけで候補は出続ける。`tags.length >= maxTags` のときは候補を空にしてドロップダウンを出さないようにするとより親切（任意）

### Step 3: UploadForm への配線

**変更ファイル**: `apps/service/src/features/image-upload/components/UploadForm/index.tsx`

```tsx
import { useQuery } from "@tanstack/react-query";
import { suggestTagsQueryOptions } from "@/features/gallery/server-fn/suggest-tags";
import { useSession } from "@/features/auth/libs/auth-client";

// コンポーネント内
const { data: session } = useSession();
const userId = session?.user.id;

const { data: suggestTags } = useQuery({
  ...suggestTagsQueryOptions(userId ?? ""),
  enabled: !!userId,
});

// TagInput の suggestTags={[]} を差し替え
<TagInput
  ...
  suggestTags={suggestTags ?? []}
  ...
/>
```

注意点:

- `UploadDrawer` は `__root.tsx:78` でグローバルにマウントされている。**`UploadForm` がドロワーを閉じた状態でもマウントされ続けるかを確認し**、常時マウントならドロワーの開閉状態も `enabled` に含めて、アプリ起動時の不要なfetchを避けること（ドロワー開時のみレンダリングされるなら `enabled: !!userId` だけでよい）
- 未ログイン時は `enabled: false` で fetch しない（`suggestTags` は `[]` のまま）

### Step 4: EditForm への配線

**変更ファイル**: `apps/service/src/features/image-edit/components/EditForm/index.tsx`

Step 3 と同じパターンで `suggestTags={[]}`（`:106`）を差し替える。`EditForm` は `EditDrawer` を開いたときにレンダリングされるため、マウント時 fetch で問題ない。

### Step 5: クライアント側 Query キャッシュの無効化

投稿・編集で新しいタグが増えた後、次にドロワーを開いたとき候補に反映されるようにする。

**変更ファイル 1**: `apps/service/src/features/image-upload/contexts/UploadContext.tsx`

- `invalidateQueries`（`:285-300`）に `SUGGEST_TAGS_QUERY_KEY` の invalidate を追加する（既存の `TAG_PAGE_QUERY_KEY` 等と同じ書き方）

**変更ファイル 2**: `apps/service/src/features/image-edit/components/EditButton/index.tsx`

- 編集成功時の `queryClient.invalidateQueries`（`:24` 付近）に `SUGGEST_TAGS_QUERY_KEY` を追加する

サーバー側のKVキャッシュ無効化は既存実装で済んでいるため、変更不要。

### Step 6: テスト・Storybook

**変更ファイル**: `apps/service/src/components/TagInput/index.spec.tsx`

既存テストのスタイルに合わせて、絞り込みの仕様を検証するテストを追加する:

- 入力文字列に前方一致する候補が表示される
- 部分一致する候補も表示され、前方一致より後ろに並ぶ
- 英字の大文字小文字を区別せずマッチする
- どの候補にもマッチしない入力ではドロップダウンが表示されない
- 入力済みのタグは候補に出ない（既存仕様の回帰確認）

**変更ファイル**: `apps/service/src/components/TagInput/index.stories.tsx`

- `suggestTags` に現実的な候補（日本語・英字混在、10件程度）を渡した Story を追加・更新し、絞り込み挙動を Storybook 上で確認できるようにする

### Step 7: 動作確認

1. `pnpm check` と `pnpm test` を通す
2. `pnpm dev` で起動し、agent-browser で確認する（`https://local.katasu.me:3000`）:
   - ログイン済みユーザーで投稿ドロワーを開き、タグ欄に入力 → 過去に使ったタグが絞り込まれて表示される
   - 日本語IMEでの変換中にも候補が絞り込まれる（変換確定のEnterでタグが追加されないこと = 既存のIMEガードの回帰確認）
   - 候補をクリック / Tab+Enter で選択 → タグとして追加される
   - 編集ドロワーでも同様に動作する
   - 新しいタグを付けて投稿 → 再度ドロワーを開くとそのタグが候補に出る（Query invalidate の確認）

## スコープ外（今回はやらない）

- 空入力＋フォーカス時に全候補を表示する挙動（要望が出たら検討）
- サーバー側での検索API（候補件数が問題になるまで不要）
- ひらがな/カタカナ・全角/半角の正規化マッチ（NFKC等）。まずは単純な部分一致で様子を見る
- 他ユーザーのタグや人気タグのサジェスト

## 関連ファイル一覧（クイックリファレンス）

| 役割 | パス |
|---|---|
| 補完UI本体 | `apps/service/src/components/TagInput/index.tsx` |
| 投稿フォーム | `apps/service/src/features/image-upload/components/UploadForm/index.tsx` |
| 編集フォーム | `apps/service/src/features/image-edit/components/EditForm/index.tsx` |
| 新規 server-fn（作成する） | `apps/service/src/features/gallery/server-fn/suggest-tags.ts` |
| DBクエリ | `packages/service-db/src/queries/tag.ts` |
| DBスキーマ（tag / imageTag） | `packages/service-db/src/schema/image.ts` |
| KVキャッシュ | `apps/service/src/libs/cache.ts` |
| 認証（サーバー） | `apps/service/src/features/auth/libs/auth.ts` |
| 認証（クライアント） | `apps/service/src/features/auth/libs/auth-client.ts` |
| タグのバリデーション定数 | `apps/service/src/schemas/image-form.ts` |
| Query invalidate（投稿後） | `apps/service/src/features/image-upload/contexts/UploadContext.tsx` |
| Query invalidate（編集後） | `apps/service/src/features/image-edit/components/EditButton/index.tsx` |
