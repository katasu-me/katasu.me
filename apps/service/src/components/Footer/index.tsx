import { Link, useNavigate } from "@tanstack/react-router";
import { twMerge } from "tailwind-merge";
import IconPlant from "@/assets/icons/plant.svg?react";
import LogoImage from "@/assets/logo.svg?react";
import Button from "@/components/Button";
import ExternalLink from "@/components/ExternalLink";
import { DOCS_INFORMATION, DOCS_LICENSE, DOCS_PRIVACY_POLICY, DOCS_TERMS_OF_SERVICE } from "@/constants/site";
import { signOut } from "@/features/auth/libs/auth-client";
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
  const navigate = useNavigate();
  const showDivider = props.mode === "logged-in-user" ? !!props.userId : true;

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <footer className={twMerge("flex flex-col items-center border-warm-black-25 border-t py-32", className)}>
      {props.mode === "developed-by" && <DevelopedBy />}

      {props.mode === "logged-in-user" && props.userId && (
        <div className="flex flex-col items-center gap-6">
          <Button asChild>
            <Link
              className="flex w-48 items-center justify-center gap-2"
              to="/user/$userId"
              params={{
                userId: props.userId,
              }}
              search={{
                view: "timeline",
                page: 1,
              }}
            >
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
        <Link className="interactive-scale-brightness" to="/">
          <LogoImage className="h-16 w-16" />
        </Link>

        <nav className="flex flex-col items-center gap-2 text-sm text-warm-black">
          <ExternalLink href={DOCS_INFORMATION}>お知らせなど</ExternalLink>
          <ExternalLink href={DOCS_TERMS_OF_SERVICE} target="_blank" rel="noopener">
            利用規約
          </ExternalLink>
          <ExternalLink href={DOCS_PRIVACY_POLICY} target="_blank" rel="noopener">
            プライバシーポリシー
          </ExternalLink>
          <ExternalLink href={DOCS_LICENSE} target="_blank" rel="noopener">
            ライセンス
          </ExternalLink>
        </nav>
      </div>

      <p className="mt-10 text-xs">© katasu.me</p>
    </footer>
  );
}
