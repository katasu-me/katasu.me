import { env } from "cloudflare:workers";
import { fetchImagesByUserId, fetchPublicUserDataByUserSlug } from "@katasu.me/service-db";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { GALLERY_PAGE_SIZE } from "@/features/gallery/constants/page";
import { generateUserRSSFeed } from "@/libs/rss";

export const Route = createFileRoute("/user/_layout/$userSlug/rss.xml")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { userSlug } = params;

        try {
          // ユーザー情報を取得
          const userResult = await fetchPublicUserDataByUserSlug(env.DB, userSlug);

          // 存在しない、または新規登録が完了していない場合は404
          if (
            !userResult.success ||
            !userResult.data ||
            !userResult.data.user.termsAgreedAt ||
            !userResult.data.user.privacyPolicyAgreedAt
          ) {
            throw notFound();
          }

          const { user } = userResult.data;

          // ユーザーの最新画像を取得（公開済みのみ、最新24件）
          const imagesResult = await fetchImagesByUserId(env.DB, user.id, {
            limit: GALLERY_PAGE_SIZE,
            offset: 0,
            order: "desc",
            includeAllStatuses: false, // 公開済みのみ
          });

          if (!imagesResult.success) {
            console.error("[rss] 画像の取得に失敗しました:", imagesResult.error);
            throw new Error("画像の取得に失敗しました");
          }

          // RSSフィードを生成
          const actualUserSlug = user.customUrl || user.id;
          const rssXml = generateUserRSSFeed(user, imagesResult.data, actualUserSlug);

          // Cache-Control ヘッダーを設定（CDNキャッシュを長めに設定）
          const headers = new Headers({
            "Content-Type": "application/rss+xml; charset=UTF-8",
            "Cache-Control": "public, max-age=3600, s-maxage=86400", // ブラウザ: 1時間、CDN: 24時間
            "CDN-Cache-Control": "public, max-age=86400", // Cloudflare CDN: 24時間
            "Cloudflare-CDN-Cache-Control": "public, max-age=86400", // Cloudflare専用ヘッダー
          });

          return new Response(rssXml, { headers });
        } catch (error) {
          console.error("[rss] RSS生成エラー:", error);
          
          if (error instanceof Error && error.message.includes("not found")) {
            throw notFound();
          }
          
          return new Response("RSS フィードの生成に失敗しました", { 
            status: 500,
            headers: {
              "Content-Type": "text/plain; charset=UTF-8",
            }
          });
        }
      },
    },
  },
});