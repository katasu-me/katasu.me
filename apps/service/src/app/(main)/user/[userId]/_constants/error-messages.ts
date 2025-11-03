export const ERROR_MESSAGES = {
  RATE_LIMIT_EXCEEDED: "リクエストが多すぎます。しばらくしてから再度お試しください",
  USER_UNAUTHORIZED: "ユーザー認証に失敗しました。再度ログインしてください",
  IMAGE_UPLOAD_LIMIT_EXCEEDED: "画像の投稿上限に達しています",
  IMAGE_ID_DUPLICATE: "投稿が重複しています。もう一度お試しください",
  IMAGE_CONVERSION_FAILED: "画像の変換に失敗しました",
  IMAGE_MODERATION_FLAGGED: "投稿できない画像が含まれています。利用規約に違反する可能性がある画像は投稿できません",
  IMAGE_UPLOAD_FAILED: "画像のアップロードに失敗しました。もう一度お試しください",
  IMAGE_REGISTER_FAILED: "画像の登録に失敗しました。もう一度お試しください",
  IMAGE_FETCH_FAILED: "画像の取得に失敗しました。もう一度お試しください",
  UNKNOWN_ERROR: "不明なエラーで失敗しました。もう一度お試しください",
} as const;
