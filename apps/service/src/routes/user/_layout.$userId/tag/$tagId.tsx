import { useSuspenseQuery } from "@tanstack/react-query";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { fallback, number, object, parse } from "valibot";
import { Loading } from "@/components/Loading";
import Message from "@/components/Message";
import GalleryMasonry from "@/features/gallery/components/GalleryMasonry";
import GalleryRandom from "@/features/gallery/components/GalleryRandom";
import { ERROR_MESSAGE } from "@/features/gallery/constants/error";
import { toFrameImageProps } from "@/features/gallery/libs/convert";
import { GalleryViewSchema } from "@/features/gallery/schemas/view";
import { tagPageQueryOptions } from "@/features/gallery/server-fn/tag-page";
import { userImageCountQueryOptions } from "@/features/gallery/server-fn/user-image-count";
import ImageDropArea from "@/features/image-upload/components/ImageDropArea";
import { generateMetadata } from "@/libs/meta";
import { getUserAvatarUrl } from "@/libs/r2";

const searchParamsSchema = object({
  view: fallback(GalleryViewSchema, "timeline"),
  page: fallback(number(), 1),
});

export const Route = createFileRoute("/user/_layout/$userId/tag/$tagId")({
  component: RouteComponent,
  pendingComponent: () => {
    return <Loading className="col-start-2 h-[80vh]" />;
  },
  errorComponent: ({ error }) => {
    return <Message message={error.message || ERROR_MESSAGE.IMAGE_FETCH_FAILED} icon="error" />;
  },
  validateSearch: (search) => parse(searchParamsSchema, search),
  loaderDeps: ({ search: { view, page } }) => ({ view, page }),
  loader: async ({ params, deps, context }) => {
    const tagPageOptions = tagPageQueryOptions({
      view: deps.view,
      userId: params.userId,
      tagId: params.tagId,
      page: deps.page,
    });

    const [loaderData] = await Promise.all([
      context.queryClient.ensureQueryData(tagPageOptions),
      context.queryClient.ensureQueryData(userImageCountQueryOptions(params.userId)),
    ]);

    return {
      ...loaderData,
      user: context.user,
      sessionUserId: context.sessionUserId,
    };
  },
  head: ({ match, loaderData }) => {
    if (!loaderData) {
      return {};
    }

    const user = match.context.user;
    const { tag } = loaderData;

    return {
      meta: generateMetadata({
        pageTitle: `#${tag.name} - ${user.name}`,
        imageUrl: getUserAvatarUrl(user.id),
        twitterCard: "summary",
        path: `/user/${user.id}/tag/${tag.id}`,
        noindex: true,
      }),
    };
  },
});

function RouteComponent() {
  const { user, sessionUserId } = Route.useLoaderData();
  const { view, page } = Route.useSearch();
  const { tagId } = Route.useParams();

  const { data } = useSuspenseQuery(
    tagPageQueryOptions({
      view,
      userId: user.id,
      tagId,
      page,
    }),
  );
  const { data: userTotalImageCount } = useSuspenseQuery(userImageCountQueryOptions(user.id));

  const { tag, images, tagTotalImageCount } = data;
  const isOwner = user.id === sessionUserId;
  const frameImages = images ? images.map((image) => toFrameImageProps(image)) : [];

  return (
    <>
      <h1 className="col-start-2 text-4xl">{`#${tag.name}`}</h1>

      <div className="col-span-full grid grid-cols-subgrid gap-y-8">
        {isOwner && (
          <div className="col-start-2">
            <ImageDropArea
              title="あたらしい画像を投稿する"
              counter={{
                total: userTotalImageCount,
                max: user.plan.maxPhotos,
              }}
              defaultTags={[tag.name]}
            />
          </div>
        )}

        {view === "timeline" ? (
          <GalleryMasonry
            images={frameImages}
            className="col-start-2"
            totalImageCount={tagTotalImageCount ?? 0}
            currentPage={page}
          />
        ) : (
          <ClientOnly fallback={<Loading className="col-start-2 h-[50vh]" />}>
            <GalleryRandom
              fetchOptions={{
                type: "tag",
                tagId: tag.id,
              }}
            />
          </ClientOnly>
        )}
      </div>
    </>
  );
}
