import IconShare from "@/assets/icons/share.svg?react";
import IconButton from "@/components/IconButton";
import { useDevice } from "@/hooks/useDevice";

type Props = {
  title: string | null;
  userId: string;
  imageId: string;
};

export default function ShareButton({ title, userId, imageId }: Props) {
  const { isDesktop } = useDevice();

  const handleShare = async () => {
    const url = new URL(`/user/${userId}/image/${imageId}`, window.location.origin).toString();

    // デスクトップの場合、またはWebShare APIが利用できない場合はしぇあ.comを使用
    if (isDesktop || !navigator.share) {
      openShareSite(url);
      return;
    }

    const text = title ? `${title}\n${url}` : url;

    try {
      await navigator.share({ text });
    } catch (error) {
      // ユーザーがキャンセルした場合は何もしない
      if (error instanceof Error && error.name !== "AbortError") {
        openShareSite(url);
      }
    }
  };

  const openShareSite = (url: string) => {
    const shareText = title ? `${title}\n${url}` : url;
    const shareUrl = new URL("https://しぇあ.com");
    shareUrl.searchParams.set("text", shareText);

    window.open(shareUrl.toString(), "_blank", "noopener,noreferrer");
  };

  return (
    <IconButton onClick={handleShare}>
      <IconShare className="h-4 w-4" />
    </IconButton>
  );
}
