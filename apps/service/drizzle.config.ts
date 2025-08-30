import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "../../packages/service-db/src/schema/index.ts",
  out: "../../packages/service-db/src/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_PATH || "",
  },
});
