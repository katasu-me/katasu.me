import type { PublicUserData } from "@katasu.me/service-db";
import { Link } from "@tanstack/react-router";
import { twMerge } from "tailwind-merge";
import IconPlant from "@/assets/icons/plant.svg?react";
import Button from "@/components/Button";

type Props = {
  user: PublicUserData | undefined;
  className?: string;
};

// export function StartButtonFallback({ className }: Props) {
//   return (
//     <Button className={twMerge("flex w-48 items-center justify-center gap-2", className)} disabled>
//       <IconLoader2 className="size-5 animate-spin" />
//       よみこみちゅう
//     </Button>
//   );
// }

export default function StartButton({ user, className }: Props) {
  const buttonClassname = twMerge("w-48", className);

  // 登録 & 同意が完了している場合
  if (user?.id && user.termsAgreedAt && user.privacyPolicyAgreedAt) {
    return (
      <Button asChild>
        <Link
          className={twMerge("mx-auto flex items-center justify-center gap-2", buttonClassname)}
          to={`/user/${user.id}`}
        >
          <IconPlant className="size-5" />
          マイページへ
        </Link>
      </Button>
    );
  }

  // TODO: リリース時には外す
  return (
    <div className={className}>
      <Button asChild>
        <Link className="mx-auto flex w-fit items-center justify-center gap-2" to="/user/8uB8pmZ-pcGqxBfdpnWo6">
          <IconPlant className="size-5" />
          開発者のかたすみをのぞく
        </Link>
      </Button>
      <Link className="mt-4 block text-center text-warm-black-50 text-xs hover:underline" to="/closed-beta">
        βテスト登録済のかたはこちら
      </Link>
    </div>
  );

  // return (
  //   <SignInDrawer>
  //     <Button className={buttonClassname}>はじめる</Button>
  //   </SignInDrawer>
  // );
}
