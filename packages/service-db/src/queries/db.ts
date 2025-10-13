import { type AnyD1Database, drizzle } from "drizzle-orm/d1";
import * as schema from "../schema";

export function getDB(db: AnyD1Database) {
  return drizzle(db, {
    schema,
  });
}
