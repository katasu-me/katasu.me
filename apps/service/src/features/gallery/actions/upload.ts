"use server";

import { parseWithValibot } from "@conform-to/valibot";
import { uploadImageSchema } from "../schemas/upload";

export async function uploadAction(_prevState: unknown, formData: FormData) {
  console.log("uploadAction called", formData);

  const submission = parseWithValibot(formData, {
    schema: uploadImageSchema,
  });

  console.log("uploadAction", { submission });

  if (submission.status !== "success") {
    return submission.reply();
  }

  // TODO: 実際のアップロード処理を実装

  return submission.reply();
}
