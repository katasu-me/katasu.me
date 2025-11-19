import { Link } from "@tanstack/react-router";
import type { PropsWithChildren } from "react";
import LogoImage from "@/assets/logo.svg?react";
import Button from "@/components/Button";

type Props = PropsWithChildren<{
  title: string;
  showBackButton?: boolean;
}>;

export default function MessagePage({ title, children, showBackButton = false }: Props) {
  return (
    <div className="col-start-2 flex min-h-screen flex-col items-center justify-center">
      <section className="flex flex-col items-center justify-center text-center">
        <LogoImage className="pc:w-48 w-32 opacity-70" />
        <h1 className="mt-8 font-normal pc:text-3xl text-2xl text-warm-black">{title}</h1>
        <div className="mt-4 text-warm-black">{children}</div>
        {showBackButton && (
          <Link to="/" className="mt-8">
            <Button>トップページに戻る</Button>
          </Link>
        )}
      </section>
    </div>
  );
}
