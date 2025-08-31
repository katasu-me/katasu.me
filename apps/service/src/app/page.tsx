import LogoImage from "@/assets/logo.svg";
import DemoImages from "@/features/landing/components/DemoImages";
import Footer from "@/features/layout/components/Footer";
import SignInDrawer from "@/features/signin/components/SignInDrawer";
import BudouX from "@/shared/components/BudouX";
import Button from "@/shared/components/Button";
import { SITE_NAME } from "@/shared/constants/site";

export default function Home() {
  return (
    <div className="col-start-2">
      <section className="flex h-[calc(100vh-16px)] items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <LogoImage className="pc:w-64 w-48" />
          <h1 className="mt-16 pc:mt-20 text-center font-normal pc:text-2xl text-lg leading-7 pc:leading-9 pc:tracking-[0.2em] tracking-[0.1em]">
            インターネットのかたすみにある、 <br />
            ぽつんと画像をおいておける場所。
          </h1>
          <SignInDrawer>
            <Button className="mt-8 pc:mt-10 w-48">はじめる</Button>
          </SignInDrawer>
        </div>
      </section>

      <section className="mx-auto text-center">
        <div className="text-gray-700 leading-[1.6] tracking-[0.04em] [&_p:first-child]:mt-0 [&_p]:mb-6">
          <p>
            <BudouX>{`${SITE_NAME}はインターネットのかたすみにある、画像をおいておける場所です。`}</BudouX>
          </p>
          <p>
            <BudouX>「せっかくだから写真や画像を公開したい」</BudouX>
            <br />
            <BudouX>「けど、SNSはなんか違うかも……」</BudouX>
          </p>
          <p>
            <BudouX>みたいなシャイな気持ちから生まれました。</BudouX>
          </p>
          <p>
            <BudouX>気になった人がふらっと入って、ふらっと去っていく</BudouX>
            <br />
            <BudouX>そんなかたすみの空間をめざしています。</BudouX>
          </p>
        </div>
        <DemoImages className="mx-auto my-32" />
      </section>

      <Footer logoType="developed-by" />
    </div>
  );
}
