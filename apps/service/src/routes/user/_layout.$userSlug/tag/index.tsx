import { createFileRoute } from "@tanstack/react-router";
import Message from "@/components/Message";
import TagLink from "@/components/TagLinks/TabLink";
import { tagListPageLoaderFn } from "@/features/gallery/server-fn/tag-list-page";
import { generateMetadata } from "@/libs/meta";
import { getUserAvatarUrl } from "@/libs/r2";

export const Route = createFileRoute("/user/_layout/$userSlug/tag/")({
  component: RouteComponent,
  loader: async ({ params }) => {
    return tagListPageLoaderFn({
      data: {
        userId: params.userSlug,
      },
    });
  },
  head: ({ match }) => {
    const user = match.context.user;

    return {
      meta: generateMetadata({
        pageTitle: `すべてのタグ - ${user.name}`,
        imageUrl: getUserAvatarUrl(user.id),
        twitterCard: "summary",
        path: `/user/${user.id}/tag/`,
        noindex: true,
      }),
    };
  },
});

function RouteComponent() {
  const { allTags } = Route.useLoaderData();

  return (
    <>
      <h1 className="col-start-2 text-4xl">すべてのタグ</h1>

      {allTags.length > 0 ? (
        <div className="col-start-2 mx-auto flex min-h-48 w-full flex-wrap content-start items-start gap-2">
          {allTags.map((tag) => (
            <TagLink key={tag.id} {...tag} />
          ))}
        </div>
      ) : (
        <Message message="からっぽです" />
      )}
    </>
  );
}
