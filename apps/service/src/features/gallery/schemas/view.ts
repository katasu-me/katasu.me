import { type InferOutput, literal, union } from "valibot";

export const GalleryViewSchema = union([literal("timeline"), literal("random")]);

export type GalleryView = InferOutput<typeof GalleryViewSchema>;
