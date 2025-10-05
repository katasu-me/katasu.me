"use server";

import { parseWithValibot } from "@conform-to/valibot";
import { registerImage } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { imageSize } from "image-size";
import { nanoid } from "nanoid";
import { revalidateTag } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { tagPageCacheTag, userPageCacheTag } from "@/lib/cache-tags";
import { uploadImage } from "@/lib/r2";
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

  const imageArrayBuffer = await submission.value.file.arrayBuffer();

  // 画像をアップロード
  try {
    await uploadImage(env.IMAGES_R2_BUCKET, {
      type: "image",
      imageBuffer: imageArrayBuffer,
      userId,
      imageId,
    });
  } catch (error) {
    console.error("Upload image error:", error);

    return submission.reply({
      formErrors: ["画像のアップロードに失敗しました"],
    });
  }

  // 画像の幅・高さを取得
  // NOTE: wasm-image-optimizationの戻りで取得できるが、縦画像が横向きとして扱われる時があるので使わない
  const dimensions = imageSize(new Uint8Array(imageArrayBuffer));

  // orientationの値が 5, 6, 7, 8 (90度または270度回転) の場合は入れ替える
  // @see https://exiftool.org/TagNames/EXIF.html#:~:text=0x0112,8%20=%20Rotate%20270%20CW
  const needsSwap = dimensions.orientation && [5, 6, 7, 8].includes(dimensions.orientation);
  const width = needsSwap ? dimensions.height : dimensions.width;
  const height = needsSwap ? dimensions.width : dimensions.height;

  // DBに登録
  const registerImageResult = await registerImage(env.DB, session.user.id, {
    id: imageId,
    title: submission.value.title ?? null,
    width,
    height,
    tags: submission.value.tags,
    isHidden: false,
  });

  if (!registerImageResult.success) {
    console.error("Register image error:", registerImageResult.error);

    return submission.reply({
      formErrors: [registerImageResult.error.message],
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
