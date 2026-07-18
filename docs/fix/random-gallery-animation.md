# シャッフル表示: 初期アニメーション二重再生の修正 & 落下アニメーションへの刷新

エージェント向け実装指示書。以下の2つを行う。

1. シャッフル表示 → 一覧表示 → シャッフル表示と遷移したときに、初期表示アニメーションが2回再生されるバグの修正
2. 初期表示アニメーションを「上から写真がぱらぱら降ってくる（封筒の中身をぶちまける）」演出に刷新

対象ファイル:

- `apps/service/src/features/gallery/server-fn/fetch-random.ts`
- `apps/service/src/features/gallery/components/GalleryRandom/index.tsx`
- `apps/service/src/features/gallery/components/GalleryRandom/DraggableImages/index.tsx`
- `apps/service/src/features/gallery/components/GalleryRandom/DraggableImage/index.tsx`
- （任意）`apps/service/src/features/gallery/server-fn/user-page.ts`

---

## 1. バグ: 初期アニメーションが2回再生される

### 現象

本番環境で、シャッフル表示 → 一覧表示 → シャッフル表示と遷移すると、写真の登場アニメーションが2回連続で再生される。

### 根本原因

`randomImagesQueryOptions`（`fetch-random.ts`）に `staleTime` が未指定のため、TanStack Query のデフォルト（`staleTime: 0`）が適用され、クエリは常に stale 扱いになる。このとき以下が起きる:

1. シャッフル表示に戻ると `GalleryRandom` が再マウントされ、`useSuspenseQuery` がキャッシュ済みの**旧データで即レンダリング** → 初期アニメーション1回目
2. 同時に stale クエリの**バックグラウンド再フェッチ**が走る（`refetchOnMount` のデフォルト動作）。サーバー側は `ORDER BY RANDOM()`（`packages/service-db/src/queries/image/fetch.ts` の `fetchRandomImagesByUserId` / `fetchRandomImagesByTagId`）なので**別の画像セット（別ID）**が返る
3. `DraggableImages` 内で `key={image.id}` を使っているため、IDが変わった `DraggableImage` が**再マウント**され、motion の `initial` が再実行 → 初期アニメーション2回目

なお `refetchOnWindowFocus: false` は指定済みだが、マウント時の再フェッチは防げていない。

### 「本番でのみ再現」する理由

ビルドの差ではなく**データ量の差**である可能性が高い。ユーザーの公開画像が `DEFAULT_RANDOM_IMAGES_LIMIT`（10件）以下の環境では、再フェッチしても同じID集合が返る（順序が変わるだけ）。React は key で並べ替えるだけで再マウントしないため、2回目のアニメーションが発生しない。本番はデータが多く、再フェッチで異なるサブセットが返るため再現する。

**検証方法**: 開発環境でも対象ユーザーに画像を11枚以上入れれば再現するはず。修正前に一度再現させて原因を確認すること。

### 修正方針

`randomImagesQueryOptions` に `staleTime: Infinity` を追加する。

```ts
export const randomImagesQueryOptions = (input: FetchRandomImagesInput) =>
  queryOptions({
    queryKey: getRandomImagesQueryKey(input),
    queryFn: () => fetchRandomImagesFn({ data: input }),
    // シャッフル操作（invalidateQueries）以外で勝手に再取得されると
    // 画像セットが差し替わり初期アニメーションが二重再生されるため
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
```

- 再シャッフル（ボタン/シェイク）は `GalleryRandom` の `handleScatterComplete` が `invalidateQueries` を明示的に呼んでおり、`staleTime: Infinity` でも invalidate は再フェッチを強制するため機能は維持される
- 副作用: 一覧 → シャッフルと戻ったとき、前回と同じ画像セットが表示される（gcTime 内なら）。「表示に入り直すたびに新しいセットにしたい」場合は、代わりに `GalleryRandom` のマウント時に `queryClient.removeQueries` してから描画する設計になるが、Suspense 境界の追加が必要になるため、まずは `staleTime: Infinity` を推奨する

### （任意）関連する無駄フェッチの解消

`user-page.ts` の `userPageLoaderFn` は `view === "random"` のとき `fetchRandomImagesFn` を呼んでいるが、その `images` はルートコンポーネント（`routes/user/_layout.$userSlug/index.tsx`）で `GalleryRandom` に渡されず捨てられている（実際の表示は `randomImagesQueryOptions` 側のフェッチ）。つまりシャッフル表示を開くたびにランダム取得APIが2回叩かれ、レートリミット（`ACTIONS_RATE_LIMITER`）も2重に消費している。

→ `view === "random"` 分岐では `fetchRandomImagesFn` を呼ばず `tags` のみ返すよう修正してよい。戻り値の型（`images` を optional にする等）と呼び出し側への影響を確認すること。`routes/user/_layout.$userSlug/tag/$tagId.tsx` にも同様の構造がないか確認する。

---

## 2. 新アニメーション: 上から写真がぱらぱら降ってくる

### コンセプト

写真の入った封筒を画面上部でひっくり返して中身をぶちまけるイメージ。

- 写真は**画面上端の外・中央付近**（封筒の口）から1枚ずつ落ちてくる
- 落下中はくるくる回転し、最終的なランダム配置位置に**加速しながら落ちて、着地で軽く弾んで**静止する
- フェードイン/ブラーは使わない（写真が実体として落ちる）。現行の `opacity: 0` + `filter: blur(16px)` から `scale: 1.5` で浮き上がる演出は廃止
- 1枚ごとに少しずつタイミングをずらして「ぱらぱら」感を出す

### 実装方針

#### 2-1. 落下パラメータを位置生成時に決める（`DraggableImages`）

レンダー中に `Math.random()` を呼ぶと再レンダーごとに値が変わるため、落下開始位置・初期回転は `getRandomPosition` で着地位置と一緒に生成して state に持たせる。`Position` 型（`DraggableImage/index.tsx` で定義）を拡張する:

```ts
export type Position = {
  x: number;
  y: number;
  rotation: number;
  // 落下開始時のパラメータ（封筒の口からぶちまけられる演出用）
  dropX: number;        // 開始X: 中央付近（例: x * 0.2 + ランダムずれ ±60px）
  dropRotation: number; // 開始回転: rotation ± 90〜180度（落下中に回って見える）
};
```

開始Yはコンテナ上端の外（例: `-(containerHeight / 2) - 400`）。コンテナ高さは `getRandomPosition` が既に `container.clientHeight` を参照しているので、そこで計算して `dropY` として持たせてもよい。

#### 2-2. positions 確定前に描画しない（`DraggableImages`）

現状は `positions` が `useLayoutEffect` で設定されるまで各画像が `{ x: 0, y: 0, rotation: 0 }` のフォールバック位置で描画され、アニメーションのターゲットが途中で差し替わる。落下アニメーションでは出発点も positions に依存するため、これを許容できない。

`positions.length !== images.length` の間は画像をレンダリングしない（コンテナ `motion.div` だけ描画して ref を確保する。ref がないと位置計算ができない点に注意）。

#### 2-3. アニメーション定義の変更（`DraggableImage`）

```tsx
initial={{
  x: initialPosition.dropX,
  y: -(コンテナ高さ / 2) - 400, // 画面上外。containerRef から算出、または Position に持たせる
  rotateZ: initialPosition.dropRotation,
  opacity: 1,
  scale: 1,
}}
animate={
  isScattering
    ? { /* 現行の散らし演出を維持 */ }
    : {
        x: initialPosition.x,
        y: initialPosition.y,
        rotateZ: initialPosition.rotation,
        opacity: 1,
        scale: 1,
      }
}
transition={
  isScattering
    ? { /* 現行維持 */ }
    : {
        type: "spring",
        delay,
        stiffness: 120,
        damping: 15,
        mass: 1.2,
      }
}
```

- 重力感は spring のパラメータで表現する（stiffness 低め + damping 低めで、加速して落ち着地でわずかにオーバーシュート）。数値は目安なので、Storybook で見た目を調整すること
- **注意**: `rotateZ` は現在 `useTransform([x, y], ...)` でドラッグ量に応じて計算する motion value として `style` に渡されている。`style` の motion value と `animate` の `rotateZ` は競合する。対応方針: 落下中は `animate` で `rotateZ` を制御したいので、`style` から `rotateZ` を外し、`rotateZ` 用の `useTransform` の出力を `animate` 完了後にのみ適用する…といった複雑化を避けるため、**ドラッグ中の回転補正（`deltaX * 0.02 + deltaY * 0.01`）を維持したい場合は、`useTransform` のベース値に「アニメーション済みか」を織り込む**か、シンプルに次のいずれかを選ぶ:
  - 案A（推奨・シンプル）: `rotateZ` の `useTransform` は現状維持（`style` 渡し）とし、落下中の回転は**親ではなく内側のラッパー `div`**（`motion.div` を1枚追加）に `rotate` アニメーションとして与える。外側=位置・ドラッグ回転、内側=落下時の回転演出、と責務を分離する
  - 案B: ドラッグ時の回転追従を廃止し、`rotateZ` を `animate` に一本化する（挙動変更になるため要確認）
- `x`/`y` は現状どおり `useMotionValue` を `style` に渡しつつ `animate` でターゲット指定する形を踏襲する（この組み合わせは現行コードで動作実績あり）。ただし `useMotionValue(initialPosition.x)` の初期値は `dropX` / 画面外Y に変更すること
- stagger は現行の `delay = i * 0.05` を `i * 0.06〜0.08` 程度に調整し、「ぱらぱら」感が足りなければ `getRandomPosition` で ±0.03s 程度のジッタを生成して加算する

#### 2-4. 散らし演出（isScattering）は現状維持

再シャッフル時のフェードアウト（`opacity: 0` + blur）は今回のスコープ外。ただし新しい落下演出と組み合わせて違和感がないか確認し、気になる場合は「下に滑り落ちて消える」案を別途提案としてまとめる（実装はしない）。

#### 2-5. `onAnimationComplete` の発火に注意

`onAnimationComplete` は `isScattering` 時の完了検知に使われている（最後の1枚が `onScatterComplete` を呼ぶ）。落下アニメーション側の変更で発火タイミングが変わらないか確認する。spring は完全静止まで時間がかかるため、散らし → 再表示のテンポが悪くなっていないかも見る。

### 動作確認

1. `apps/service` で `pnpm storybook` を起動し、`GalleryRandom/DraggableImages` のストーリーで見た目を調整する
2. `pnpm dev` で `local.katasu.me:3000` を起動し、実データで確認する。ブラウザ操作には agent-browser を使用する
3. 確認項目:
   - [ ] 初回のシャッフル表示で、写真が上からぱらぱら降ってくる
   - [ ] シャッフル → 一覧 → シャッフルで、アニメーションが**1回だけ**再生される（画像11枚以上のユーザーで確認）
   - [ ] シャッフルボタン/シェイクでの再シャッフルが従来どおり動く（散らし → 新しいセットが降ってくる）
   - [ ] ドラッグ操作（掴んで動かす、最前面化、回転追従）が壊れていない
   - [ ] モバイル幅（768px未満）でも画像が画面外の変な位置に落ちない
   - [ ] タグページのシャッフル表示（`/user/$userSlug/tag/$tagId`）でも同様に動く
4. `pnpm check` と `pnpm test` を通す
