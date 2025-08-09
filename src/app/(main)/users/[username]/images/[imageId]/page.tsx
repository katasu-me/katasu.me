import FrameImage from "@/features/gallery/components/FrameImage";
import UserIcon from "@/features/user/components/UserIcon";

export default function ImagesPage() {
  // TODO: 実際はAPIから画像データを取得する
  const image = {
    src: "/dummy/b.avif",
    alt: "画像",
    width: 2560,
    height: 1440,
    label: "横長の風景",
  };

  return (
    <div className="col-span-full grid grid-cols-subgrid gap-y-12 py-16">
      <header className="col-start-2 flex items-center justify-between">
        <UserIcon name="arrow2nd" src="https://avatars.githubusercontent.com/u/44780846?v=4" alt="ユーザーアイコン" />
      </header>

      <div className="col-span-full flex flex-col items-center gap-8 text-center">
        <FrameImage {...image} className="h-auto w-3xl" disableHoverEffect />
        <h2>{image.label}</h2>
      </div>
    </div>
  );
}
