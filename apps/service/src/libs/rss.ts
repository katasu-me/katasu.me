import type { ImageWithTags } from "@katasu.me/service-db";
import type { User } from "@katasu.me/service-db";
import { DEFAULT_IMAGE_TITLE } from "@/features/gallery/constants/page";

type RSSFeedData = {
  title: string;
  description: string;
  link: string;
  items: RSSItem[];
};

type RSSItem = {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  guid: string;
};

/**
 * XMLエスケープ処理
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * 画像データをRSSアイテムに変換
 */
function imageToRSSItem(image: ImageWithTags, userSlug: string): RSSItem {
  const baseUrl = "https://katasu.me";
  const imageUrl = `${baseUrl}/user/${userSlug}/image/${image.id}`;
  const title = image.title || DEFAULT_IMAGE_TITLE;
  const tagNames = image.tags.map(tag => tag.name).join(", ");
  
  // 画像の説明文を作成
  let description = `<![CDATA[<img src="${baseUrl}/api/r2/${image.id}/thumbnail.webp" alt="${escapeXml(title)}" />`;
  if (tagNames) {
    description += `<br/>タグ: ${escapeXml(tagNames)}`;
  }
  description += "]]>";

  return {
    title: escapeXml(title),
    description,
    link: imageUrl,
    pubDate: new Date(image.createdAt).toUTCString(),
    guid: image.id,
  };
}

/**
 * RSS XMLを生成
 */
export function generateRSSFeed(data: RSSFeedData): string {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(data.title)}</title>
    <description>${escapeXml(data.description)}</description>
    <link>${escapeXml(data.link)}</link>
    <atom:link href="${escapeXml(data.link)}" rel="self" type="application/rss+xml" />
    <language>ja</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>katasu.me</generator>
${data.items
  .map(
    (item) => `    <item>
      <title>${item.title}</title>
      <description>${item.description}</description>
      <link>${escapeXml(item.link)}</link>
      <pubDate>${item.pubDate}</pubDate>
      <guid isPermaLink="false">${escapeXml(item.guid)}</guid>
    </item>`
  )
  .join("\n")}
  </channel>
</rss>`;

  return xml;
}

/**
 * ユーザーの画像投稿からRSSフィードを生成
 */
export function generateUserRSSFeed(
  user: Pick<User, "id" | "name" | "customUrl">,
  images: ImageWithTags[],
  userSlug: string
): string {
  const baseUrl = "https://katasu.me";
  const userUrl = `${baseUrl}/user/${userSlug}`;
  
  const feedData: RSSFeedData = {
    title: `${user.name} の投稿 - katasu.me`,
    description: `${user.name} さんの最新の画像投稿`,
    link: `${userUrl}/rss.xml`,
    items: images.map(image => imageToRSSItem(image, userSlug)),
  };

  return generateRSSFeed(feedData);
}