import Image from "next/image";

type UserIconProps = {
  src: string;
  alt: string;
  name: string;
};

/**
 * UserIcon コンポーネント
 *
 * ユーザーのアイコン画像を表示します。
 */
export default function UserIcon({ src, alt, name }: UserIconProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative inline-block h-10 w-10 overflow-hidden rounded-full border border-warm-black-50">
        <Image src={src} alt={alt} fill />
      </div>
      <span className="tracking-widest">{name}</span>
    </div>
  );
}
