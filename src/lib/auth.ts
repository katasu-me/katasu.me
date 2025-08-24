import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDB } from "../db";

export const getAuth = (db: D1Database) => {
  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    database: drizzleAdapter(getDB(db), {
      provider: "sqlite",
    }),
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      },
    },
  });
};
