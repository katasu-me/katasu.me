import { useEffect } from "react";

export default function ReportUserTallyForm() {
  useEffect(() => {
    // すでにTallyが読み込まれている場合
    if (window.Tally) {
      window.Tally.loadEmbeds();
      return;
    }
  }, []);

  const embedId = process.env.VITE_REPORT_USER_TILLY_EMBED_ID;

  return (
    <div className="col-start-2">
      <iframe
        data-tally-src={`https://tally.so/embed/${embedId}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`}
        loading="lazy"
        width="100%"
        height="337"
        title="katasu.me ユーザー報告フォーム"
      />
    </div>
  );
}
