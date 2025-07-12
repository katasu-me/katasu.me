import DraggableImages from "@/components/DraggableImages";
import IconButton from "@/components/IconButton";
import LayoutToggle from "@/components/LayoutToggle";
import MasonryImageLayout from "@/components/MasonryImageLayout";
import TagLinks from "@/components/TagLinks";
import UserIcon from "@/components/UserIcon";

type PageProps = {
  searchParams: Promise<{
    search?: string;
    view?: "masonry" | "random";
  }>;
};

export default async function UserPage({ searchParams }: PageProps) {
  const { search, view } = await searchParams;

  console.log("UserPage searchParams:", search);

  const images = [
    {
      id: "1",
      src: "/dummy/a.avif",
      alt: "写真",
      width: 2624,
      height: 3936,
      href: "/test/images/1",
      title: "縦長の写真",
    },
    {
      id: "2",
      src: "/dummy/b.avif",
      alt: "写真",
      width: 2560,
      height: 1440,
      href: "/test/images/2",
      title: "横長の風景",
    },
    {
      id: "3",
      src: "/dummy/c.avif",
      alt: "写真",
      width: 1440,
      height: 2560,
      href: "/test/images/3",
      title: "正方形",
    },
    {
      id: "4",
      src: "/dummy/d.avif",
      alt: "写真",
      width: 2560,
      height: 1440,
      href: "/test/images/4",
    },
  ];

  return (
    <div className="flex flex-col gap-12 py-16">
      <header className="flex items-center justify-between">
        <UserIcon name="arrow2nd" src="https://avatars.githubusercontent.com/u/44780846?v=4" alt="ユーザーアイコン" />

        <div className="flex items-center gap-2">
          <IconButton iconName="search" />
          <IconButton iconName="dots" />
        </div>
      </header>

      <div className="space-y-8">
        <TagLinks
          tags={[
            {
              name: "風景",
              href: "/test/tag/%E9%A2%A8%E6%99%AF",
              image: "/dummy/a.avif",
            },
            {
              name: "ポートレート",
              href: "/test/tag/%E3%83%9D%E3%83%BC%E3%83%88%E3%83%AC%E3%83%BC%E3%83%88",
              image: "/dummy/b.avif",
            },
            {
              name: "空間",
              href: "/test/tag/%E5%8B%95%E7%89%A9",
              image: "/dummy/c.avif",
            },
          ]}
        />
        {view === "random" ? <DraggableImages items={images} /> : <MasonryImageLayout images={images} />}
      </div>

      <LayoutToggle
        className="fixed right-6 bottom-6 z-50"
        value={view || "masonry"}
        masonryHref="?view=masonry"
        randomHref="?view=random"
      />
    </div>
  );
}
