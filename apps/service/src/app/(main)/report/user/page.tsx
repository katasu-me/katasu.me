import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound } from "next/navigation";
import IconFlag from "@/assets/icons/flag.svg";
import { requireAuth } from "@/lib/auth";
import ReportUserTallyForm from "./_componnets/ReportUserTallyForm";

type PageProps = {
  searchParams: Promise<{
    reporterUserId?: string;
    reportedUserId?: string;
  }>;
};

export default async function ReportUserPage({ searchParams }: PageProps) {
  const { env } = getCloudflareContext();
  await requireAuth(env.DB);

  const params = await searchParams;
  if (!params.reporterUserId || !params.reportedUserId) {
    notFound();
  }

  return (
    <div className="col-span-full grid grid-cols-subgrid gap-y-12 py-16">
      <h1 className="col-start-2 flex items-center gap-2 pc:text-4xl text-2xl">
        <IconFlag className="pc:size-8 size-6" />
        ユーザーを報告
      </h1>

      <ReportUserTallyForm />
    </div>
  );
}
