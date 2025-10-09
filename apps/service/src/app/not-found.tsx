import { Metadata } from "next";
import Link from "next/link";
import LogoImage from "@/assets/logo.svg";
import Button from "@/components/Button";
import BudouX from "@/components/BudouX";
import { generateMetadataTitle } from "@/lib/meta";

export const metadata: Metadata = generateMetadataTitle("お探しのページが見つかりません");

export default function NotFound() {
  return (
    <div className="col-start-2 flex min-h-screen flex-col items-center justify-center">
      <section className="flex flex-col items-center justify-center text-center">
        <LogoImage className="w-32 pc:w-48 opacity-70" />
        <h1 className="mt-8 text-2xl pc:text-3xl font-normal tracking-[0.1em] text-warm-black">
          404
        </h1>
        <div className="mt-4 text-warm-black-50 leading-[1.6] tracking-[0.04em]">
          <p>
            <BudouX>お探しのページが見つかりません。</BudouX>
          </p>
          <p className="mt-2">
            <BudouX>ページが移動されたか、削除された可能性があります。</BudouX>
          </p>
        </div>
        <Link href="/" className="mt-8">
          <Button>トップページに戻る</Button>
        </Link>
      </section>
    </div>
  );
}