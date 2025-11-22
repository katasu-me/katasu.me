import { env } from "cloudflare:workers";
import { type User, updateUser } from "@katasu.me/service-db";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";
import { requireAuth } from "@/features/auth/libs/auth";
import { generateAvatarImage, getImageDimensions } from "@/features/image-upload/libs/image";
import { CACHE_KEYS, invalidateCache } from "@/libs/cache";
import { uploadAvatarImage } from "@/libs/r2";
import { userSettingsFormSchema } from "../schemas/user-settings";

type UpdateUserSettingsResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

export const updateUserSettingsFn = createServerFn({ method: "POST" })
  .inputValidator((data: FormData) => {
    const username = data.get("username");
    const avatar = data.get("avatar");
    const removeAvatar = data.get("removeAvatar");

    const payload = {
      username,
      avatar: avatar instanceof File && avatar.size > 0 ? avatar : undefined,
      removeAvatar: removeAvatar?.toString() === "true",
    };

    const result = v.safeParse(userSettingsFormSchema, payload);

    if (!result.success) {
      throw new Error(result.issues.at(0)?.message ?? "設定の更新に失敗しました。もう一度お試しください。");
    }

    return result.output;
  })
  .handler(async ({ data }): Promise<UpdateUserSettingsResult> => {
    const { session } = await requireAuth();

    const updateData: Partial<Pick<User, "name" | "avatarSetAt">> = {};

    updateData.name = data.username;

    if (data.removeAvatar) {
      // removeAvatarがあるなら、アバター画像を未設定に
      updateData.avatarSetAt = null;
    } else if (data.avatar instanceof File && data.avatar.size > 0) {
      // アバター画像を変更
      try {
        const arrayBuffer = await data.avatar.arrayBuffer();
        const dimensions = getImageDimensions(arrayBuffer);
        const convertedAvatar = await generateAvatarImage(arrayBuffer, {
          originalWidth: dimensions.width,
          originalHeight: dimensions.height,
        });

        await uploadAvatarImage(env.IMAGES_R2_BUCKET, {
          type: "avatar",
          imageBuffer: convertedAvatar.buffer as ArrayBuffer,
          userId: session.user.id,
        });

        updateData.avatarSetAt = new Date();
      } catch (error) {
        console.error("[settings] アバター画像の処理に失敗しました:", error);

        return {
          success: false,
          error: "アバター画像のアップロードに失敗しました",
        };
      }
    }

    try {
      await updateUser(env.DB, session.user.id, updateData);
    } catch (error) {
      console.error("[settings] ユーザー情報の更新に失敗しました:", error);

      return {
        success: false,
        error: "ユーザー情報の更新中にエラーが発生しました",
      };
    }

    // ユーザーデータのキャッシュを飛ばす
    await invalidateCache(env.CACHE_KV, CACHE_KEYS.user(session.user.id));

    return {
      success: true,
    };
  });
