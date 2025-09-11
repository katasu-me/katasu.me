import { eq, sql } from "drizzle-orm";
import type { AnyD1Database } from "drizzle-orm/d1";
import { type Photo, photo } from "../schema";
import { getDB } from "./db";

/**
 * 写真をアップロードする
 * @param dbInstance D1インスタンス
 * @param photoData 写真データ
 * @returns 挿入結果
 */
export async function uploadPhoto(
  dbInstance: AnyD1Database,
  photoData: Omit<Photo, "id" | "createdAt">,
): Promise<Photo> {
  const db = getDB(dbInstance);

  return await db.insert(photo).values(photoData);
}

/**
 * 写真情報を更新する
 * @param dbInstance D1インスタンス
 * @param photoId 写真ID
 * @param updateData 更新データ
 * @returns 更新後の写真情報
 */
export async function updatePhoto(
  dbInstance: AnyD1Database,
  photoId: string,
  updateData: Partial<Omit<Photo, "id" | "filename" | "createdAt">>,
): Promise<Photo> {
  const db = getDB(dbInstance);

  return await db.update(photo).set(updateData).where(eq(photo.id, photoId)).returning().get();
}

/**
 * 写真IDで写真を削除する
 * @param dbInstance D1インスタンス
 * @param photoId 写真ID
 * @returns 削除結果
 */
export async function deletePhotoById(dbInstance: AnyD1Database, photoId: string): Promise<void> {
  const db = getDB(dbInstance);

  return await db.delete(photo).where(eq(photo.id, photoId));
}

/**
 * 写真IDから写真を取得する
 * @param dbInstance D1インスタンス
 * @param photoId 写真ID
 * @returns 写真情報、存在しない場合はundefined
 */
export async function getPhotoById(dbInstance: AnyD1Database, photoId: string): Promise<Photo | undefined> {
  const db = getDB(dbInstance);

  return await db.query.photo.findFirst({
    where: eq(photo.id, photoId),
  });
}

/**
 * ▽ユーザーIDから写真一覧を取得する
 * @param dbInstance D1インスタンス
 * @param userId ユーザーID
 * @returns 写真一覧
 */
export async function getPhotosByUserId(dbInstance: AnyD1Database, userId: string): Promise<Photo[]> {
  const db = getDB(dbInstance);

  return await db.query.photo.findMany({
    where: eq(photo.userId, userId),
    // TODO: ソートとぺージング
  });
}

/**
 * ユーザーIDからランダムに10件の写真を取得する
 * @param dbInstance D1インスタンス
 * @param userId ユーザーID
 * @returns ランダムに取得した写真一覧
 */
export async function getRandomPhotosByUserId(dbInstance: AnyD1Database, userId: string): Promise<Photo[]> {
  const db = getDB(dbInstance);

  return await db.query.photo.findMany({
    where: eq(photo.userId, userId),
    orderBy: [sql`RANDOM()`], // TODO: 要検証
    limit: 10,
  });
}
