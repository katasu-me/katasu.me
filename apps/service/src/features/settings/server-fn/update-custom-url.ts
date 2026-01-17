import { env } from "cloudflare:workers";
import { isCustomUrlAvailable, updateUser } from "@katasu.me/service-db";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";
import { ERROR_MESSAGE } from "@/constants/error";
import { requireAuth } from "@/features/auth/libs/auth";
import { CACHE_KEYS, invalidateCache } from "@/libs/cache";
import { optionalCustomUrlSchema } from "@/schemas/custom-url";

const updateCustomUrlInputSchema = v.object({
  customUrl: optionalCustomUrlSchema,
});

type UpdateCustomUrlResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

export const updateCustomUrlFn = createServerFn({ method: "POST" })
  .inputValidator((data: { customUrl: string }) => {
    const result = v.safeParse(updateCustomUrlInputSchema, data);

    if (!result.success) {
      throw new Error(result.issues.at(0)?.message ?? ERROR_MESSAGE.VALIDATION_FAILED);
    }

    return result.output;
  })
  .handler(async ({ data }): Promise<UpdateCustomUrlResult> => {
    const { session } = await requireAuth();

    const { success: rateLimitSuccess } = await env.ACTIONS_RATE_LIMITER.limit({
      key: `custom-url:${session.user.id}`,
    });

    if (!rateLimitSuccess) {
      return {
        success: false,
        error: ERROR_MESSAGE.RATE_LIMIT_EXCEEDED,
      };
    }

    const customUrlValue = data.customUrl || null;

    if (customUrlValue) {
      const availabilityResult = await isCustomUrlAvailable(env.DB, customUrlValue, session.user.id);

      if (!availabilityResult.success) {
        return {
          success: false,
          error: "URLの確認中にエラーが発生しました",
        };
      }

      if (!availabilityResult.data) {
        return {
          success: false,
          error: "このURLは既に使用されています",
        };
      }
    }

    try {
      await updateUser(env.DB, session.user.id, {
        customUrl: customUrlValue,
      });
    } catch (error) {
      console.error("[settings] カスタムURLの更新に失敗しました:", error);

      return {
        success: false,
        error: "カスタムURLの更新中にエラーが発生しました",
      };
    }

    await invalidateCache(env.CACHE_KV, CACHE_KEYS.user(session.user.id));

    return {
      success: true,
    };
  });
