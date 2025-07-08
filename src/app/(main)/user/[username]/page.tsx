import IconButton from "@/components/IconButton";
import ImageDropArea from "@/components/ImageDropArea";
import MasonryImageLayout from "@/components/MasonryImageLayout";
import UserIcon from "@/components/UserIcon";

export default function UserPage() {
  return (
    <div className="flex flex-col gap-12 py-12 md:py-24">
      <header className="flex items-center justify-between">
        <UserIcon src="https://avatars.githubusercontent.com/u/44780846?v=4" alt="ユーザーアイコン">
          arrow2nd
        </UserIcon>

        <div className="flex items-center gap-2">
          <IconButton iconName="search" />
          <IconButton iconName="dots" />
        </div>
      </header>

      <ImageDropArea className="h-18" title="新しい画像を投稿する" />

      <MasonryImageLayout
        images={[
          {
            id: "1",
            src: "https://placehold.jp/300x400.png",
            alt: "ポートレート写真",
            width: 300,
            height: 400,
            href: "/test/images/1",
            title: "縦長の写真",
          },
          {
            id: "2",
            src: "https://placehold.jp/400x300.png",
            alt: "風景写真",
            width: 400,
            height: 300,
            href: "/test/images/2",
            title: "横長の風景",
          },
          {
            id: "3",
            src: "https://placehold.jp/300x300.png",
            alt: "スクエア写真",
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
