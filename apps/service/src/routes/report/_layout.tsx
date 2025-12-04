import { createFileRoute, Outlet } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import Footer from "@/components/Footer";
import { getUserSession } from "@/features/auth/libs/auth";

const reportLayoutLoaderFn = createServerFn().handler(async () => {
  const { session } = await getUserSession();
  return { sessionUserId: session?.user?.id };
});

export const Route = createFileRoute("/report/_layout")({
  component: ReportLayoutComponent,
  loader: async () => {
    return reportLayoutLoaderFn();
  },
});

function ReportLayoutComponent() {
  const { sessionUserId } = Route.useLoaderData();

  return (
    <div className="col-span-full grid grid-cols-subgrid gap-y-12 py-16">
      <Outlet />
      <Footer className="col-start-2" mode="logged-in-user" sessionUserId={sessionUserId} />
    </div>
  );
}
