import UserIcon from "@/features/user/components/UserIcon";

export default function ImagesPage() {
  return (
    <div className="col-span-full grid grid-cols-subgrid gap-y-12 py-16">
      <header className="col-start-2 flex items-center justify-between">
        <UserIcon name="arrow2nd" src="https://avatars.githubusercontent.com/u/44780846?v=4" alt="ユーザーアイコン" />
      </header>

      <div className="col-span-full text-center">
        <h1 className="mb-4 font-bold text-2xl">画像ページ</h1>
        <p className="text-gray-600">ここに画像を表示します。</p>
      </div>
    </div>
  );
}
