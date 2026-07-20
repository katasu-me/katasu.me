import { css } from "styled-system/css";
import IconShare from "@/assets/icons/share.svg?react";
import IconButton from "@/components/IconButton";
import { useDevice } from "@/hooks/useDevice";

type Props = {
  title: string | null;
  userSlug: string;
  imageId: string;
};

export default function ShareButton({ title: rawTitle, userSlug, imageId }: Props) {
  const { isDesktop } = useDevice();

  const handleShare = async () => {
    const url = new URL(`/user/${userSlug}/image/${imageId}`, window.location.origin).toString();
    const title = rawTitle?.trim();
    const text = title ? `${title}\n${url}` : url;

    if (isDesktop || !navigator.share) {
      openShareSite(text);
      return;
    }

    try {
      await navigator.share({ text });
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        openShareSite(text);
      }
    }
  };

  const openShareSite = (text: string) => {
    const shareUrl = new URL("https://しぇあ.com");
    shareUrl.searchParams.set("text", text);

    window.open(shareUrl.toString(), "_blank", "noopener,noreferrer");
  };

  return (
    <IconButton onClick={handleShare}>
      <IconShare className={css({ w: "4", h: "4" })} />
    </IconButton>
  );
}
