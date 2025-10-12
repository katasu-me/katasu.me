import type { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";
import Button from "@/components/Button";
import { signIn } from "@/lib/auth-client";

type Props = PropsWithChildren<{
  provider: "google";
  onLoading: () => void;

  className?: string;
}>;

export default function LoginButton({ provider, onLoading, className, children }: Props) {
  const doSignInWithGoogle = async () => {
    onLoading();

    await signIn.social({
      provider,
      callbackURL: "/auth/redirect",
      newUserCallbackURL: "/auth/signup",
      errorCallbackURL: "/auth/error",
    });
  };

  return (
    <div className={twMerge("w-full", className)}>
      <Button className="flex w-full items-center justify-center gap-2" variant="fill" onClick={doSignInWithGoogle}>
        {children}
      </Button>
    </div>
  );
}
