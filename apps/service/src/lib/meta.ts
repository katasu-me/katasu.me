import type { Metadata } from "next";
import { SITE_DESCRIPTION_SHORT, SITE_NAME } from "@/constants/site";

type MetadataOptions = {
  pageTitle: string;
  noindex?: boolean;
};

export const generateMetadataTitle = (options?: MetadataOptions): Metadata => {
  const title = options ? `${options.pageTitle} | ${SITE_NAME}` : `${SITE_NAME} | ${SITE_DESCRIPTION_SHORT}`;

  const index = options?.noindex ? !options.noindex : true;

  return {
    title,
    openGraph: {
      title,
    },
    twitter: {
      title,
    },
    robots: {
      index,
    },
  };
};
