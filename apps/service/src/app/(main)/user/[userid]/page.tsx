import { notFound } from "next/navigation";
import type { ComponentProps } from "react";
import { fetchUserWithCache } from "@/actions/user";
import IconDots from "@/assets/icons/dots.svg";
import IconSearch from "@/assets/icons/search.svg";
import IconButton from "@/components/IconButton";
import TagLinks from "@/components/Navigation/TagLinks";
import UserIcon from "@/features/auth/components/UserIcon";
import type FrameImage from "@/features/gallery/components/FrameImage";
import ImagesUI from "@/features/gallery/components/ImagesUI";
import type { ImageLayoutType } from "@/features/gallery/types/layout";
import { getUserAvatarUrl } from "@/lib/r2";

const images: ComponentProps<typeof FrameImage>[] = [
  {
    id: "1",
    src: "/dummy/a.avif",
    alt: "画像",
    width: 2624,
    height: 3936,
    title: "縦長の画像",
    linkParams: {
      userId: "test",
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
      userId: "test",
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
      userId: "test",
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
      userId: "test",
      imageId: "4",
    },
  },
];

const tags = [
  {
    name: "風景",
    userId: "test",
  },
  {
    name: "ポートレート",
    userId: "test",
  },
  {
    name: "空間",
    userId: "test",
  },
];

type PageProps = {
  params: Promise<{
    userid: string;
  }>;
  searchParams: Promise<{
    search?: string;
    view?: ImageLayoutType;
  }>;
};

export default async function UsersPage({ params, searchParams }: PageProps) {
  const { userid } = await params;

  const user = await fetchUserWithCache(userid);

  // ユーザーが存在しない場合は404
  if (!user) {
    notFound();
  }

  const avatarUrl = getUserAvatarUrl(user);
  const resolvedSearchParams = await searchParams;

  return (
    <div className="col-span-full grid grid-cols-subgrid gap-y-12 py-16">
      <header className="col-start-2 flex items-center justify-between">
        <UserIcon name={user.name} src={avatarUrl} alt="ユーザーアイコン" />

        <div className="flex items-center gap-2">
          <IconButton title="検索">
            <IconSearch className="h-6 w-6" />
          </IconButton>
          <IconButton title="その他">
            <IconDots className="h-6 w-6" />
          </IconButton>
        </div>
      </header>

      <div className="col-span-full grid grid-cols-subgrid gap-y-8">
        <TagLinks className="col-start-2" tags={tags} />

        <ImagesUI view={resolvedSearchParams.view || "masonry"} images={images} />
      </div>
    </div>
  );
}
