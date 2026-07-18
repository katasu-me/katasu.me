// 型定義はパッケージのビルド時にのみ生成され、配布物には同梱されないため、tscは型を解決できない
// @ts-expect-error -- @tanstack/react-start/server-entry に型定義ファイルが存在しない
import serverEntry from "@tanstack/react-start/server-entry";
import { handleUploadQueue } from "@/features/image-upload/queue/handler";
import type { UploadJobMessage } from "@/types/upload";

export default {
  fetch: serverEntry.fetch as ExportedHandlerFetchHandler,

  // 投稿処理（モデレーション・本番公開）を同一Worker内のQueueコンシューマで処理する
  async queue(batch: MessageBatch<UploadJobMessage>): Promise<void> {
    await handleUploadQueue(batch);
  },
};
