import { ClientOnly } from "@tanstack/react-router";
import StartButton from "@/features/auth/components/StartButton";
import DemoImages from "@/features/top/components/DemoImages";

export default function StartBanner() {
  return (
    <div className="relative mb-16 flex w-full pc:flex-row flex-col items-center overflow-hidden border border-warm-black-50 bg-white px-8 pc:pt-10.5 pt-12.5 pb-11 pc:pb-9">
      <ClientOnly>
        <DemoImages className="absolute -bottom-16 -left-8 h-[150px] w-48 opacity-30 pc:opacity-60 blur-xs pc:blur-none" />
      </ClientOnly>
      <p className="z-10 shrink-0 flex-grow pc:pl-46 pc:text-left text-center pc:text-base text-lg text-warm-black pc:tracking-[0.2em] tracking-[0.1em]">
        <span className="-ml-[0.5em]">「じぶん」のための、</span>
        <br />
        インターネットのかたすみ。
      </p>
      <StartButton className="z-10 mt-4 pc:mt-0 pc:ml-16 pc:w-1/3 w-full bg-white" user={undefined} />
    </div>
  );
}
