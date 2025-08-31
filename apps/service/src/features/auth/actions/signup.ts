"use server";

import { parseWithValibot } from "@conform-to/valibot";
import { redirect } from "next/navigation";
import { signupSchema } from "../schemas/signup";

export async function signupAction(_prevState: unknown, formData: FormData) {
  const submission = parseWithValibot(formData, {
    schema: signupSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  // TODO: 実際のサインアップ処理を実装
  console.log("サインアップデータ:", submission.value);

  // 成功時はリダイレクト
  redirect("/");
}
