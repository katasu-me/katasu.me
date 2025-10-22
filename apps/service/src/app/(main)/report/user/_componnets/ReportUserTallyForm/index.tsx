"use client";

import Script from "next/script";
import { useEffect } from "react";

export default function ReportUserTallyForm() {
  // NOTE: ScriptのonLoadだと発火しないので
  useEffect(() => {
    // @ts-expect-error
    if (typeof Tally !== "undefined") {
      // @ts-expect-error
      Tally.loadEmbeds();
    }
  }, []);

  return (
    <div className="col-start-2">
      <iframe
        data-tally-src={`https://tally.so/embed/${process.env.NEXT_PUBLIC_REPORT_USER_TILLY_EMBED_ID}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`}
        loading="lazy"
        width="100%"
        height="337"
        title="katasu.me ユーザー報告フォーム"
      />
      <Script src="https://tally.so/widgets/embed.js" />
    </div>
  );
}
