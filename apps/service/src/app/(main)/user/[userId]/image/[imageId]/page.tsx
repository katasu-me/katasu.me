import Link from "next/link";
import IconFlag from "@/assets/icons/flag.svg";
import IconPencil from "@/assets/icons/pencil.svg";
import IconShare from "@/assets/icons/share.svg";
import Button from "@/components/Button";
import IconButton from "@/components/IconButton";
import UserIcon from "@/features/auth/components/UserIcon";

// TODO: 実際はAPIから画像データを取得する
const image = {
  src: "/dummy/b.avif",
  alt: "画像",
  width: 2560,
  height: 1440,
  label: "横長の風景",
  tags: [
    {
      name: "風景",
      href: "/user/a/tag/landscape",
    },
    {
      name: "横長",
      href: "/user/a/tag/wide",
    },
    {
      name: "自然",
      href: "/user/a/tag/nature",
    },
  ],
};

type PageProps = {
  params: Promise<{
    userid: string;
    imageid: string;
  }>;
};

export default async function ImagesPage({ params }: PageProps) {
  const { userid } = await params;

  const user = await fetchUserWithCache(userid);

  // ユーザーが存在しない場合は404
  if (!user) {
    notFound();
  }

  return (
    <div className="col-span-full grid grid-cols-subgrid gap-y-12 py-16">
      <header className="col-start-2 flex items-center justify-between">
        <UserIcon name="arrow2nd" src="https://avatars.githubusercontent.com/u/44780846?v=4" alt="ユーザーアイコン" />
      </header>

      <div className="col-start-2 mx-auto w-full text-center">
        <BigImage {...image} />
        <h2 className="mt-8 text-xl">{image.label}</h2>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {image.tags.map((tag) => (
            <Link key={tag.name} href="/user/a/tag/a" className="text-sm text-warm-black hover:underline">
              #{tag.name}
            </Link>
          ))}
        </div>

        <div className="mt-12 flex items-center justify-center">
          {/* TODO: 編集ボタンは投稿したユーザーのみ表示 */}
          <Button className="flex items-center gap-1">
            <IconPencil className="h-4 w-4" />
            <span className="text-sm">編集する</span>
          </Button>
          <IconButton className="ml-6">
            <IconFlag className="h-4 w-4" />
          </IconButton>
          <IconButton className="ml-3">
            <IconShare className="h-4 w-4" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
