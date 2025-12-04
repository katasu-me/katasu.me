import type { Tag } from "@katasu.me/service-db";
import { Link } from "@tanstack/react-router";
import BudouX from "@/components/BudouX";

type Props = Pick<Tag, "id" | "name" | "userId">;

export default function TagLink({ id, name, userId }: Props) {
  return (
    <Link
      className="interactive-scale-brightness relative flex h-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-warm-black px-4 py-2 text-center text-warm-white text-xs"
      to="/user/$userId/tag/$tagId"
      params={{
        userId,
        tagId: id,
      }}
      search={{
        view: "timeline",
        page: 1,
      }}
    >
      <BudouX>{`#${name}`}</BudouX>
    </Link>
  );
}
