import IconDots from "@/assets/icons/dots.svg";
import IconSearch from "@/assets/icons/search.svg";
import ImagesUI from "@/features/gallery/components/ImagesUI";
import type { ImageLayoutType } from "@/features/gallery/types/layout";
import TagLinks from "@/features/navigation/components/TagLinks";
import UserIcon from "@/features/user/components/UserIcon";
import IconButton from "@/shared/components/IconButton";

type PageProps = {
  params: Promise<{
    username: string;
  }>;
  searchParams: Promise<{
    search?: string;
    view?: ImageLayoutType;
  }>;
};

export default async function UsersPage({ params, searchParams }: PageProps) {
  const { username } = await params;
  const { search, view } = await searchParams;

  console.log("UserPage searchParams:", search);

  const images = [
    {
      id: "1",
      src: "/dummy/a.avif",
      alt: "画像",
      width: 2624,
      height: 3936,
      href: "/users/test/images/1",
      title: "縦長の画像",
    },
    {
      id: "2",
      src: "/dummy/b.avif",
      alt: "画像",
      width: 2560,
      height: 1440,
      href: "/users/test/images/2",
      title: "横長の風景",
    },
    {
      id: "3",
      src: "/dummy/c.avif",
      alt: "画像",
      width: 1440,
      height: 2560,
      href: "/users/test/images/3",
      title: "正方形",
    },
    {
      id: "4",
      src: "/dummy/d.avif",
      alt: "画像",
      width: 2560,
      height: 1440,
      href: "/users/test/images/4",
    },
  ];

  return (
    <div className="col-span-full grid grid-cols-subgrid gap-y-12 py-16">
      <header className="col-start-2 flex items-center justify-between">
        <UserIcon name="arrow2nd" src="https://avatars.githubusercontent.com/u/44780846?v=4" alt="ユーザーアイコン" />

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
        <TagLinks
          className="col-start-2"
          tags={[
            {
              name: "風景",
              href: "/user/arrow2nd/tag/%E9%A2%A8%E6%99%AF",
            },
            {
              name: "ポートレート",
              href: "/user/arrow2nd/tag/%E3%83%9D%E3%83%BC%E3%83%88%E3%83%AC%E3%83%BC%E3%83%88",
            },
            {
              name: "空間",
              href: "/user/arrow2nd/tag/%E5%8B%95%E7%89%A9",
            },
          ]}
        />

        <ImagesUI
          view={view || "masonry"}
          images={images}
          pathname={`/user/${username}`}
          searchParams={await searchParams}
        />
      </div>
    </div>
  );
}
