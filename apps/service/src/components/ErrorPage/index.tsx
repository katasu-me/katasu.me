import Link from "next/link";
import type { ReactNode } from "react";
import LogoImage from "@/assets/logo.svg";
import Button from "@/components/Button";

type ErrorPageProps = {
  title: string;
  children: ReactNode;
  showBackButton?: boolean;
};

export default function ErrorPage({ title, children, showBackButton = false }: ErrorPageProps) {
  return (
    <div className="col-start-2 flex min-h-screen flex-col items-center justify-center">
      <section className="flex flex-col items-center justify-center text-center">
        <LogoImage className="pc:w-48 w-32 opacity-70" />
        <h1 className="mt-8 font-normal pc:text-3xl text-2xl text-warm-black tracking-[0.1em]">{title}</h1>
        <div className="mt-4 text-warm-black">{children}</div>
        {showBackButton && (
          <Link href="/" className="mt-8">
            <Button>トップページに戻る</Button>
          </Link>
        )}
      </section>
    </div>
  );
}
