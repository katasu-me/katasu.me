import { notFound } from "next/navigation";
import { fallback, object, parse, string } from "valibot";
import { fetchUserWithCache } from "@/actions/user";
import IconDots from "@/assets/icons/dots.svg";
import IconSearch from "@/assets/icons/search.svg";
import Header from "@/components/Header";
import IconButton from "@/components/IconButton";
import TagLinks from "@/components/Navigation/TagLinks";
import { GalleryViewSchema } from "@/features/gallery/components/GalleryView";
import UserPageContents from "./_components/UserPageContents";

const tags = [
  {
    name: "風景",
    userId: "test",
  },
  {
    name: "ポートレート",
    userId: "test",
  },
  {
    name: "空間",
    userId: "test",
  },
];

const searchParamsSchema = object({
  view: fallback(GalleryViewSchema, "masonry"),
  page: fallback(string(), "1"),
});

export default async function UserPage({ params, searchParams }: PageProps<"/user/[userid]">) {
  const { userid } = await params;

  const user = await fetchUserWithCache(userid);

  // ユーザーが存在しない場合は404
  if (!user) {
    notFound();
  }

  const { view, page: rawPage } = parse(searchParamsSchema, await searchParams);
  const currentPage = Number.parseInt(rawPage, 10);

  if (currentPage <= 0) {
    notFound();
  }

  return (
    <div className="col-span-full grid grid-cols-subgrid gap-y-12 py-16">
      <Header user={user}>
        <IconButton title="検索">
          <IconSearch className="h-6 w-6" />
        </IconButton>

        <IconButton title="その他">
          <IconDots className="h-6 w-6" />
        </IconButton>
      </Header>

      <div className="col-span-full grid grid-cols-subgrid gap-y-8">
        <TagLinks className="col-start-2" tags={tags} />
        <UserPageContents user={user} view={view} currentPage={currentPage} />
      </div>
    </div>
  );
}
