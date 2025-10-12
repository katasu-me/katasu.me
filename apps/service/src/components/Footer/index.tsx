"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";
import IconPlant from "@/assets/icons/plant.svg";
import LogoImage from "@/assets/logo.svg";
import Button from "@/components/Button";
import TextLink from "@/components/TextLink";
import { signOut } from "@/lib/auth-client";
import DevelopedBy from "./DevelopedBy";

type Props =
  | {
      mode: "logged-in-user";
      userId?: string;
      className?: string;
    }
  | {
      mode: "developed-by";
      className?: string;
    };

export default function Footer({ className, ...props }: Props) {
  const router = useRouter();
  const showDivider = props.mode === "logged-in-user" ? !!props.userId : true;

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
  };

  return (
    <footer className={twMerge("flex flex-col items-center border-warm-black-25 border-t py-32", className)}>
      {props.mode === "developed-by" && <DevelopedBy />}

      {props.mode === "logged-in-user" && props.userId && (
        <div className="flex flex-col items-center gap-6">
          <Button asChild>
            <Link className="flex w-48 items-center justify-center gap-2" href={`/user/${props.userId}`}>
              <IconPlant className="size-5" />
              マイページへ
            </Link>
          </Button>
          <button
            className="interactive-scale cursor-pointer text-sm text-warm-black-50 transition-all duration-400 ease-magnetic hover:brightness-90"
            type="button"
            onClick={handleSignOut}
          >
            ログアウト
          </button>
        </div>
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
