import { env } from "cloudflare:workers";
import { fetchImagesByUserId, fetchTagsByUserId } from "@katasu.me/service-db";
import { createFileRoute, useLoaderData, useRouteContext } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Loading } from "@/components/Loading";
import Message from "@/components/Message";
import TagLinks from "@/components/TagLinks";
import GalleryMasonry from "@/features/gallery/components/GalleryMasonry";
import { GALLERY_PAGE_SIZE } from "@/features/gallery/constants/page";
import { toFrameImageProps } from "@/features/gallery/libs/convert";
import ImageDropArea from "@/features/upload/components/ImageDropArea";
import { CACHE_KEYS, getCached } from "@/libs/cache";

const cachedFetchTagsByUsage = async (userId: string) => {
  const key = CACHE_KEYS.userTagsByUsage(userId);

  const result = await getCached(env.CACHE_KV, key, async () => {
    return fetchTagsByUserId(env.DB, userId, {
      order: "usage",
    });
  });

  if (!result.success || result.data.length <= 0) {
    return;
  }

  return result.data;
};

const cachedFetchImagesByUserId = async (userId: string, offset: number) => {
  const key = CACHE_KEYS.userImages(userId);

  return getCached(env.CACHE_KV, key, async () => {
    return fetchImagesByUserId(env.DB, userId, {
      offset,
      order: "desc",
    });
  });
};

const loaderFn = createServerFn()
  .inputValidator((data: { userId: string; offset: number }) => data)
  .handler(async ({ data }) => {
    const [tags, imagesResult] = await Promise.all([
      cachedFetchTagsByUsage(data.userId),
      cachedFetchImagesByUserId(data.userId, data.offset), // TODO: random対応
    ]);

    if (!imagesResult.success) {
      console.error("[user/_layout.$userId] 画像の取得に失敗しました:", imagesResult.error);
      throw imagesResult.error;
    }

    return {
      tags,
      images: imagesResult.data,
    };
  });

export const Route = createFileRoute("/user/_layout/$userId/")({
  component: RouteComponent,
  pendingComponent: () => <Loading className="col-start-2 py-16" />, // TODO: 仮
  errorComponent: () => <Message message="画像の取得に失敗しました" icon="error" />,
  loaderDeps: ({ search: { view, page } }) => ({ view, page }),
  loader: async ({ params, deps, context }) => {
    const rawOffset = GALLERY_PAGE_SIZE * (deps.page - 1);

    return loaderFn({
      data: {
        userId: params.userId,
        offset: context.userTotalImageCount < rawOffset ? 0 : rawOffset,
      },
    });
  },
});

function RouteComponent() {
  const { session, user, userTotalImageCount } = useRouteContext({ from: "/user/_layout/$userId" });
  const { tags, images } = useLoaderData({ from: "/user/_layout/$userId/" });

  const isOwner = session?.user.id === user.id;
  const frameImages = images.map((image) => toFrameImageProps(image, user.id));

  return (
    <div className="col-span-full grid grid-cols-subgrid gap-y-8">
      {tags && <TagLinks className="col-start-2" tags={tags} userId={user.id} />}

      {isOwner && (
        <div className="col-start-2">
          <ImageDropArea
            title="あたらしい画像を投稿する"
            counter={{
              total: userTotalImageCount,
              max: user.plan.maxPhotos,
            }}
          />
        </div>
      )}

      <GalleryMasonry images={frameImages} className="col-start-2" totalImageCount={userTotalImageCount} />
    </div>
  );
}
