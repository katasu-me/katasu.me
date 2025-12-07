export type ModerationJobMessage = {
  imageId: string;
  userId: string;
};

export type ModerationEnv = Cloudflare.Env & {
  OPENAI_API_KEY: string;
  IMAGE_R2_URL: string;
};

export type ConvertWebpOptions = {
  originalWidth: number;
  originalHeight: number;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
};

export type ImageVariants = {
  original: ArrayBuffer;
  thumbnail: ArrayBuffer;
};
