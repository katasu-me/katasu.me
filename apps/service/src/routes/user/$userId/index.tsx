import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export const Route = createFileRoute("/user/$userId/")({
  component: RouteComponent,
  loaderDeps: ({ search: { view, page } }) => ({ view, page }),
  loader: async ({ params, deps }) => {
    console.log("Search params loaded", deps);
    console.log("Loading user with ID:", params.userId);
    console.log("View:", deps.view);
    console.log("Page:", deps.page);
  },
});

function RouteComponent() {
  const { user, session } = useRouteContext({ from: "/user/$userId" });

  return (
    <div className="col-span-full grid grid-cols-subgrid gap-y-12 py-16">
      <Header user={user} rightMenu={session?.user?.id ? { loggedInUserId: session.user.id } : undefined} />

      <div className="col-span-full grid grid-cols-subgrid gap-y-8">
        {/* <Suspense fallback={<TagLinksSkeleton className="col-start-2" />}> */}
        {/*   <UserTagLinks className="col-start-2" userId={pageUserId} /> */}
        {/* </Suspense> */}

        {/* {isOwner && ( */}
        {/*   <ClientOnly> */}
        {/*     <UserImageDropArea userId={pageUserId} maxPhotos={user.plan.maxPhotos} /> */}
        {/*   </ClientOnly> */}
        {/* )} */}

        {/* <Suspense fallback={<Loading className="col-start-2 py-16" />}> */}
        {/*   <UserPageContents user={user} view={view} currentPage={currentPage} /> */}
        {/* </Suspense> */}
      </div>

      <Footer className="col-start-2" mode="logged-in-user" userId={session?.user?.id} />
    </div>
  );
}
