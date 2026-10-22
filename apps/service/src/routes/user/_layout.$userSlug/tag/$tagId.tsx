import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useCanGoBack, useRouter } from "@tanstack/react-router";
import { css } from "styled-system/css";
import { fallback, number, object, optional, parse, string } from "valibot";
import Message from "@/components/Message";
import GalleryMasonry from "@/features/gallery/components/GalleryMasonry";
import { GALLERY_ERROR_MESSAGE } from "@/features/gallery/constants/error";
import { toFrameImageProps } from "@/features/gallery/libs/convert";
import { processingRefetchInterval } from "@/features/gallery/libs/polling";
import { GalleryViewSchema } from "@/features/gallery/schemas/view";
import { tagPageQueryOptions } from "@/features/gallery/server-fn/tag-page";
import { userImageCountQueryOptions } from "@/features/gallery/server-fn/user-image-count";
import ImageViewDrawer from "@/features/image-view/components/ImageViewDrawer";
import { imagePageQueryOptions } from "@/features/image-view/server-fn/image-page";
import { generateMetadata } from "@/libs/meta";
import { getUserAvatarUrl } from "@/libs/r2";

const searchParamsSchema = object({
  view: fallback(GalleryViewSchema, "timeline"),
  page: fallback(number(), 1),
  image: optional(string()),
});

export const Route = createFileRoute("/user/_layout/$userSlug/tag/$tagId")({
  component: RouteComponent,
  errorComponent: ({ error }) => {
    const message = error instanceof Error ? error.message : undefined;
    return <Message message={message || GALLERY_ERROR_MESSAGE.IMAGE_FETCH_FAILED} icon="error" />;
  },
  validateSearch: (search) => parse(searchParamsSchema, search),
  loaderDeps: ({ search: { view, page, image } }) => ({ view, page, image }),
  loader: async ({ params, deps, context }) => {
    const isOwner = context.user.id === context.sessionUserId;
    const tagPageOptions = tagPageQueryOptions({
      // TODO: 2Dパンビュー実装時に view=random を置き換える
      view: "timeline",
      userId: context.user.id,
      tagId: params.tagId,
      page: deps.page,
    });

    const promises: Promise<unknown>[] = [
      context.queryClient.ensureQueryData(userImageCountQueryOptions(context.user.id, isOwner)),
    ];

    if (deps.image) {
      promises.push(context.queryClient.ensureQueryData(imagePageQueryOptions({ imageId: deps.image })));
    }

    const [loaderData] = await Promise.all([context.queryClient.ensureQueryData(tagPageOptions), ...promises]);

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
        path: `/user/${user.customUrl || user.id}/tag/${tag.id}`,
        noindex: true,
      }),
    };
  },
});

function RouteComponent() {
  const { user, sessionUserId } = Route.useLoaderData();
  const { page, image: openedImageId } = Route.useSearch();
  const { tagId } = Route.useParams();
  const navigate = Route.useNavigate();
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const isOwner = user.id === sessionUserId;

  const { data } = useSuspenseQuery({
    ...tagPageQueryOptions({
      // TODO: 2Dパンビュー実装時に view=random を置き換える
      view: "timeline",
      userId: user.id,
      tagId,
      page,
    }),
    refetchInterval: processingRefetchInterval(isOwner),
  });

  const { tag, images, tagTotalImageCount } = data;
  const userSlug = user.customUrl || user.id;
  const frameImages = images ? images.map((image) => toFrameImageProps(image, "thumbnail", userSlug)) : [];

  const handleCloseImage = () => {
    if (canGoBack) {
      router.history.back();
      return;
    }

    navigate({ search: (prev) => ({ ...prev, image: undefined }), replace: true });
  };

  return (
    <>
      <h1 className={css({ gridColumnStart: "2", fontSize: "4xl", lineHeight: "10" })}>{`#${tag.name}`}</h1>

      <div className={css({ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "subgrid", rowGap: "8" })}>
        <GalleryMasonry
          images={frameImages}
          cssProps={css.raw({ gridColumnStart: "2" })}
          totalImageCount={tagTotalImageCount ?? 0}
          currentPage={page}
        />

        {openedImageId && (
          <ImageViewDrawer
            imageId={openedImageId}
            userSlug={userSlug}
            sessionUserId={sessionUserId}
            onClose={handleCloseImage}
          />
        )}
      </div>
    </>
  );
}
