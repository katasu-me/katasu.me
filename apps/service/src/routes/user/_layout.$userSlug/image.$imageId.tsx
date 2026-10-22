import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { css } from "styled-system/css";
import Message from "@/components/Message";
import { GALLERY_ERROR_MESSAGE } from "@/features/gallery/constants/error";
import ImageDetail from "@/features/image-view/components/ImageDetail";
import { imagePageQueryOptions } from "@/features/image-view/server-fn/image-page";
import { generateMetadata } from "@/libs/meta";
import { getImageUrl } from "@/libs/r2";

export const Route = createFileRoute("/user/_layout/$userSlug/image/$imageId")({
  component: RouteComponent,
  errorComponent: ({ error }) => {
    return (
      <Message
        message={error instanceof Error ? error.message : GALLERY_ERROR_MESSAGE.IMAGE_FETCH_FAILED}
        icon="error"
      />
    );
  },
  loader: async ({ params, context }) => {
    const loaderData = await context.queryClient.ensureQueryData(
      imagePageQueryOptions({
        imageId: params.imageId,
      }),
    );

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

    const { image } = loaderData;
    const user = match.context.user;

    const pageTitle = image.title ? `${image.title} - ${user.name}` : user.name;
    const description = image.tags.length > 0 ? image.tags.map((tag) => `#${tag.name}`).join(" ") : undefined;

    return {
      meta: generateMetadata({
        pageTitle,
        description,
        imageUrl: getImageUrl(image.userId, image.id, "original"),
        twitterCard: "summary_large_image",
        path: `/user/${user.customUrl || user.id}/image/${image.id}`,
        noindex: true,
      }),
    };
  },
});

function RouteComponent() {
  const { user, sessionUserId } = Route.useLoaderData();
  const { imageId } = Route.useParams();
  const { data } = useSuspenseQuery(imagePageQueryOptions({ imageId }));
  const userSlug = user.customUrl || user.id;

  return (
    <div className={css({ gridColumnStart: "2" })}>
      <ImageDetail image={data.image} userSlug={userSlug} sessionUserId={sessionUserId} />
    </div>
  );
}
