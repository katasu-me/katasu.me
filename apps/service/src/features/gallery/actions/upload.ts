"use server";

import { parseWithValibot } from "@conform-to/valibot";
import { fetchUserImageStatus, registerImage } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { nanoid } from "nanoid";
import { revalidateTag } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { tagListCacheTag, tagPageCacheTag, userPageCacheTag } from "@/lib/cache-tags";
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

  const userId = session.user.id;

  // 上限チェック
  const userImageStatusResult = await fetchUserImageStatus(env.DB, userId);

  if (!userImageStatusResult.success || !userImageStatusResult.data) {
    return submission.reply({
      formErrors: ["ユーザー情報の取得に失敗しました"],
    });
  }

  if (userImageStatusResult.data.uploadedPhotos >= userImageStatusResult.data.maxPhotos) {
    return submission.reply({
      formErrors: ["画像の投稿上限に達しています"],
    });
  }

  const imageId = nanoid();

  // R2キーの重複チェック
  const originalKey = generateR2Key("image", userId, imageId, "original");
  const existingOriginal = await env.IMAGES_R2_BUCKET.head(originalKey);

  if (existingOriginal) {
    console.error("[gallery] 画像IDが重複しました:", { userId, imageId });

    return submission.reply({
      formErrors: [ERROR_MESSAGES.IMAGE_ID_DUPLICATE],
    });
  }

  // 画像を変換
  let convertResult: Awaited<ReturnType<typeof env.IMAGE_OPTIMIZER.generateImageVariants>>;

  try {
    const arrayBuffer = await submission.value.file.arrayBuffer();
    convertResult = await env.IMAGE_OPTIMIZER.generateImageVariants(arrayBuffer);
  } catch (error) {
    console.error("[gallery] 画像の変換に失敗しました:", error);

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
    console.error("[gallery] 画像のアップロードに失敗しました:", error);

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
  });

  if (!registerImageResult.success) {
    console.error("[gallery] DBへの画像登録に失敗しました:", registerImageResult.error);

    return submission.reply({
      formErrors: [ERROR_MESSAGES.IMAGE_REGISTER_FAILED],
    });
  }

  // 自身のマイページ
  revalidateTag(userPageCacheTag(userId));

  // タグ一覧
  revalidateTag(tagListCacheTag(userId));

  // それぞれのタグページ
  for (const tag of registerImageResult.data.tags) {
    revalidateTag(tagPageCacheTag(userId, tag.id));
  }

  return submission.reply();
}
