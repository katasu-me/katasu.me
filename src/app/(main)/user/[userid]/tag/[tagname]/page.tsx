import Link from "next/link";
import IconDots from "@/assets/icons/dots.svg";
import IconSearch from "@/assets/icons/search.svg";
import ImagesUI from "@/features/gallery/components/ImagesUI";
import type { ImageLayoutType } from "@/features/gallery/types/layout";
import UserIcon from "@/features/user/components/UserIcon";
import IconButton from "@/shared/components/IconButton";

type PageProps = {
  params: Promise<{
    userid: string;
    tagname: string;
  }>;
  searchParams: Promise<{
    view?: ImageLayoutType;
  }>;
};

export default async function TagsPage({ params, searchParams }: PageProps) {
  const { userid, tagname } = await params;
  const tagNameStr = decodeURIComponent(tagname);

  console.log("TagsPage params:", userid, tagname);

  const { view } = await searchParams;

  const images = [
    {
      id: "1",
      src: "/dummy/a.avif",
      alt: "画像",
      width: 2624,
      height: 3936,
      href: "/test/images/1",
      title: "縦長の画像",
    },
    {
      id: "2",
      src: "/dummy/b.avif",
      alt: "画像",
      width: 2560,
      height: 1440,
      href: "/test/images/2",
      title: "横長の風景",
    },
    {
      id: "3",
      src: "/dummy/c.avif",
      alt: "画像",
      width: 1440,
      height: 2560,
      href: "/test/images/3",
      title: "正方形",
    },
    {
      id: "4",
      src: "/dummy/d.avif",
      alt: "画像",
      width: 2560,
      height: 1440,
      href: "/test/images/4",
    },
  ];

  return (
    <div className="col-span-full grid grid-cols-subgrid gap-y-12 py-16">
      <header className="col-start-2 flex items-center justify-between">
        <Link className="interactive-scale" href="/user/arrow2nd">
          <UserIcon name="arrow2nd" src="https://avatars.githubusercontent.com/u/44780846?v=4" alt="ユーザーアイコン" />
        </Link>

        <div className="flex items-center gap-2">
          <IconButton title="検索">
            <IconSearch className="h-6 w-6" />
          </IconButton>
          <IconButton title="その他">
            <IconDots className="h-6 w-6" />
          </IconButton>
        </div>
      </header>

      <h1 className="col-start-2 text-4xl">{`#${tagNameStr}`}</h1>

      <div className="col-span-full grid grid-cols-subgrid gap-y-8">
        <ImagesUI view={view || "masonry"} images={images} searchParams={await searchParams} />
      </div>
    </div>
  );
}
