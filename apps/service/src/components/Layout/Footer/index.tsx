"use client";

import Link from "next/link";
import { redirect } from "next/navigation";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import LogoImage from "@/assets/logo.svg";
import TextLink from "@/components/TextLink";
import UserIcon from "@/features/auth/components/UserIcon";
import { signOut } from "@/lib/auth-client";
import DevelopedBy from "./DevelopedBy";

type WithLoggedInUserProps = {
  mode: "logged-in-user";
  className?: string;
} & ComponentProps<typeof UserIcon>;

type WithDevelopedByProps = {
  mode: "developed-by";
  className?: string;
};

type Props = WithLoggedInUserProps | WithDevelopedByProps;

export default function Footer({ className, ...props }: Props) {
  const handleSignOutClick = async () => {
    await signOut();
    redirect("/");
  };

  return (
    <footer className={twMerge("flex flex-col items-center border-warm-black-25 border-t py-32", className)} {...props}>
      {props.mode === "developed-by" ? (
        <DevelopedBy />
      ) : (
        <>
          <UserIcon className="size-7" {...props} />
          <button className="interactive-scale mt-8 text-sm text-warm-black-50" onClick={handleSignOutClick}>
            ログアウト
          </button>
        </>
      )}

      <div className="my-16 flex gap-1">
        {new Array(3).fill(null).map((_, index) => (
          <span key={index.toString()} className="h-1 w-2 rounded-full bg-warm-black-25" />
        ))}
      </div>

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
