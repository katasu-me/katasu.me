import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import TextLink from "../Link";
import DevelopedBy from "./DevelopedBy";

export default function Footer({ className, ...props }: ComponentProps<"footer">) {
  return (
    <footer className={twMerge("border-warm-black-25 border-t py-32", className)} {...props}>
      <div className="flex flex-col items-center justify-center gap-12">
        <DevelopedBy />

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
