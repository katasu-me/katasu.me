import { env } from "cloudflare:workers";
import { deleteUser } from "@katasu.me/service-db";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";
import { requireAuth } from "@/features/auth/libs/auth";
import { CACHE_KEYS, invalidateCache } from "@/libs/cache";
import { deleteUserDataFromR2 } from "@/libs/r2";
import { deleteAccountSchema } from "../schemas/delete-account";

type DeleteAccountResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

export const deleteAccountAction = createServerFn({ method: "POST" })
  .inputValidator((data: FormData) => {
    const confirmation = data.get("confirmation");

    const payload = {
      confirmation,
    };

    const result = v.safeParse(deleteAccountSchema, payload);

    if (!result.success) {
      const firstError = result.issues[0]?.message ?? "バリデーションエラー";
      throw new Error(firstError);
    }

    return result.output;
  })
  .handler(async (): Promise<DeleteAccountResult> => {
    const { session } = await requireAuth();

    try {
      // R2からユーザーデータを削除
      await deleteUserDataFromR2(env.IMAGES_R2_BUCKET, session.user.id);

      // DBからユーザーを削除
      const deleteResult = await deleteUser(env.DB, session.user.id);

      if (!deleteResult.success) {
        console.error("[settings] ユーザー削除に失敗しました:", deleteResult.error);

        return {
          success: false,
          error: "アカウントの削除に失敗しました",
        };
      }

      // キャッシュを無効化
      await invalidateCache(env.CACHE_KV, CACHE_KEYS.user(session.user.id));

      return {
        success: true,
      };
    } catch (error) {
      console.error("[settings] アカウント削除中にエラーが発生しました:", error);

      return {
        success: false,
        error: "アカウントの削除中にエラーが発生しました",
      };
    }
  });
