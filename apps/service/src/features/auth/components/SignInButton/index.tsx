import type { PropsWithChildren } from "react";
import { css } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";
import Button from "@/components/Button";
import { signIn } from "@/features/auth/libs/auth-client";

type Props = PropsWithChildren<{
  provider: "google";
  onLoading: () => void;

  cssProps?: SystemStyleObject;
}>;

export default function SignInButton({ provider, onLoading, cssProps, children }: Props) {
  const doSignIn = async () => {
    onLoading();

    await signIn.social({
      provider,
      callbackURL: "/api/auth/redirect",
      newUserCallbackURL: "/auth/signup",
      errorCallbackURL: "/auth/error",
    });
  };

  return (
    <div className={css({ w: "full" }, cssProps)}>
      <Button
        cssProps={css.raw({ display: "flex", w: "full", alignItems: "center", justifyContent: "center", gap: "2" })}
        variant="fill"
        onClick={doSignIn}
      >
        {children}
      </Button>
    </div>
  );
}
