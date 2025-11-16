export const ERROR_MESSAGES = {
  RATE_LIMIT_EXCEEDED: "リクエストが多すぎます。しばらく待ってから再度お試しください",
  USER_UNAUTHORIZED: "ユーザー情報の取得に失敗しました",
  IMAGE_UPLOAD_LIMIT_EXCEEDED: "画像のアップロード上限に達しました",
  IMAGE_ID_DUPLICATE: "画像IDが重複しました。再度お試しください",
  EMPTY_IMAGE: "画像が選択されていません",
  IMAGE_CONVERSION_FAILED: "画像の変換に失敗しました",
  IMAGE_MODERATION_FLAGGED: "不適切な画像が検出されました",
  IMAGE_UPLOAD_FAILED: "画像のアップロードに失敗しました",
  IMAGE_REGISTER_FAILED: "画像の登録に失敗しました",
} as const;
