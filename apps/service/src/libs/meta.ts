import type { DetailedHTMLProps, MetaHTMLAttributes } from "react";
import { SITE_DESCRIPTION_SHORT, SITE_NAME } from "@/constants/site";

type MetadataOptions = {
  pageTitle?: string;
  description?: string;
  imageUrl?: string;
  twitterCard?: "summary" | "summary_large_image";
  path?: string;
  noindex?: boolean;
};

export const generateMetadata = (
  options?: MetadataOptions,
): DetailedHTMLProps<MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>[] => {
  const title = options?.pageTitle ? `${options.pageTitle} | ${SITE_NAME}` : `${SITE_NAME} | ${SITE_DESCRIPTION_SHORT}`;
  const description = options?.description || SITE_DESCRIPTION_SHORT;
  const twitterCard = options?.twitterCard || (options?.imageUrl ? "summary_large_image" : "summary");

  const metaTags: DetailedHTMLProps<MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>[] = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { name: "twitter:card", content: twitterCard },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "robots", content: options?.noindex ? "noindex,nofollow" : "index,follow" },
  ];

  if (options?.path) {
    metaTags.push({ property: "og:url", content: options.path });
    metaTags.push({ name: "twitter:url", content: options.path });
  }

  if (options?.imageUrl) {
    metaTags.push(
      { property: "og:image", content: options.imageUrl },
      { property: "og:image:alt", content: options.pageTitle || SITE_NAME },
      { name: "twitter:image", content: options.imageUrl },
    );
  }

  return metaTags;
};
