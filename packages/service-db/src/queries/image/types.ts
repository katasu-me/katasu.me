import type { Image } from "../../schema";

export type ImageFormData = Omit<Image, "id" | "userId" | "createdAt"> & {
  tags?: string[];
};
