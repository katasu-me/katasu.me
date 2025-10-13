import type { Image } from "../schema/image";

export type ImageFormData = Omit<Image, "userId" | "createdAt" | "updatedAt" | "hiddenAt"> & {
  tags?: string[];
};
