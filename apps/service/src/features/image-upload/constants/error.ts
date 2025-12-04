export const UPLOAD_ERROR_MESSAGE = {
  USER_UNAUTHORIZED: "ユーザー情報の取得に失敗しました",
  IMAGE_UPLOAD_LIMIT_EXCEEDED: "アップロードできる上限数に達しました",
  IMAGE_ID_DUPLICATE: "画像IDが重複しました。再度お試しください",
  EMPTY_IMAGE: "画像が選択されていません",
  IMAGE_CONVERSION_FAILED: "画像の変換に失敗しました",
  IMAGE_MODERATION_FLAGGED: "不適切な画像が検出されました",
  IMAGE_MODERATION_FAILED: "画像の検証に失敗しました。しばらくしてから再度お試しください",
  IMAGE_UPLOAD_FAILED: "画像のアップロードに失敗しました",
  IMAGE_REGISTER_FAILED: "画像の登録に失敗しました",
} as const;
