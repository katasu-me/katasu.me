import type { Metadata } from "next";
import Link from "next/link";
import LogoImage from "@/assets/logo.svg";
import BudouX from "@/components/BudouX";
import Button from "@/components/Button";
import { generateMetadataTitle } from "@/lib/meta";

export const metadata: Metadata = generateMetadataTitle({ pageTitle: "お探しのページが見つかりません" });

export default function NotFound() {
  return (
    <div className="col-start-2 flex min-h-screen flex-col items-center justify-center">
      <section className="flex flex-col items-center justify-center text-center">
        <LogoImage className="pc:w-48 w-32 opacity-70" />
        <h1 className="mt-8 font-normal pc:text-3xl text-2xl text-warm-black tracking-[0.1em]">404</h1>
        <div className="mt-4 text-warm-black">
          <p>
            <BudouX>ページが見つかりませんでした。</BudouX>
          </p>
          <p className="mt-2">
            <BudouX>ページが移動されたか、削除されたのかもしれません。</BudouX>
          </p>
        </div>
        <Link href="/" className="mt-8">
          <Button>トップページに戻る</Button>
        </Link>
      </section>
    </div>
  );
}
