import { env } from "cloudflare:workers";
import { fetchTagsByUserId } from "@katasu.me/service-db";
import { createFileRoute, useLoaderData, useRouteContext } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import TagLinks from "@/components/TagLinks";
import ImageDropArea from "@/features/upload/components/ImageDropArea";
import { CACHE_KEYS, getCached } from "@/libs/cache";

const cachedFetchTagsByUsage = async (userId: string) => {
  const key = CACHE_KEYS.userTagsByUsage(userId);

  const result = await getCached(env.CACHE_KV, key, async () => {
    return fetchTagsByUserId(env.DB, userId, {
      order: "usage",
    });
  });

  console.log(key, result);

  if (!result.success || result.data.length <= 0) {
    return;
  }

  return result.data;
};

const loaderFn = createServerFn()
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }) => {
    const tags = await cachedFetchTagsByUsage(data.userId);
    return {
      tags,
    };
  });

export const Route = createFileRoute("/user/_layout/$userId/")({
  component: RouteComponent,
  loaderDeps: ({ search: { view, page } }) => ({ view, page }),
  loader: async ({ params, deps }) => {
    return loaderFn({
      data: {
        userId: params.userId,
      },
    });
  },
});

function RouteComponent() {
  const { session, user, userTotalImageCount } = useRouteContext({ from: "/user/_layout/$userId" });
  const { tags } = useLoaderData({ from: "/user/_layout/$userId/" });

  const isOwner = session?.user.id === user.id;

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

      {/* <Suspense fallback={<Loading className="col-start-2 py-16" />}> */}
      {/*   <UserPageContents user={user} view={view} currentPage={currentPage} /> */}
      {/* </Suspense> */}
    </div>
  );
}
