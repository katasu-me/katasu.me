"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";
import LogoImage from "@/assets/logo.svg";
import TextLink from "@/components/TextLink";
import UserIcon from "@/features/auth/components/UserIcon";
import { signOut, useSession } from "@/lib/auth-client";
import DevelopedBy from "./DevelopedBy";

type Props = {
  mode: "logged-in-user" | "developed-by";
  className?: string;
};

export default function Footer({ mode, className }: Props) {
  const router = useRouter();
  const { data } = useSession();

  // 表示モードが logged-in-user のときで、データがない場合は表示しない
  const showDivider = mode === "logged-in-user" ? !!data : true;

  const handleSignOutClick = async () => {
    await signOut();
    router.replace("/");
  };

  return (
    <footer className={twMerge("flex flex-col items-center border-warm-black-25 border-t py-32", className)}>
      {mode === "developed-by" && <DevelopedBy />}

      {mode === "logged-in-user" && data && (
        <>
          <UserIcon className="size-7" userId={data.user.id} username={data.user.name} iconImageKey={data.user.image} />
          <button
            className="interactive-scale mt-8 cursor-pointer text-sm text-warm-black-50"
            onClick={handleSignOutClick}
          >
            ログアウト
          </button>
        </>
      )}

      {showDivider && (
        <div className="my-16 flex gap-1">
          {new Array(3).fill(null).map((_, index) => (
            <span key={index.toString()} className="h-1 w-2 rounded-full bg-warm-black-25" />
          ))}
        </div>
      )}

      <div className="flex flex-col items-center justify-center gap-10">
        <Link className="interactive-scale-brightness" href="/">
          <LogoImage className="h-16 w-16" />
        </Link>

        <nav className="flex flex-col items-center gap-2 text-sm text-warm-black">
          {/* TODO: ページ作ったら差し替える */}
          <TextLink href="/">お知らせ</TextLink>
          <TextLink href="/">利用規約</TextLink>
          <TextLink href="/">プライバシーポリシー</TextLink>
        </nav>
      </div>

      <p className="mt-10 text-xs">© katasu.me</p>
    </footer>
  );
}
