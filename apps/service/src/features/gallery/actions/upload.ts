"use server";

import { parseWithValibot } from "@conform-to/valibot";
import { registerImage } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { nanoid } from "nanoid";
import { revalidateTag } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { tagPageCacheTag, userPageCacheTag } from "@/lib/cache-tags";
import { convertImageVariants } from "@/lib/image-optimizer";
import { generateR2Key, uploadImage } from "@/lib/r2";
import { ERROR_MESSAGES } from "../constants/error-messages";
import { uploadImageSchema } from "../schemas/upload";

export async function uploadAction(_prevState: unknown, formData: FormData) {
  const { env } = getCloudflareContext();
  const { session } = await requireAuth(env.DB);

  const submission = parseWithValibot(formData, {
    schema: uploadImageSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const imageId = nanoid();
  const userId = session.user.id;

  // R2キーの重複チェック
  const originalKey = generateR2Key("image", userId, imageId, "original");
  const existingOriginal = await env.IMAGES_R2_BUCKET.head(originalKey);

  if (existingOriginal) {
    console.error("画像IDが重複しました", { userId, imageId });

    return submission.reply({
      formErrors: [ERROR_MESSAGES.IMAGE_ID_DUPLICATE],
    });
  }

  // 画像を変換
  let convertResult: Awaited<ReturnType<typeof convertImageVariants>>;

  try {
    convertResult = await convertImageVariants(
      env.IMAGE_OPTIMIZER_URL,
      env.IMAGE_OPTIMIZER_SECRET,
      submission.value.file,
    );
  } catch (error) {
    console.error("Convert image error:", error);

    const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.IMAGE_CONVERSION_FAILED;

    return submission.reply({
      formErrors: [errorMessage],
    });
  }

  // 画像をアップロード
  try {
    await uploadImage(env.IMAGES_R2_BUCKET, {
      type: "image",
      variants: {
        original: convertResult.original.data,
        thumbnail: convertResult.thumbnail.data,
      },
      userId,
      imageId,
    });
  } catch (error) {
    console.error("Upload image error:", error);

    return submission.reply({
      formErrors: [ERROR_MESSAGES.IMAGE_UPLOAD_FAILED],
    });
  }

  // DBに登録
  const registerImageResult = await registerImage(env.DB, session.user.id, {
    ...convertResult.dimensions,
    id: imageId,
    title: submission.value.title ?? null,
    tags: submission.value.tags,
    isHidden: false,
  });

  if (!registerImageResult.success) {
    console.error("Register image error:", registerImageResult.error);

    return submission.reply({
      formErrors: [ERROR_MESSAGES.IMAGE_REGISTER_FAILED],
    });
  }

  // 自身のマイページのキャッシュを飛ばす
  revalidateTag(userPageCacheTag(userId));

  // タグページのキャッシュを飛ばす
  for (const tag of registerImageResult.data.tags) {
    revalidateTag(tagPageCacheTag(userId, tag.id));
  }

  return submission.reply();
}
