import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { PropsWithChildren } from "react";
import Footer from "@/components/Footer";
import { getUserSession } from "@/lib/auth";

export default async function Layout({ children }: PropsWithChildren) {
  const { env } = getCloudflareContext();
  const { session } = await getUserSession(env.DB);

  return (
    <>
      {children}
      <Footer className="col-start-2" mode="logged-in-user" userId={session?.user?.id} />
    </>
  );
}
