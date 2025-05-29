import LogoImage from "@/assets/logo.svg";
import Button from "@/components/Button";

export default function Home() {
  return (
    <main>
      <section className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center">
          <LogoImage className="w-48 sm:w-64" />
          <h1 className="mt-16 text-center text-lg tracking-widest sm:mt-20 sm:text-2xl/10 ">
            インターネットのかたすみにある、 <br />
            ぽつんと画像をおいておける場所。
          </h1>
          <Button className="mt-8 sm:mt-10">はじめる</Button>
        </div>
      </section>
    </main>
  );
}
