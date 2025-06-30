import Image from "next/image";
import type { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

type UserIconProps = PropsWithChildren<{
  src: string;
  alt: string;
  className?: string;
}>;

/**
 * UserIcon コンポーネント
 *
 * ユーザーのアイコン画像を表示します。
 */
export default function UserIcon({ src, alt, className, children }: UserIconProps) {
  return (
    <div className={twMerge("flex items-center gap-3 tracking-wider", className)}>
      <div className="relative inline-block h-8 w-8 overflow-hidden rounded-full border border-warm-black-50">
        <Image src={src} alt={alt} fill />
      </div>
      <span className="text-sm">{children}</span>
    </div>
  );
}
