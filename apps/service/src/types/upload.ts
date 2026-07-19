/**
 * アップロードジョブのメッセージ型
 *
 * プロデューサ（投稿API）とコンシューマ（queueハンドラ）が同一Worker内でこの型を共有する
 */
export type UploadJobMessage =
  | {
      type: "moderate";
      tempImageId: string;
      userId: string;
    }
  | {
      // type欠落 = デプロイ中に在庫として残った旧メッセージ → publish扱いとする
      type?: "publish";
      imageId: string;
      userId: string;
    };

/** TEMP_R2_BUCKETに保存するモデレーション結果マーカー */
export type ModerationMarker = {
  flagged: boolean;
  userId: string;
};
