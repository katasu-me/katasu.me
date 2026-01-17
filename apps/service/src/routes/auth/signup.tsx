import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Loading } from "@/components/Loading";
import SignUpForm from "@/features/auth/components/SignUpForm";
import { requireAuth } from "@/features/auth/libs/auth";
import { generateMetadata } from "@/libs/meta";

const signupPageBeforeLoadFn = createServerFn().handler(async () => {
  const { session } = await requireAuth();

  // 新規登録済ならマイページへリダイレクト
  if (session.user.name) {
    throw redirect({
      to: "/user/$userSlug",
      params: { userSlug: session.user.id },
      search: {
        view: "timeline",
        page: 1,
      },
    });
  }
});

export const Route = createFileRoute("/auth/signup")({
  component: RouteComponent,
  pendingComponent: () => <Loading className="col-start-2 h-screen" />,
  beforeLoad: async () => {
    return signupPageBeforeLoadFn();
  },
  head: () => {
    return {
      meta: generateMetadata({
        pageTitle: "新規登録",
        noindex: true,
      }),
    };
  },
});

function RouteComponent() {
  return (
    <div className="col-span-full grid min-h-[95vh] grid-cols-subgrid gap-y-12 py-16">
      <SignUpForm className="col-start-2 flex items-center justify-center" />
    </div>
  );
}
