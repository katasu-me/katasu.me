import { env } from "cloudflare:workers";
import { deleteUser } from "@katasu.me/service-db";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import * as v from "valibot";
import { ERROR_MESSAGE } from "@/constants/error";
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

export const deleteAccountFn = createServerFn({ method: "POST" })
  .inputValidator((data: FormData) => {
    const confirmation = data.get("confirmation");

    const payload = {
      confirmation,
    };

    const result = v.safeParse(deleteAccountSchema, payload);

    if (!result.success) {
      const firstError = result.issues[0]?.message ?? ERROR_MESSAGE.VALIDATION_FAILED;
      throw new Error(firstError);
    }

    return result.output;
  })
  .handler(async (): Promise<DeleteAccountResult> => {
    const { auth, session } = await requireAuth();

    const { success: rateLimitSuccess } = await env.ACTIONS_RATE_LIMITER.limit({
      key: `delete-account:${session.user.id}`,
    });

    if (!rateLimitSuccess) {
      return {
        success: false,
        error: ERROR_MESSAGE.RATE_LIMIT_EXCEEDED,
      };
    }

    try {
      await deleteUserDataFromR2(env.IMAGES_R2_BUCKET, session.user.id);

      const deleteResult = await deleteUser(env.DB, session.user.id);

      if (!deleteResult.success) {
        console.error("[settings] ユーザー削除に失敗しました:", deleteResult.error);

        return {
          success: false,
          error: "アカウントの削除に失敗しました",
        };
      }

      await auth.api.revokeSession({
        headers: getRequestHeaders(),
        body: {
          token: session.session.token,
        },
      });

      // KVのキャッシュを無効化
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
