import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { user } from "../schema/user";

type NewUser = typeof user.$inferInsert;
type UpdateUser = Partial<Omit<NewUser, "id" | "createdAt">>;

export async function updateUser(db: DrizzleD1Database, userId: string, userData: UpdateUser) {
  const [updatedUser] = await db.update(user).set(userData).where(eq(user.id, userId)).returning();
  return updatedUser;
}

export async function deleteUser(db: DrizzleD1Database, userId: string) {
  const [deletedUser] = await db.delete(user).where(eq(user.id, userId)).returning();
  return deletedUser;
}

export async function getUserById(db: DrizzleD1Database, userId: string) {
  const [foundUser] = await db.select().from(user).where(eq(user.id, userId)).limit(1);
  return foundUser;
}
