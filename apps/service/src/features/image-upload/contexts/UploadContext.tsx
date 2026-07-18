import { useQueryClient } from "@tanstack/react-query";
import { createContext, type PropsWithChildren, useContext, useEffect, useRef, useState } from "react";
import { useSession } from "@/features/auth/libs/auth-client";
import { TAG_PAGE_QUERY_KEY } from "@/features/gallery/server-fn/tag-page";
import { USER_IMAGE_COUNT_QUERY_KEY } from "@/features/gallery/server-fn/user-image-count";
import { USER_PAGE_QUERY_KEY } from "@/features/gallery/server-fn/user-page";
import { normalizeFile } from "@/libs/work-around";
import { UPLOAD_ERROR_MESSAGE } from "../constants/error";
import { type ProcessedImage, processImageFile } from "../libs/process-image";
import { uploadFn } from "../server-fn/upload";
import { deleteTempFn, getTempModerationFn, uploadTempFn } from "../server-fn/upload-temp";

export type UploadStatus = "idle" | "uploading" | "success" | "error";

type UploadState = {
  status: UploadStatus;
  error?: string;
};

type FormData = {
  file: File;
  title?: string;
  tags: string[];
};

type Counter = {
  total: number;
  max: number;
};

type OpenDrawerOptions = {
  defaultTags?: string[];
  counter: Counter;
};

/** ファイル選択時に先行して行なった処理の結果 */
export type PreparedUpload = {
  /** リサイズ・ThumbHash計算の結果（画像のデコードに失敗した場合はnull） */
  processed: ProcessedImage | null;
  /** 先行アップロード済みの一時画像ID（失敗時はnull。投稿時にリトライする） */
  tempImageId: string | null;
};

type PreparedEntry = {
  /** 元ファイルと処理済みファイル両方のキーを持ち、エラー復元時の再処理を防ぐ */
  fileKeys: string[];
  promise: Promise<PreparedUpload>;
};

type UploadContextType = {
  state: UploadState;
  formData: FormData | null;
  counter: Counter | null;
  isDrawerOpen: boolean;
  /** フォーム表示中に先行モデレーションで違反判定された場合true */
  tempModerationFlagged: boolean;
  openDrawer: (options: OpenDrawerOptions) => void;
  closeDrawer: () => void;
  prepareFile: (file: File) => Promise<PreparedUpload>;
  upload: (file: File, data: { title?: string; tags?: string[] }) => void;
  reset: () => void;
};

const UploadContext = createContext<UploadContextType | null>(null);

const initialState: UploadState = {
  status: "idle",
  error: undefined,
};

/** 先行モデレーションのポーリング間隔（判定がマーカーに書かれるのを待つ） */
const MODERATION_CHECK_DELAY_MS = 3000;

/** 先行モデレーションの最大確認回数 */
const MODERATION_MAX_CHECKS = 3;

function getFileKey(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * 一時バケットへの先行アップロードを実行
 * @returns 成功時はtempImageId、失敗時はエラーメッセージ
 */
async function requestTempUpload(file: File): Promise<{ tempImageId: string | null; error?: string }> {
  try {
    const payload = new globalThis.FormData();
    payload.append("file", file);

    const result = await uploadTempFn({ data: payload });

    if (!result.success) {
      return { tempImageId: null, error: result.error };
    }

    return { tempImageId: result.tempImageId };
  } catch (error) {
    return {
      tempImageId: null,
      error: error instanceof Error ? error.message : undefined,
    };
  }
}

export function UploadProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userId = session?.user.id;

  const [state, setState] = useState<UploadState>(initialState);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [counter, setCounter] = useState<Counter | null>(null);
  const [tempModerationFlagged, setTempModerationFlagged] = useState(false);

  const preparedRef = useRef<PreparedEntry | null>(null);
  const tempModerationFlaggedRef = useRef(false);

  // エラー時に自動でドロワーを開く
  useEffect(() => {
    if (state.status === "error") {
      setIsDrawerOpen(true);
    }
  }, [state.status]);

  /**
   * 先行モデレーションの結果をポーリングで確認する
   *
   * 判定がマーカーに書かれるのを待ちながら複数回確認し、違反を検出したら表示する。
   * 確認中に別ファイルへ差し替えられた場合は結果を無視するため、呼び出し側でエントリ同一性を検証する
   */
  const checkTempModeration = (entry: PreparedEntry, tempImageId: string) => {
    (async () => {
      try {
        for (let i = 0; i < MODERATION_MAX_CHECKS; i++) {
          await delay(MODERATION_CHECK_DELAY_MS);

          if (preparedRef.current !== entry) {
            return;
          }

          const result = await getTempModerationFn({ data: { tempImageId } });

          if (result.status === "flagged" && preparedRef.current === entry) {
            setTempModerationFlagged(true);
            tempModerationFlaggedRef.current = true;
            return;
          }

          if (result.status === "ok") {
            return;
          }
        }
      } catch (error) {
        console.error("[upload] Failed to check temp moderation:", error);
      }
    })();
  };

  /**
   * 不要になった先行アップロードの一時画像を削除する
   *
   * 削除はベストエフォート（失敗してもR2のライフサイクルルールが回収する）
   */
  const discardPrepared = () => {
    const entry = preparedRef.current;

    if (!entry) {
      return;
    }

    preparedRef.current = null;
    // 差し替え・破棄時は前ファイルの違反表示をクリアする
    setTempModerationFlagged(false);
    tempModerationFlaggedRef.current = false;

    // 先行アップロードが未完了の場合に誤って取り逃さないよう、解決を待ってから削除する
    entry.promise
      .then((prepared) => {
        if (prepared.tempImageId) {
          deleteTempFn({ data: { tempImageId: prepared.tempImageId } }).catch(() => {});
        }
      })
      .catch(() => {});
  };

  /**
   * ファイル選択時の先行処理（リサイズ・ThumbHash計算・一時バケットへのアップロード）
   *
   * 投稿ボタンが押される前に転送を済ませることで、投稿時の待ち時間を短縮する。
   * 同じファイルに対しては既存の処理結果を返す（エラー復元時の二重転送防止）
   */
  const prepareFile = (file: File): Promise<PreparedUpload> => {
    const fileKey = getFileKey(file);
    const current = preparedRef.current;

    if (current?.fileKeys.includes(fileKey)) {
      return current.promise;
    }

    // 別ファイルへの差し替えなので、古い一時画像は破棄する
    discardPrepared();

    const promise = (async (): Promise<PreparedUpload> => {
      let processed: ProcessedImage | null = null;

      try {
        const normalized = await normalizeFile(file);
        processed = await processImageFile(normalized);
      } catch (error) {
        // デコード不能なファイルでもプレビュー以外のフォーム操作は継続させ、投稿時にエラー表示する
        console.error("[upload] Failed to process image:", error);
        return { processed: null, tempImageId: null };
      }

      // 失敗してもここでは通知しない（投稿時にリトライし、それも失敗したらエラー表示する）
      const { tempImageId } = await requestTempUpload(processed.file);

      return { processed, tempImageId };
    })();

    const entry: PreparedEntry = { fileKeys: [fileKey], promise };
    preparedRef.current = entry;

    // エラー復元時はフォームに処理済みファイルが渡るため、そのキーでも同一視できるようにする
    promise
      .then((prepared) => {
        if (prepared.processed) {
          entry.fileKeys.push(getFileKey(prepared.processed.file));
        }

        // 先行アップロード成功時のみ、フォーム表示中のモデレーション確認を開始する
        if (prepared.tempImageId) {
          checkTempModeration(entry, prepared.tempImageId);
        }
      })
      .catch(() => {});

    return promise;
  };

  const reset = () => {
    setState(initialState);
    setFormData(null);
    setTempModerationFlagged(false);
    tempModerationFlaggedRef.current = false;
  };

  const openDrawer = (options: OpenDrawerOptions) => {
    setFormData({
      file: new File([], ""),
      tags: options.defaultTags ?? [],
    });
    setCounter(options.counter);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setState((currentState) => {
      // アップロード中は閉じられないように
      if (currentState.status === "uploading") {
        return currentState;
      }

      // 投稿せずに閉じたので、先行アップロード済みの一時画像は破棄する
      discardPrepared();

      setIsDrawerOpen(false);
      setFormData(null);
      return initialState;
    });
  };

  const invalidateQueries = async () => {
    if (!userId) {
      return;
    }

    // アニメーション完了を待ってからデータを再取得
    setTimeout(async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [USER_PAGE_QUERY_KEY, userId],
        }),
        queryClient.invalidateQueries({
          queryKey: [USER_IMAGE_COUNT_QUERY_KEY, userId],
        }),
        queryClient.invalidateQueries({
          queryKey: [TAG_PAGE_QUERY_KEY, userId],
        }),
      ]);
    }, 400);
  };

  const upload = async (file: File, data: { title?: FormData["title"]; tags?: FormData["tags"] }) => {
    // エラー時に復元するためにフォームデータを保存しておく
    setFormData({
      file,
      title: data.title,
      tags: data.tags ?? [],
    });

    // ボタン無効化の二重防御。先行モデレーションで違反済みなら送信せずエラー表示する
    if (tempModerationFlaggedRef.current) {
      setState({ status: "error", error: UPLOAD_ERROR_MESSAGE.IMAGE_MODERATION_FLAGGED });
      return;
    }

    setState({ status: "uploading" });
    setIsDrawerOpen(false);

    try {
      // 通常はファイル選択時に完了済みのためawaitは即解決する
      const prepared = await prepareFile(file);

      if (!prepared.processed) {
        setState({ status: "error", error: UPLOAD_ERROR_MESSAGE.IMAGE_CONVERSION_FAILED });
        return;
      }

      // 先行アップロードに失敗していた場合はここでリトライする
      if (!prepared.tempImageId) {
        const retried = await requestTempUpload(prepared.processed.file);

        if (!retried.tempImageId) {
          setState({ status: "error", error: retried.error ?? UPLOAD_ERROR_MESSAGE.IMAGE_UPLOAD_FAILED });
          return;
        }

        // エラー後の再投稿で再利用できるように結果へ反映する
        prepared.tempImageId = retried.tempImageId;
      }

      const payload = {
        tempImageId: prepared.tempImageId,
        title: data.title,
        tags: data.tags ?? [],
        thumbhash: prepared.processed.thumbhash,
      };

      let result = await uploadFn({ data: payload });

      // ライフサイクルルール等で一時画像が消えていた場合は、一度だけ再アップロードして再試行する
      if (!result.success && result.error === UPLOAD_ERROR_MESSAGE.TEMP_IMAGE_NOT_FOUND) {
        const reuploaded = await requestTempUpload(prepared.processed.file);

        if (reuploaded.tempImageId) {
          prepared.tempImageId = reuploaded.tempImageId;
          result = await uploadFn({ data: { ...payload, tempImageId: reuploaded.tempImageId } });
        }
      }

      if (!result.success) {
        setState({ status: "error", error: result.error });
        return;
      }

      // 一時画像は投稿で消費されたため、破棄せずにクリアする
      preparedRef.current = null;

      setState({ status: "success" });
      setFormData(null);
      invalidateQueries();
    } catch (error) {
      setState({
        status: "error",
        error: error instanceof Error ? error.message : "アップロードに失敗しました",
      });
    }
  };

  return (
    <UploadContext.Provider
      value={{
        state,
        formData,
        counter,
        isDrawerOpen,
        tempModerationFlagged,
        openDrawer,
        closeDrawer,
        prepareFile,
        upload,
        reset,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const context = useContext(UploadContext);

  if (!context) {
    throw new Error("useUpload must be used within an UploadProvider");
  }

  return context;
}

export function useUploadOptional() {
  return useContext(UploadContext);
}
