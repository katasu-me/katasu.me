import { useQueryClient } from "@tanstack/react-query";
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSession } from "@/features/auth/libs/auth-client";
import { TAG_PAGE_QUERY_KEY } from "@/features/gallery/server-fn/tag-page";
import { USER_IMAGE_COUNT_QUERY_KEY } from "@/features/gallery/server-fn/user-image-count";
import { USER_PAGE_QUERY_KEY } from "@/features/gallery/server-fn/user-page";
import { uploadFn } from "../server-fn/upload";

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
  defaultFile?: File;
  defaultTags?: string[];
  counter: Counter;
};

type UploadContextType = {
  state: UploadState;
  formData: FormData | null;
  counter: Counter | null;
  isDrawerOpen: boolean;
  openDrawer: (options: OpenDrawerOptions) => void;
  closeDrawer: () => void;
  upload: (file: File, data: { title?: string; tags?: string[] }) => void;
  reset: () => void;
};

const UploadContext = createContext<UploadContextType | null>(null);

const initialState: UploadState = {
  status: "idle",
};

export function UploadProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userId = session?.user.id;

  const [state, setState] = useState<UploadState>(initialState);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [counter, setCounter] = useState<Counter | null>(null);

  // エラー時に自動でドロワーを開く
  useEffect(() => {
    if (state.status === "error") {
      setIsDrawerOpen(true);
    }
  }, [state.status]);

  const openDrawer = useCallback((options: OpenDrawerOptions) => {
    setFormData({
      file: options.defaultFile ?? new File([], ""),
      tags: options.defaultTags ?? [],
    });
    setCounter(options.counter);
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    // アップロード中は閉じられないように
    if (state.status === "uploading") {
      return;
    }

    setIsDrawerOpen(false);
  }, [state.status]);

  const invalidateQueries = useCallback(async () => {
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
  }, [queryClient, userId]);

  const upload = useCallback(
    (file: File, data: { title?: string; tags?: string[] }) => {
      // エラー時に復元するためにフォームデータを保存しておく
      setFormData({
        file,
        title: data.title,
        tags: data.tags ?? [],
      });

      setState({ status: "uploading" });
      setIsDrawerOpen(false);

      const formDataPayload = new globalThis.FormData();
      formDataPayload.append("file", file);

      if (data.title) {
        formDataPayload.append("title", data.title);
      }

      if (data.tags && data.tags.length > 0) {
        formDataPayload.append("tags", JSON.stringify(data.tags));
      }

      uploadFn({ data: formDataPayload })
        .then((result) => {
          if (!result.success) {
            setState({ status: "error", error: result.error });
            return;
          }

          setState({ status: "success" });
          setFormData(null);
          invalidateQueries();
        })
        .catch((error) => {
          setState({
            status: "error",
            error: error instanceof Error ? error.message : "アップロードに失敗しました",
          });
        });
    },
    [invalidateQueries],
  );

  const reset = useCallback(() => {
    setState(initialState);
    setFormData(null);
  }, []);

  const value = useMemo(
    () => ({
      state,
      formData,
      counter,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      upload,
      reset,
    }),
    [state, formData, counter, isDrawerOpen, openDrawer, closeDrawer, upload, reset],
  );

  return <UploadContext.Provider value={value}>{children}</UploadContext.Provider>;
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
