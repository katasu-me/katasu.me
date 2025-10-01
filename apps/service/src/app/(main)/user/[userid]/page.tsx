import { getImagesByUserId } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound } from "next/navigation";
import { fallback, object, parse } from "valibot";
import { fetchUserWithCache } from "@/actions/user";
import IconDots from "@/assets/icons/dots.svg";
import IconSearch from "@/assets/icons/search.svg";
import Header from "@/components/Header";
import IconButton from "@/components/IconButton";
import TagLinks from "@/components/Navigation/TagLinks";
import GalleryView, { GalleryViewSchema } from "@/features/gallery/components/GalleryView";
import { toFrameImageProps } from "@/features/gallery/lib/convert";

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

const searchParamsSchema = object({
  view: fallback(GalleryViewSchema, "masonry"),
});

export default async function UserPage({ params, searchParams }: PageProps<"/user/[userid]">) {
  const { userid } = await params;

  const user = await fetchUserWithCache(userid);

  // ユーザーが存在しない場合は404
  if (!user) {
    notFound();
  }

  const { env } = getCloudflareContext();
  const { view } = parse(searchParamsSchema, await searchParams);

  // TODO: ここらへんを関数に切って 'use cache' でキャッシュしたい
  const getImagesResult = await getImagesByUserId(env.DB, userid, {
    offset: 0,
    order: "desc",
  });

  console.log(getImagesResult);

  if (!getImagesResult.success) {
    console.error("Failed to fetch images:", getImagesResult.error);
    notFound(); // FIXME: 500を返す
  }

  const images = getImagesResult.data.map((image) => toFrameImageProps(image, userid));

  // TODO: EnptyStateがないのでつくる

  return (
    <div className="col-span-full grid grid-cols-subgrid gap-y-12 py-16">
      <Header user={user}>
        <IconButton title="検索">
          <IconSearch className="h-6 w-6" />
        </IconButton>

        <IconButton title="その他">
          <IconDots className="h-6 w-6" />
        </IconButton>
      </Header>

      <div className="col-span-full grid grid-cols-subgrid gap-y-8">
        <TagLinks className="col-start-2" tags={tags} />
        <GalleryView view={view} images={images} />
      </div>
    </div>
  );
}
