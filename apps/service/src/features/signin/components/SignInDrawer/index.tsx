"use client";

import type { PropsWithChildren } from "react";
import IconBrandGoogle from "@/assets/icons/brand-google.svg";
import { signIn } from "@/lib/auth-client";
import BudouX from "@/shared/components/BudouX";
import Button from "@/shared/components/Button";
import Drawer from "@/shared/components/Drawer";
import { getGreeting } from "../../lib/get-greeting";

export default function SignInDrawer({ children }: PropsWithChildren) {
  const greeting = getGreeting();

  const doSignIn = async () => {
    await signIn.social({
      provider: "google",
      callbackURL: "/",
      newUserCallbackURL: "/signup",
      errorCallbackURL: "/error/signin",
    });
  };

  return (
    <Drawer title={greeting} triggerChildren={children}>
      {({ Description }) => (
        <>
          <Description className="mb-6 text-gray-700 text-sm">
            <BudouX>katasu.me（かたすみ）はインターネットのかたすみに画像をおいておける、画像投稿サービスです。</BudouX>
          </Description>
          <Button className="flex items-center gap-2" variant="fill" onClick={() => doSignIn()}>
            <IconBrandGoogle className="h-5 w-5" />
            Googleでつづける
          </Button>
        </>
      )}
    </Drawer>
  );
}
