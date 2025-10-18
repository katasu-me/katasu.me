import * as v from "valibot";
import { avatarSchema, usernameSchema } from "./common";

export { ALLOWED_AVATAR_FILE_TYPES, MAX_USERNAME_LENGTH } from "./common";

export const userSettingsFormSchema = v.object({
  username: usernameSchema,
  avatar: avatarSchema,
  removeAvatar: v.pipe(
    v.string(),
    v.transform((value) => value === "true"),
  ),
});

export type UserSettingsFormData = v.InferOutput<typeof userSettingsFormSchema>;
