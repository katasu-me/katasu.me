const isDev = import.meta.env.MODE === "development";
const DEFAULT_TTL = 600; // 10分

type CachedData<T> = {
  data: T;
  version: string;
  cachedAt: number;
};

type CacheOptions = {
  ttl?: number; // デフォルト: 600秒
};

/**
 * ActionResult型かどうかを判定する型ガード
 */
function isActionResult(value: unknown): value is { success: boolean } {
  return typeof value === "object" && value !== null && "success" in value && typeof value.success === "boolean";
}

export const CACHE_KEYS = {
  /** ユーザーの公開データ */
  user: (userId: string) => `cache:user:${userId}`,

  /** ユーザーの画像一覧 */
  userImages: (userId: string) => `cache:images:user:${userId}`,

  /** ユーザーの総画像数 */
  userImageCount: (userId: string) => `cache:images:user:${userId}:count`,

  /** 画像詳細 */
  imageDetail: (imageId: string) => `cache:images:detail:${imageId}`,

  /** タグ別画像一覧 */
  tagImages: (tagId: string) => `cache:images:tag:${tagId}`,

  /** タグの総画像数 */
  tagTotalImageCount: (tagId: string) => `cache:images:tag:${tagId}:count`,

  /** ユーザーのタグ一覧（使用頻度順） */
  userTagsByUsage: (userId: string) => `cache:tags:user:${userId}:usage`,

  /** ユーザーのタグ一覧（名前順） */
  userTagsByName: (userId: string) => `cache:tags:user:${userId}:name`,
} as const;

/**
 * キャッシュのバージョンキーを生成
 */
const versionKey = (key: string) => `version:${key}`;

/**
 * KVからキャッシュを取得する
 * バージョンが一致する場合のみキャッシュを返す
 * @param kv KV Namespace
 * @param key キャッシュキー
 * @param fetchFn キャッシュミス時に実行する関数
 * @param options キャッシュオプション
 * @returns データ
 */
export async function getCached<T>(
  kv: KVNamespace,
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {},
): Promise<T> {
  try {
    const ttl = options.ttl ?? DEFAULT_TTL;
    const vKey = versionKey(key);

    // キャッシュとバージョンを取得
    const [cached, expectedVersion] = await Promise.all([kv.get<CachedData<T>>(key, "json"), kv.get(vKey, "text")]);

    // バージョンが一致すればキャッシュを返す
    if (cached && cached.version === expectedVersion) {
      if (isDev) {
        console.log(`Cache HIT: ${key}`);
      }

      return cached.data;
    }

    if (isDev) {
      console.log(`Cache MISS: ${key}`);
    }

    // キャッシュミスならDBから取得
    const freshData = await fetchFn();

    // ActionResult型でsuccess: falseの場合はキャッシュしない
    if (isActionResult(freshData) && !freshData.success) {
      if (isDev) {
        console.log(`Cache SKIP (error result): ${key}`);
      }

      return freshData;
    }

    const version = expectedVersion || Date.now().toString();

    const cacheData: CachedData<T> = {
      data: freshData,
      version,
      cachedAt: Date.now(),
    };

    // キャッシュとバージョンを書き込む
    await Promise.all([
      kv.put(key, JSON.stringify(cacheData), { expirationTtl: ttl }),
      expectedVersion ? Promise.resolve() : kv.put(vKey, version, { expirationTtl: ttl * 2 }),
    ]);

    return freshData;
  } catch (error) {
    // エラー時はDBから直接取得
    console.error("Cache error:", error);
    return await fetchFn();
  }
}

/**
 * キャッシュを無効化する
 * @param kv KV Namespace
 * @param key キャッシュキー
 */
export async function invalidateCache(kv: KVNamespace, key: string): Promise<void> {
  try {
    const vKey = versionKey(key);
    const newVersion = Date.now().toString();

    if (isDev) {
      console.log(`Cache INVALIDATE: ${key}`);
    }

    // 新しいバージョンを書き込み、古いキャッシュを削除
    await Promise.all([kv.put(vKey, newVersion), kv.delete(key)]);
  } catch (error) {
    console.error("Cache invalidation error:", error);
  }
}

/**
 * 複数のキャッシュを一括無効化
 * @param kv KV Namespace
 * @param keys キャッシュキーの配列
 */
export async function invalidateCaches(kv: KVNamespace, keys: string[]): Promise<void> {
  await Promise.all(keys.map((key) => invalidateCache(kv, key)));
}
