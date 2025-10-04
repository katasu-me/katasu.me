import { literal, union } from "valibot";

export const GalleryViewSchema = union([literal("masonry"), literal("random")]);
