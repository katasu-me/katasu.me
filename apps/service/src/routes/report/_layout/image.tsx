import { createFileRoute } from "@tanstack/react-router";
import { object, optional, parse, string } from "valibot";
import IconFlag from "@/assets/icons/flag.svg?react";
import Message from "@/components/Message";
import ReportImageTallyForm from "@/features/report/components/ReportImageTallyForm";
import { generateMetadata } from "@/libs/meta";

const searchParamsSchema = object({
  imageId: string(),
  reporterUserId: optional(string()),
});

export const Route = createFileRoute("/report/_layout/image")({
  component: RouteComponent,
  errorComponent: ({ error }) => {
    return <Message message={error.message} icon="error" />;
  },
  validateSearch: (search) => parse(searchParamsSchema, search),
  head: () => {
    return {
      meta: generateMetadata({
        pageTitle: "投稿を報告",
        noindex: true,
      }),
      scripts: [
        {
          src: "https://tally.so/widgets/embed.js",
        },
      ],
    };
  },
});

function RouteComponent() {
  return (
    <>
      <h1 className="col-start-2 flex items-center gap-2 pc:text-4xl text-2xl">
        <IconFlag className="pc:size-8 size-6" />
        投稿を報告
      </h1>

      <ReportImageTallyForm />
    </>
  );
}
