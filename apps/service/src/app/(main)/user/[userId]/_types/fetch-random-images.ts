export type FetchRandomImagesOptions =
  | {
      type: "user";
      userId: string;
    }
  | {
      type: "tag";
      tagId: string;
    };
