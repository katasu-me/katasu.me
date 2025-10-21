import * as v from "valibot";
import { avatarSchema, usernameSchema } from "@/schemas/user";

export const userSettingsFormSchema = v.object({
  username: usernameSchema,
  avatar: avatarSchema,
  removeAvatar: v.pipe(
    v.string(),
    v.transform((value) => value === "true"),
  ),
});
