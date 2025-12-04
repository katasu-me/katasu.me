import { createFileRoute } from "@tanstack/react-router";
import { object, optional, parse, string } from "valibot";
import IconFlagFilled from "@/assets/icons/flag-filled.svg?react";
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
      <h1 className="col-start-2 pc:text-4xl text-2xl">
        <IconFlagFilled className="pc:size-12 size-8" />
        <span className="mt-4 pc:mt-6 block">投稿を報告</span>
      </h1>

      <ReportImageTallyForm />
    </>
  );
}
