import Link from "next/link";
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

    tags: [
      {
        name: "風景",
        href: "/users/a/tags/landscape",
      },
      {
        name: "横長",
        href: "/users/a/tags/wide",
      },
      {
        name: "自然",
        href: "/users/a/tags/nature",
      },
    ],
  };

  return (
    <div className="col-span-full grid grid-cols-subgrid gap-y-12 py-16">
      <header className="col-start-2 flex items-center justify-between">
        <UserIcon name="arrow2nd" src="https://avatars.githubusercontent.com/u/44780846?v=4" alt="ユーザーアイコン" />
      </header>

      <div className="col-start-2 mx-auto w-full">
        <FrameImage {...image} className="h-auto w-full " disableHoverEffect />
        <h2 className="mt-8">{image.label}</h2>
        <div>
          {image.tags.map((tag) => (
            <Link
              key={tag.name}
              href={tag.href}
              className="mr-2 inline-block rounded bg-gray-200 px-3 py-1 text-gray-700 text-sm hover:bg-gray-300"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
