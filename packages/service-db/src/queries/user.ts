import { eq } from "drizzle-orm";

import type { AnyD1Database } from "drizzle-orm/d1";
import { type User, user } from "../schema";
import { getDB } from "./db";

/**
 * ユーザーIDからユーザーを取得する
 * @param dbInstance D1インスタンス
 * @param userId ユーザーID
 * @returns ユーザー情報、存在しない場合はundefined
 */
export async function getUserById(dbInstance: AnyD1Database, userId: string): Promise<User | undefined> {
  const db = getDB(dbInstance);

  const user = await db.query.user.findFirst({
    where: (u) => eq(u.id, userId),
  });

  return user;
}

/**
 * ユーザー情報を更新する
 * @param dbInstance D1インスタンス
 * @param userId ユーザーID
 * @param updateData 更新データ
 * @returns 更新後のユーザー情報
 */
export async function updateUser(
  dbInstance: AnyD1Database,
  userId: string,
  updateData: Partial<Omit<User, "id">>,
): Promise<User | undefined> {
  const db = getDB(dbInstance);

  const updatedUser = await db.update(user).set(updateData).where(eq(user.id, userId)).returning().get();

  return updatedUser;
}
