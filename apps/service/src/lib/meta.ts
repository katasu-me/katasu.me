import type { Metadata } from "next";
import { SITE_DESCRIPTION_SHORT, SITE_NAME } from "@/constants/site";

type MetadataOptions = {
  pageTitle?: string;
  description?: string;
  imageUrl?: string;
  twitterCard?: "summary" | "summary_large_image";
  path?: string;
  noindex?: boolean;
};

export const generateMetadataTitle = (options?: MetadataOptions): Metadata => {
  const title = options?.pageTitle ? `${options.pageTitle} | ${SITE_NAME}` : `${SITE_NAME} | ${SITE_DESCRIPTION_SHORT}`;
  const description = options?.description || SITE_DESCRIPTION_SHORT;
  const index = options?.noindex ? !options.noindex : true;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(options?.path && { url: options.path }),
      ...(options?.imageUrl && {
        images: [
          {
            url: options.imageUrl,
            alt: options.pageTitle || SITE_NAME,
          },
        ],
      }),
    },
    twitter: {
      card: options?.twitterCard || (options?.imageUrl ? "summary_large_image" : "summary"),
      title,
      description,
      ...(options?.imageUrl && {
        images: [options.imageUrl],
      }),
    },
    robots: {
      index,
    },
  };
};
