import { useSuspenseQuery } from "@tanstack/react-query";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { fallback, number, object, parse } from "valibot";
import { Loading } from "@/components/Loading";
import Message from "@/components/Message";
import TagLinks from "@/components/TagLinks";
import GalleryMasonry from "@/features/gallery/components/GalleryMasonry";
import GalleryRandom from "@/features/gallery/components/GalleryRandom";
import { ERROR_MESSAGE } from "@/features/gallery/constants/error";
import { toFrameImageProps } from "@/features/gallery/libs/convert";
import { GalleryViewSchema } from "@/features/gallery/schemas/view";
import { userImageCountQueryOptions } from "@/features/gallery/server-fn/user-image-count";
import { userPageQueryOptions } from "@/features/gallery/server-fn/user-page";
import ImageDropArea from "@/features/image-upload/components/ImageDropArea";
import { generateMetadata } from "@/libs/meta";
import { getUserAvatarUrl } from "@/libs/r2";

const searchParamsSchema = object({
  view: fallback(GalleryViewSchema, "timeline"),
  page: fallback(number(), 1),
});

export const Route = createFileRoute("/user/_layout/$userId/")({
  component: RouteComponent,
  pendingComponent: () => {
    return <Loading className="col-start-2 h-[80vh]" />;
  },
  errorComponent: ({ error }) => {
    return <Message message={error.message ?? ERROR_MESSAGE.IMAGE_FETCH_FAILED} icon="error" />;
  },
  validateSearch: (search) => parse(searchParamsSchema, search),
  loaderDeps: ({ search: { view, page } }) => ({ view, page }),
  loader: async ({ params, deps, context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        userPageQueryOptions({
          view: deps.view,
          userId: params.userId,
          page: deps.page,
        }),
      ),
      context.queryClient.ensureQueryData(userImageCountQueryOptions(params.userId)),
    ]);

    return {
      user: context.user,
      isOwner: context.isOwner,
    };
  },
  head: ({ match }) => {
    const { user } = match.context;
    const imageUrl = user.hasAvatar ? getUserAvatarUrl(user.id, user.avatarSetAt) : undefined;

    return {
      meta: generateMetadata({
        pageTitle: user.name,
        imageUrl,
        twitterCard: "summary",
        path: `/user/${user.id}`,
        noindex: false, // ユーザーページはインデックスする
      }),
    };
  },
});

function RouteComponent() {
  const { user, isOwner } = Route.useLoaderData();
  const { view, page } = Route.useSearch();

  const { data } = useSuspenseQuery(
    userPageQueryOptions({
      view,
      userId: user.id,
      page,
    }),
  );
  const { data: totalImageCount } = useSuspenseQuery(userImageCountQueryOptions(user.id));

  const frameImages = data.images ? data.images.map((image) => toFrameImageProps(image)) : [];

  return (
    <div className="col-span-full grid grid-cols-subgrid gap-y-8">
      {data.tags && <TagLinks className="col-start-2" tags={data.tags} userId={user.id} />}

      {isOwner && (
        <div className="col-start-2">
          <ImageDropArea
            title="あたらしい画像を投稿する"
            counter={{
              total: totalImageCount,
              max: user.plan.maxPhotos,
            }}
          />
        </div>
      )}

      {view === "timeline" ? (
        <GalleryMasonry
          className="col-start-2"
          images={frameImages}
          totalImageCount={totalImageCount}
          currentPage={page}
        />
      ) : (
        <ClientOnly fallback={<Loading className="col-start-2 h-[50vh]" />}>
          <GalleryRandom
            fetchOptions={{
              type: "user",
              userId: user.id,
            }}
          />
        </ClientOnly>
      )}
    </div>
  );
}
