import Link from "next/link";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import LogoImage from "@/assets/logo.svg";
import TextLink from "../TextLink";
import DevelopedBy from "./DevelopedBy";

type Props = {
  logoType?: "katasu.me" | "developed-by";
} & ComponentProps<"footer">;

export default function Footer({ logoType = "katasu.me", className, ...props }: Props) {
  return (
    <footer className={twMerge("border-warm-black-25 border-t py-32", className)} {...props}>
      <div className="flex flex-col items-center justify-center gap-12">
        {logoType === "developed-by" ? (
          <DevelopedBy />
        ) : (
          <Link className="interactive-scale-brightness" href="/">
            <LogoImage className="h-16 w-16" />
          </Link>
        )}

        <nav className="flex flex-col items-center gap-2 text-sm text-warm-black">
          <TextLink href="/news">お知らせ</TextLink>
          <TextLink href="/terms">利用規約</TextLink>
          <TextLink href="/privacy">プライバシーポリシー</TextLink>
        </nav>

        <p className="text-xs">© katasu.me</p>
      </div>
    </footer>
  );
}
