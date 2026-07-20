import { Link } from "@tanstack/react-router";
import { css } from "styled-system/css";
import Button from "@/components/Button";
import MessagePage from "@/components/MessagePage";

export default function ComingSoon() {
  return (
    <MessagePage title="準備中です">
      <Link to="/" className={css({ mt: "8", display: "inline-block" })}>
        <Button>トップページに戻る</Button>
      </Link>
    </MessagePage>
  );
}
