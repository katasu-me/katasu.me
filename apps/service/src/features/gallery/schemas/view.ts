import { literal, union } from "valibot";

export const GalleryViewSchema = union([literal("timeline"), literal("random")]);
