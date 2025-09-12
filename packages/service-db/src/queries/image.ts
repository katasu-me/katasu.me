import { eq, sql } from "drizzle-orm";
import type { AnyD1Database } from "drizzle-orm/d1";
import { type Image, image } from "../schema";
import { getDB } from "./db";

/**
 * 画像をアップロードする
 * @param dbInstance D1インスタンス
 * @param imageData 画像データ
 * @returns 挿入結果
 */
export async function uploadImage(
  dbInstance: AnyD1Database,
  imageData: Omit<Image, "id" | "createdAt">,
): Promise<Image> {
  const db = getDB(dbInstance);

  return await db.insert(image).values(imageData);
}

/**
 * 画像情報を更新する
 * @param dbInstance D1インスタンス
 * @param imageId 画像ID
 * @param updateData 更新データ
 * @returns 更新後の画像情報
 */
export async function updateImage(
  dbInstance: AnyD1Database,
  imageId: string,
  updateData: Partial<Omit<Image, "id" | "filename" | "createdAt">>,
): Promise<Image> {
  const db = getDB(dbInstance);

  return await db.update(image).set(updateData).where(eq(image.id, imageId)).returning().get();
}

/**
 * 画像IDで画像を削除する
 * @param dbInstance D1インスタンス
 * @param imageId 画像ID
 * @returns 削除結果
 */
export async function deleteImageById(dbInstance: AnyD1Database, imageId: string): Promise<void> {
  const db = getDB(dbInstance);

  return await db.delete(image).where(eq(image.id, imageId));
}

/**
 * 画像IDから画像を取得する
 * @param dbInstance D1インスタンス
 * @param imageId 画像ID
 * @returns 画像情報、存在しない場合はundefined
 */
export async function getImageById(dbInstance: AnyD1Database, imageId: string): Promise<Image | undefined> {
  const db = getDB(dbInstance);

  return await db.query.image.findFirst({
    where: eq(image.id, imageId),
  });
}

/**
 * ▽ユーザーIDから画像一覧を取得する
 * @param dbInstance D1インスタンス
 * @param userId ユーザーID
 * @returns 画像一覧
 */
export async function getImagesByUserId(dbInstance: AnyD1Database, userId: string): Promise<Image[]> {
  const db = getDB(dbInstance);

  return await db.query.image.findMany({
    where: eq(image.userId, userId),
    // TODO: ソートとぺージング
  });
}

/**
 * ユーザーIDからランダムに10件の画像を取得する
 * @param dbInstance D1インスタンス
 * @param userId ユーザーID
 * @returns ランダムに取得した画像一覧
 */
export async function getRandomImagesByUserId(dbInstance: AnyD1Database, userId: string): Promise<Image[]> {
  const db = getDB(dbInstance);

  return await db.query.image.findMany({
    where: eq(image.userId, userId),
    orderBy: [sql`RANDOM()`], // TODO: 要検証
    limit: 10,
  });
}
