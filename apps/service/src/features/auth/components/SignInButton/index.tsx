import type { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";
import Button from "@/components/Button";
import { signIn } from "@/features/auth/libs/auth-client";

type Props = PropsWithChildren<{
  provider: "google";
  onLoading: () => void;

  className?: string;
}>;

export default function SignInButton({ provider, onLoading, className, children }: Props) {
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
    <div className={twMerge("w-full", className)}>
      <Button className="flex w-full items-center justify-center gap-2" variant="fill" onClick={doSignIn}>
        {children}
      </Button>
    </div>
  );
}
