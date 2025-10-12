import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import SignUpForm from "@/features/auth/components/SignUpForm";
import { requireAuth } from "@/lib/auth";
import { generateMetadataTitle } from "@/lib/meta";

export const metadata: Metadata = generateMetadataTitle({
  pageTitle: "新規登録",
});

export default async function SignUpPage() {
  const { env } = await getCloudflareContext({
    async: true,
  });

  await requireAuth(env.DB);

  return (
    <div className="col-span-full grid min-h-[95vh] grid-cols-subgrid gap-y-12 py-16">
      <main className="col-start-2 flex items-center justify-center">
        <SignUpForm />
      </main>
    </div>
  );
}
