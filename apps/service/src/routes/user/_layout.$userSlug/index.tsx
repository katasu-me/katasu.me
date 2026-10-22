import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useCanGoBack, useRouter } from "@tanstack/react-router";
import { css } from "styled-system/css";
import { fallback, number, object, optional, parse, string } from "valibot";
import Message from "@/components/Message";
import TagLinks from "@/components/TagLinks";
import GalleryMasonry from "@/features/gallery/components/GalleryMasonry";
import { GALLERY_ERROR_MESSAGE } from "@/features/gallery/constants/error";
import { toFrameImageProps } from "@/features/gallery/libs/convert";
import { processingRefetchInterval } from "@/features/gallery/libs/polling";
import { GalleryViewSchema } from "@/features/gallery/schemas/view";
import { userImageCountQueryOptions } from "@/features/gallery/server-fn/user-image-count";
import { userPageQueryOptions } from "@/features/gallery/server-fn/user-page";
import ImageViewDrawer from "@/features/image-view/components/ImageViewDrawer";
import { imagePageQueryOptions } from "@/features/image-view/server-fn/image-page";
import { generateMetadata } from "@/libs/meta";
import { getUserAvatarUrl } from "@/libs/r2";

const searchParamsSchema = object({
  view: fallback(GalleryViewSchema, "timeline"),
  page: fallback(number(), 1),
  image: optional(string()),
});

export const Route = createFileRoute("/user/_layout/$userSlug/")({
  component: RouteComponent,
  errorComponent: ({ error }) => {
    const message = error instanceof Error ? error.message : undefined;
    return <Message message={message ?? GALLERY_ERROR_MESSAGE.IMAGE_FETCH_FAILED} icon="error" />;
  },
  validateSearch: (search) => parse(searchParamsSchema, search),
  loaderDeps: ({ search: { view, page, image } }) => ({ view, page, image }),
  loader: async ({ deps, context }) => {
    const isOwner = context.user.id === context.sessionUserId;
    const promises: Promise<unknown>[] = [
      context.queryClient.ensureQueryData(
        userPageQueryOptions({
          // TODO: 2Dパンビュー実装時に view=random を置き換える
          view: "timeline",
          userId: context.user.id,
          page: deps.page,
        }),
      ),
      context.queryClient.ensureQueryData(userImageCountQueryOptions(context.user.id, isOwner)),
    ];

    if (deps.image) {
      promises.push(context.queryClient.ensureQueryData(imagePageQueryOptions({ imageId: deps.image })));
    }

    await Promise.all(promises);

    return {
      user: context.user,
      sessionUserId: context.sessionUserId,
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
        path: `/user/${user.customUrl || user.id}`,
        noindex: false,
      }),
    };
  },
});

function RouteComponent() {
  const { user, sessionUserId } = Route.useLoaderData();
  const { page, image: openedImageId } = Route.useSearch();
  const navigate = Route.useNavigate();
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const isOwner = user.id === sessionUserId;

  const { data } = useSuspenseQuery({
    ...userPageQueryOptions({
      // TODO: 2Dパンビュー実装時に view=random を置き換える
      view: "timeline",
      userId: user.id,
      page,
    }),
    refetchInterval: processingRefetchInterval(isOwner),
  });
  const { data: totalImageCount } = useSuspenseQuery(userImageCountQueryOptions(user.id, isOwner));
  const userSlug = user.customUrl || user.id;
  const frameImages = data.images ? data.images.map((image) => toFrameImageProps(image, "thumbnail", userSlug)) : [];

  const handleCloseImage = () => {
    if (canGoBack) {
      router.history.back();
      return;
    }

    navigate({ search: (prev) => ({ ...prev, image: undefined }), replace: true });
  };

  return (
    <div className={css({ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "subgrid", rowGap: "8" })}>
      {data.tags && <TagLinks cssProps={css.raw({ gridColumnStart: "2" })} tags={data.tags} userSlug={userSlug} />}

      <GalleryMasonry
        cssProps={css.raw({ gridColumnStart: "2" })}
        images={frameImages}
        totalImageCount={totalImageCount}
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
  );
}
