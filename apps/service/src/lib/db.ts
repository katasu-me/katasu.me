import * as schema from "@katasu.me/service-db";
import { drizzle } from "drizzle-orm/d1";

export function getDB(db: D1Database) {
  return drizzle(db, {
    schema,
  });
}

