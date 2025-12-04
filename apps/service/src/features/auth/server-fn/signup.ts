import { env } from "cloudflare:workers";
import { updateUser } from "@katasu.me/service-db";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";
import { ERROR_MESSAGE } from "@/constants/error";
import { requireAuth } from "@/features/auth/libs/auth";
import { signUpFormSchema } from "@/features/auth/schemas/signup";
import { generateAvatarImage, getImageDimensions } from "@/features/image-upload/libs/image";
import { CACHE_KEYS, invalidateCache } from "@/libs/cache";
import { uploadAvatarImage } from "@/libs/r2";

type SignUpResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

export const signupAction = createServerFn({ method: "POST" })
  .inputValidator((data: FormData) => {
    const username = data.get("username");
    const avatar = data.get("avatar");
    const agreeToTerms = data.get("agreeToTerms");
    const agreeToPrivacy = data.get("agreeToPrivacy");

    const payload = {
      username,
      avatar: avatar instanceof File && avatar.size > 0 ? avatar : undefined,
      agreeToTerms: agreeToTerms === "on",
      agreeToPrivacy: agreeToPrivacy === "on",
    };

    const result = v.safeParse(signUpFormSchema, payload);

    if (!result.success) {
      const firstError = result.issues[0]?.message ?? ERROR_MESSAGE.VALIDATION_FAILED;
      throw new Error(firstError);
    }

    return result.output;
  })
  .handler(async ({ data }): Promise<SignUpResult> => {
    const { session } = await requireAuth();

    // アバター画像がある場合
    if (data.avatar instanceof File && data.avatar.size > 0) {
      try {
        // 画像を変換
        const arrayBuffer = await data.avatar.arrayBuffer();
        const dimensions = getImageDimensions(arrayBuffer);
        const convertedAvatar = await generateAvatarImage(arrayBuffer, {
          originalWidth: dimensions.width,
          originalHeight: dimensions.height,
        });

        // 変換済み画像をアップロード
        await uploadAvatarImage(env.IMAGES_R2_BUCKET, {
          type: "avatar",
          imageBuffer: convertedAvatar.buffer as ArrayBuffer,
          userId: session.user.id,
        });
      } catch (error) {
        console.error("[auth] アバター画像の処理に失敗しました:", error);

        return {
          success: false,
          error: "アバター画像のアップロードに失敗しました",
        };
      }
    }

    try {
      await updateUser(env.DB, session.user.id, {
        name: data.username,
        avatarSetAt: data.avatar instanceof File ? new Date() : null,
        termsAgreedAt: new Date(),
        privacyPolicyAgreedAt: new Date(),
      });
    } catch (error) {
      console.error("[auth] ユーザー情報の更新に失敗しました:", error);

      return {
        success: false,
        error: "新規登録中にエラーが発生しました",
      };
    }

    // ユーザーデータのキャッシュを飛ばす
    await invalidateCache(env.CACHE_KV, CACHE_KEYS.user(session.user.id));

    // 成功時はユーザーページへリダイレクト
    throw redirect({
      to: "/user/$userId",
      params: { userId: session.user.id },
      search: {
        view: "timeline",
        page: 1,
      },
    });
  });
