"use client";

import { type PropsWithChildren, useState } from "react";
import { twJoin } from "tailwind-merge";
import IconBrandGoogle from "@/assets/icons/brand-google.svg";
import BudouX from "@/components/BudouX";
import Drawer from "@/components/Drawer";
import { Loading } from "@/components/Loading";
import { getGreeting } from "../../lib/get-greeting";
import SignInButton from "./SignInButton";

export default function SignInDrawer({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(false);

  const greeting = getGreeting();

  const handleLoading = () => {
    setIsLoading(true);
  };

  return (
    <Drawer title={greeting} triggerChildren={children} hiddenTitle={isLoading} dismissible={isLoading}>
      {({ Description }) => (
        <>
          <Description className={twJoin("mb-6 text-gray-700 text-sm", isLoading && "sr-only")}>
            <BudouX>katasu.me（かたすみ）はインターネットのかたすみに画像をおいておける、画像投稿サービスです。</BudouX>
          </Description>

          {isLoading ? (
            <Loading className="mt-8 mb-2" title="ログインしています…" />
          ) : (
            <SignInButton provider="google" onLoading={handleLoading}>
              <IconBrandGoogle className="h-5 w-5" />
              Googleでつづける
            </SignInButton>
          )}
        </>
      )}
    </Drawer>
  );
}
