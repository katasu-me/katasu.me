import type { PublicUserData } from "@katasu.me/service-db";
import { Link } from "@tanstack/react-router";
import { twMerge } from "tailwind-merge";
import IconPlant from "@/assets/icons/plant.svg?react";
import Button from "@/components/Button";
import SignInDrawer from "../SignInDrawer";

type Props = {
  user: PublicUserData | undefined;
  className?: string;
};

export default function StartButton({ user, className }: Props) {
  const buttonClassname = twMerge("w-48", className);

  // 登録 & 同意が完了している場合
  if (user?.id && user.termsAgreedAt && user.privacyPolicyAgreedAt) {
    return (
      <Button asChild>
        <Link
          className={twMerge("mx-auto flex items-center justify-center gap-2", buttonClassname)}
          to="/user/$userSlug"
          params={{ userSlug: user.id }}
          search={{
            view: "timeline",
            page: 1,
          }}
        >
          <IconPlant className="size-5" />
          マイページへ
        </Link>
      </Button>
    );
  }

  return (
    <SignInDrawer>
      <Button className={buttonClassname}>はじめる</Button>
    </SignInDrawer>
  );
}
