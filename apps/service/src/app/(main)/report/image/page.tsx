import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound } from "next/navigation";
import IconFlag from "@/assets/icons/flag.svg";
import { requireAuth } from "@/lib/auth";
import ReportImageTallyForm from "./_components/ReportImageTallyForm";

type PageProps = {
  searchParams: Promise<{
    reporterUserId?: string;
    imageId?: string;
  }>;
};

export default async function ReportImagePage({ searchParams }: PageProps) {
  const { env } = getCloudflareContext();
  await requireAuth(env.DB);

  const params = await searchParams;
  if (!params.reporterUserId || !params.imageId) {
    notFound();
  }

  return (
    <div className="col-span-full grid grid-cols-subgrid gap-y-12 py-16">
      <h1 className="col-start-2 flex items-center gap-2 pc:text-4xl text-2xl">
        <IconFlag className="size-8" />
        投稿を報告
      </h1>

      <ReportImageTallyForm />
    </div>
  );
}
