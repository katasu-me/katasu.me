const PROCESSING_POLL_INTERVAL = 3000;

/**
 * processing状態の画像がある場合にポーリングを有効にするrefetchInterval
 * オーナーのみポーリングする
 */
export function processingRefetchInterval(isOwner: boolean) {
  return (query: { state: { data?: { images?: { status: string }[] | null } } }) => {
    if (!isOwner) {
      return false;
    }

    const images = query.state.data?.images;
    const hasProcessing = images?.some((img) => img.status === "processing");

    return hasProcessing ? PROCESSING_POLL_INTERVAL : false;
  };
}
