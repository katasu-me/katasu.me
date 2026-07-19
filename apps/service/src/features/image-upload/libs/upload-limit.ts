import { env } from "cloudflare:workers";
import { fetchUserImageStatus } from "@katasu.me/service-db";
import { UPLOAD_ERROR_MESSAGE } from "../constants/error";

type UploadLimitResult = { allowed: true } | { allowed: false; error: string };

export async function checkUploadLimit(userId: string): Promise<UploadLimitResult> {
  const result = await fetchUserImageStatus(env.DB, userId);

  if (!result.success || !result.data) {
    return { allowed: false, error: UPLOAD_ERROR_MESSAGE.USER_UNAUTHORIZED };
  }

  if (result.data.uploadedPhotos >= result.data.maxPhotos) {
    return { allowed: false, error: UPLOAD_ERROR_MESSAGE.IMAGE_UPLOAD_LIMIT_EXCEEDED };
  }

  return { allowed: true };
}
