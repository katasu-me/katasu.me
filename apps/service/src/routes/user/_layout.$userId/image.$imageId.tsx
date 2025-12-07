import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { twMerge } from "tailwind-merge";
import IconFlag from "@/assets/icons/flag.svg?react";
import BudouX from "@/components/BudouX";
import IconButton from "@/components/IconButton";
import Message from "@/components/Message";
import { DEFAULT_IMAGE_TITLE } from "@/features/gallery/constants/page";
import { toFrameImageProps } from "@/features/gallery/libs/convert";
import RemoveButton from "@/features/image-delete/components/RemoveButton";
import EditButton from "@/features/image-edit/components/EditButton";
import BigImage from "@/features/image-view/components/BigImage";
import ShareButton from "@/features/image-view/components/ShareButton";
import { imagePageQueryOptions } from "@/features/image-view/server-fn/image-page";
import { generateMetadata } from "@/libs/meta";
import { getImageUrl } from "@/libs/r2";

export const Route = createFileRoute("/user/_layout/$userId/image/$imageId")({
  component: RouteComponent,
  errorComponent: ({ error }) => {
    return <Message message={error.message} icon="error" />;
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
    const username = match.context.user.name;

    const pageTitle = image.title ? `${image.title} - ${username}` : username;
    const description = image.tags.length > 0 ? image.tags.map((tag) => `#${tag.name}`).join(" ") : undefined;

    return {
      meta: generateMetadata({
        pageTitle,
        description,
        imageUrl: getImageUrl(image.userId, image.id),
        twitterCard: "summary_large_image",
        path: `/user/${image.userId}/image/${image.id}`,
        noindex: true,
      }),
    };
  },
});

function RouteComponent() {
  const { user, sessionUserId } = Route.useLoaderData();
  const { imageId } = Route.useParams();
  const { data } = useSuspenseQuery(imagePageQueryOptions({ imageId }));

  const { image } = data;
  const canEdit = sessionUserId === user.id;
  const isViolation = image.status === "moderation_violation";
  const isError = image.status === "error";
  const frameImageProps = toFrameImageProps(image, "original");

  const renderContent = () => {
    const errorMessage = isViolation
      ? "この投稿はガイドラインに違反しているため、非表示になりました"
      : isError
        ? "この投稿は処理中にエラーが発生したため、公開できませんでした"
        : null;

    if (errorMessage) {
      return (
        <div className="mt-8">
          <p className="mt-2 text-sm text-warm-black-50">
            <BudouX>{errorMessage}</BudouX>
          </p>
          {canEdit && <RemoveButton className="mx-auto mt-6" userId={user.id} imageId={image.id} />}
        </div>
      );
    }

    return (
      <>
        <h2 className={twMerge("mt-8 text-xl", !image.title && "text-warm-black-50")}>
          {image.title || DEFAULT_IMAGE_TITLE}
        </h2>

        {image.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {image.tags.map((tag) => (
              <Link
                key={tag.name}
                className="text-sm text-warm-black hover:underline"
                to="/user/$userId/tag/$tagId"
                params={{
                  userId: user.id,
                  tagId: tag.id,
                }}
                search={{
                  view: "timeline",
                  page: 1,
                }}
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-center gap-2">
          {!canEdit && (
            <IconButton asChild>
              <Link
                to="/report/image"
                search={{
                  imageId: image.id,
                  reporterUserId: sessionUserId,
                }}
                target="_blank"
                rel="noopener"
              >
                <IconFlag className="h-4 w-4" />
              </Link>
            </IconButton>
          )}

          <ShareButton title={image.title} userId={user.id} imageId={image.id} />
        </div>

        {canEdit && (
          <div className="mt-7 flex flex-col items-center justify-center gap-6">
            <div className="flex items-center gap-3">
              <EditButton imageId={image.id} title={image.title} tags={image.tags.map((tag) => tag.name)} />
              <RemoveButton userId={user.id} imageId={image.id} />
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="col-start-2 mx-auto w-full text-center">
      <BigImage {...frameImageProps} />
      {renderContent()}
    </div>
  );
}
