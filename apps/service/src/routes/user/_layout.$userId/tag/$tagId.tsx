import { ClientOnly, createFileRoute, useLoaderData, useRouteContext, useSearch } from "@tanstack/react-router";
import { fallback, number, object, parse } from "valibot";
import { Loading } from "@/components/Loading";
import Message from "@/components/Message";
import TagLinks from "@/components/TagLinks";
import GalleryMasonry from "@/features/gallery/components/GalleryMasonry";
import GalleryRandom from "@/features/gallery/components/GalleryRandom";
import { ERROR_MESSAGE } from "@/features/gallery/constants/error";
import { toFrameImageProps } from "@/features/gallery/libs/convert";
import { GalleryViewSchema } from "@/features/gallery/schemas/view";
import { tagPageLoaderFn } from "@/features/gallery/server-fn/tag-page";
import ImageDropArea from "@/features/image-upload/components/ImageDropArea";

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
  loader: async ({ params, deps }) => {
    return tagPageLoaderFn({
      data: {
        view: deps.view,
        userId: params.userId,
        tagId: params.tagId,
        page: deps.page,
      },
    });
  },
});

function RouteComponent() {
  const { session, user, userTotalImageCount } = useRouteContext({ from: "/user/_layout/$userId" });
  const { view } = useSearch({ from: "/user/_layout/$userId/tag/$tagId" });
  const { tag, tags, images } = useLoaderData({ from: "/user/_layout/$userId/tag/$tagId" });

  const isOwner = session?.user.id === user.id;
  const frameImages = images ? images.map((image) => toFrameImageProps(image)) : [];

  return (
    <>
      <h1 className="col-start-2 text-4xl">{`#${tag.name}`}</h1>

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
              defaultTags={[tag.name]}
            />
          </div>
        )}

        {view === "timeline" ? (
          <GalleryMasonry images={frameImages} className="col-start-2" totalImageCount={userTotalImageCount} />
        ) : (
          <ClientOnly fallback={<Loading className="col-start-2 h-[50vh]" />}>
            <GalleryRandom
              initialImages={frameImages}
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
