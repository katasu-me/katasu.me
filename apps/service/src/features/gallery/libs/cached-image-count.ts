import { env } from "cloudflare:workers";
import { fetchTotalImageCountByUserId } from "@katasu.me/service-db";

export const fetchTotalImageCount = async (userId: string) => {
  return fetchTotalImageCountByUserId(env.DB, userId);
};
