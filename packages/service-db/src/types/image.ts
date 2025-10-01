import type { Image } from "../schema/image";

export type ImageFormData = Omit<Image, "userId" | "createdAt"> & {
  tags?: string[];
};
