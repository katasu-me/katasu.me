import Link from "next/link";
import MasonryImageLayout from "@/components/MasonryImageLayout";
import UserIcon from "@/components/UserIcon";

type PageProps = {
  params: Promise<{
    username: string;
    tagname: string;
  }>;
};

export default async function ImagesPage({ params }: PageProps) {
  const { tagname } = await params;

  const tagNameStr = decodeURIComponent(tagname);

  return (
    <div className="flex flex-col gap-6 py-12 md:py-24">
      <header className="flex items-center justify-between">
        <Link href="#">
          <UserIcon name="arrow2nd" src="https://avatars.githubusercontent.com/u/44780846?v=4" alt="ユーザーアイコン" />
        </Link>
      </header>

      <h1 className="text-4xl">{`#${tagNameStr}`}</h1>

      <MasonryImageLayout
        images={[
          {
            id: "1",
            src: "https://placehold.jp/300x400.png",
            alt: "ポートレート画像",
            width: 300,
            height: 400,
            href: "/test/images/1",
            title: "縦長の画像",
          },
          {
            id: "2",
            src: "https://placehold.jp/400x300.png",
            alt: "風景画像",
            width: 400,
            height: 300,
            href: "/test/images/2",
            title: "横長の風景",
          },
          {
            id: "3",
            src: "https://placehold.jp/300x300.png",
            alt: "スクエア画像",
            width: 300,
            height: 300,
            href: "/test/images/3",
            title: "正方形",
          },
          {
            id: "4",
            src: "https://placehold.jp/280x500.png",
            alt: "縦長ポートレート",
            width: 280,
            height: 500,
            href: "/test/images/4",
          },
          {
            id: "5",
            src: "https://placehold.jp/250x350.png",
            alt: "小さなポートレート",
            width: 250,
            height: 350,
            title: "小さめの縦長",
            href: "/test/images/5",
          },
        ]}
      />
    </div>
  );
}
