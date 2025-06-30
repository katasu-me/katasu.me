import IconButton from "@/components/IconButton";
import ImageDropArea from "@/components/ImageDropArea";
import UserIcon from "@/components/UserIcon";

export default function UserPage() {
  return (
    <main className="flex flex-col gap-12 py-24">
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
    </main>
  );
}
