// import type { PublicUserData } from "@katasu.me/service-db";
// import Message from "@/components/Message";
// import type { GalleryView } from "../../schemas/view";
// import GalleryMasonry from "../GalleryMasonry";
//
// type Props = {
//   user: PublicUserData;
//   view: GalleryView;
//   totalImageCount: number;
//   currentPage?: number;
// };
//
// export default function UserPageContents({ user, view, totalImageCount, currentPage = 1 }: Props) {
//   // 0枚ならからっぽ
//   if (totalImageCount <= 0) {
//     return <Message message="からっぽです" />;
//   }
//
//   // if (view === "random") {
//   //   return (
//   //     <GalleryRandom
//   //       fetchRandomOptions={{
//   //         type: "user",
//   //         userId: user.id,
//   //       }}
//   //     />
//   //   );
//   // }
//
//   // TODO: これはサーバー側に移す
//   // const offset = GALLERY_PAGE_SIZE * (currentPage - 1);
//   // if (totalImageCount < offset) {
//   //   throw notFound();
//   // }
//
//   // 画像を取得
//   // const fetchUserImagesResult = await fetchImagesByUserId(env.DB, user.id, {
//   //   offset,
//   //   order: "desc",
//   // });
//
//   // if (!fetchUserImagesResult.success) {
//   //   console.error("[page] 画像の取得に失敗しました:", fetchUserImagesResult.error);
//   //   return <Message message="画像の取得に失敗しました" icon="error" />;
//   // }
//
//   // const images = fetchUserImagesResult.data.map((image) => toFrameImageProps(image, user.id));
//
//   return (
//     <GalleryMasonry
//       className="col-start-2"
//       images={images}
//       totalImageCount={totalImageCount}
//       currentPage={currentPage}
//     />
//   );
// }
