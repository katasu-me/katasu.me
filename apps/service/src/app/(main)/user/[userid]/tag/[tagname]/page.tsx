import { notFound } from "next/navigation";
import type { ComponentProps } from "react";
import { fetchUserWithCache } from "@/actions/user";
import IconDots from "@/assets/icons/dots.svg";
import IconSearch from "@/assets/icons/search.svg";
import Header from "@/components/Header";
import IconButton from "@/components/IconButton";
import type FrameImage from "@/features/gallery/components/FrameImage";
import GalleryView from "@/features/gallery/components/GalleryView";

export default async function TagPage({ params, searchParams }: PageProps<"/user/[userid]/tag/[tagname]">) {
  const { userid, tagname } = await params;

  const user = await fetchUserWithCache(userid);

  // ユーザーが存在しない場合は404
  if (!user) {
    notFound();
  }

  console.log("TagsPage params:", userid, tagname);

  const tagNameStr = decodeURIComponent(tagname);
  const { view } = await searchParams;

  const images: ComponentProps<typeof FrameImage>[] = [
    {
      id: "1",
      src: "/dummy/a.avif",
      alt: "画像",
      width: 2624,
      height: 3936,
      title: "縦長の画像",
      linkParams: {
        userId: user.id,
        imageId: "1",
      },
    },
    {
      id: "2",
      src: "/dummy/b.avif",
      alt: "画像",
      width: 2560,
      height: 1440,
      title: "横長の風景",
      linkParams: {
        userId: user.id,
        imageId: "2",
      },
    },
    {
      id: "3",
      src: "/dummy/c.avif",
      alt: "画像",
      width: 1440,
      height: 2560,
      title: "正方形",
      linkParams: {
        userId: user.id,
        imageId: "3",
      },
    },
    {
      id: "4",
      src: "/dummy/d.avif",
      alt: "画像",
      width: 2560,
      height: 1440,
      linkParams: {
        userId: user.id,
        imageId: "4",
      },
    },
  ];

  return (
    <div className="col-span-full grid grid-cols-subgrid gap-y-12 py-16">
      <Header user={user}>
        <div className="flex items-center gap-2">
          <IconButton title="検索">
            <IconSearch className="h-6 w-6" />
          </IconButton>

          <IconButton title="その他">
            <IconDots className="h-6 w-6" />
          </IconButton>
        </div>
      </Header>

      <h1 className="col-start-2 text-4xl">{`#${tagNameStr}`}</h1>

      <div className="col-span-full grid grid-cols-subgrid gap-y-8">
        <GalleryView view={view || "masonry"} images={images} />
      </div>
    </div>
  );
}
