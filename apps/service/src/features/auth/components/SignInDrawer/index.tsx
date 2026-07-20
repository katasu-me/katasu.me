import { type PropsWithChildren, useState } from "react";
import { css, cx } from "styled-system/css";
import IconBrandGoogle from "@/assets/icons/brand-google.svg?react";
import BudouX from "@/components/BudouX";
import Drawer from "@/components/Drawer";
import { Loading } from "@/components/Loading";
import { getGreeting } from "../../libs/get-greeting";
import SignInButton from "../SignInButton";

export default function SignInDrawer({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(false);

  const greeting = getGreeting();

  const handleLoading = () => {
    setIsLoading(true);
  };

  return (
    <Drawer
      title={greeting}
      triggerChildren={children}
      titleClassname={cx(isLoading && css({ srOnly: true }))}
      dismissible={!isLoading}
    >
      {({ Description }) => (
        <>
          <Description
            className={cx(
              css({ mb: "6", color: "gray.700", fontSize: "sm", lineHeight: "5" }),
              isLoading && css({ srOnly: true }),
            )}
          >
            <BudouX>katasu.me（かたすみ）はインターネットのかたすみに画像をおいておける、画像投稿サービスです。</BudouX>
          </Description>

          {isLoading ? (
            <Loading cssProps={css.raw({ mt: "8", mb: "2" })} title="ログインしています…" />
          ) : (
            <SignInButton provider="google" onLoading={handleLoading}>
              <IconBrandGoogle className={css({ h: "5", w: "5" })} />
              Googleでつづける
            </SignInButton>
          )}
        </>
      )}
    </Drawer>
  );
}
