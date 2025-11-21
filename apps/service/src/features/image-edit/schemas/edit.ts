import * as v from "valibot";
import {
  imageTagsSchema,
  imageTitleSchema,
  MAX_TAG_COUNT,
  MAX_TAG_TEXT_LENGTH,
  MAX_TITLE_LENGTH,
} from "@/schemas/image-form";

export { MAX_TITLE_LENGTH, MAX_TAG_COUNT, MAX_TAG_TEXT_LENGTH };

export const editImageSchema = v.object({
  imageId: v.pipe(v.string(), v.nonEmpty("画像IDが指定されていません")),
  title: imageTitleSchema,
  tags: imageTagsSchema,
});

export type EditImageData = v.InferOutput<typeof editImageSchema>;
