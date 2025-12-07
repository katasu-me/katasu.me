export type UploadJobMessage = {
  imageId: string;
  userId: string;
};

export type UploadEnv = Cloudflare.Env & {
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
