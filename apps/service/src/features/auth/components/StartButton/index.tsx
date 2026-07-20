import type { PublicUserData } from "@katasu.me/service-db";
import { Link } from "@tanstack/react-router";
import { css } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";
import IconPlant from "@/assets/icons/plant.svg?react";
import Button from "@/components/Button";
import SignInDrawer from "../SignInDrawer";

type Props = {
  user: PublicUserData | undefined;
  cssProps?: SystemStyleObject;
};

export default function StartButton({ user, cssProps }: Props) {
  // 登録 & 同意が完了している場合
  if (user?.id && user.termsAgreedAt && user.privacyPolicyAgreedAt) {
    return (
      <Button asChild cssProps={css.raw({ w: "48" }, cssProps)}>
        <Link
          className={css({ mx: "auto", display: "flex", alignItems: "center", justifyContent: "center", gap: "2" })}
          to="/user/$userSlug"
          params={{ userSlug: user.customUrl || user.id }}
          search={{
            view: "timeline",
            page: 1,
          }}
        >
          <IconPlant className={css({ boxSize: "5" })} />
          マイページへ
        </Link>
      </Button>
    );
  }

  return (
    <SignInDrawer>
      <Button cssProps={css.raw({ w: "48" }, cssProps)}>はじめる</Button>
    </SignInDrawer>
  );
}
