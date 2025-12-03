import { useEffect } from "react";

export default function ReportImageTallyForm() {
  useEffect(() => {
    // すでにTallyが読み込まれている場合
    if (window.Tally) {
      window.Tally.loadEmbeds();
      return;
    }
  }, []);

  console.log("[DEBUG] ", "import.meta.env", import.meta.env);

  const embedId = import.meta.env.VITE_REPORT_IMAGE_TILLY_EMBED_ID;

  return (
    <div className="col-start-2">
      <iframe
        data-tally-src={`https://tally.so/embed/${embedId}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`}
        loading="lazy"
        width="100%"
        height="337"
        title="katasu.me 投稿報告フォーム"
      />
    </div>
  );
}
