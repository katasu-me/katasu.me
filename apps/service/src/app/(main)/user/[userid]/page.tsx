import { type GetImagesByUserIdOptions, getImagesByUserId } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { fallback, object, parse } from "valibot";
import { fetchUserWithCache } from "@/actions/user";
import IconDots from "@/assets/icons/dots.svg";
import IconSearch from "@/assets/icons/search.svg";
import EmptyState from "@/components/EmptyState";
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

const cachedGetImagesByUserId = async (userId: string, options: GetImagesByUserIdOptions) => {
  "use cache";

  cacheTag(`user/${userId}`);

  const { env } = getCloudflareContext();

  return getImagesByUserId(env.DB, userId, options);
};

export default async function UserPage({ params, searchParams }: PageProps<"/user/[userid]">) {
  const { userid } = await params;

  const user = await fetchUserWithCache(userid);

  // ユーザーが存在しない場合は404
  if (!user) {
    notFound();
  }

  const { view } = parse(searchParamsSchema, await searchParams);

  const fetchUserImagesResult = await cachedGetImagesByUserId(userid, {
    offset: 0,
    order: "desc",
  });

  if (!fetchUserImagesResult.success) {
    console.error("Failed to fetch images:", fetchUserImagesResult.error);
    notFound(); // FIXME: 500を返す
  }

  const images = fetchUserImagesResult.data.map((image) => toFrameImageProps(image, userid));

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

        {images.length > 0 ? (
          <GalleryView view={view} images={images} />
        ) : (
          <EmptyState className="col-start-2" message="からっぽです" />
        )}
      </div>
    </div>
  );
}
