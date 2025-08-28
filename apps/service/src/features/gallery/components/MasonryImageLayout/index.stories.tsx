import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps } from "react";
import type FrameImage from "@/features/gallery/components/FrameImage";
import MasonryImageLayout from "./index";

const meta = {
  title: "Gallery/MasonryImageLayout",
  tags: ["autodocs"],
  component: MasonryImageLayout,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    images: {
      description: "表示する画像の配列",
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MasonryImageLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleImages: ComponentProps<typeof FrameImage>[] = [
  {
    id: "1",
    src: "https://placehold.jp/300x400.png",
    alt: "ポートレート画像",
    width: 300,
    height: 400,
    title: "縦長の画像",
  },
  {
    id: "2",
    src: "https://placehold.jp/400x300.png",
    alt: "風景画像",
    width: 400,
    height: 300,
    title: "横長の風景",
  },
  {
    id: "3",
    src: "https://placehold.jp/300x300.png",
    alt: "スクエア画像",
    width: 300,
    height: 300,
    linkParams: {
      userId: "test",
      imageId: "3",
    },
    title: "正方形",
  },
  {
    id: "4",
    src: "https://placehold.jp/280x500.png",
    alt: "縦長ポートレート",
    width: 280,
    height: 500,
  },
  {
    id: "5",
    src: "https://placehold.jp/250x350.png",
    alt: "小さなポートレート",
    width: 250,
    height: 350,
    title: "小さめの縦長",
  },
  {
    id: "6",
    src: "https://placehold.jp/450x250.png",
    alt: "パノラマ画像",
    width: 450,
    height: 250,
  },
  {
    id: "7",
    src: "https://placehold.jp/320x480.png",
    alt: "スマホ画像",
    width: 320,
    height: 480,
    title: "スマホサイズ",
  },
  {
    id: "8",
    src: "https://placehold.jp/350x350.png",
    alt: "アートワーク",
    width: 350,
    height: 350,
  },
  {
    id: "9",
    src: "https://placehold.jp/500x300.png",
    alt: "ワイド画像",
    width: 500,
    height: 300,
    title: "ワイドフォーマット",
  },
  {
    id: "10",
    src: "https://placehold.jp/200x600.png",
    alt: "バナー画像",
    width: 200,
    height: 600,
    title: "縦長バナー",
  },
  {
    id: "11",
    src: "https://placehold.jp/380x280.png",
    alt: "風景画像2",
    width: 380,
    height: 280,
  },
  {
    id: "12",
    src: "https://placehold.jp/600x200.png",
    alt: "パノラマ風景",
    width: 600,
    height: 200,
    title: "超ワイド",
  },
];

export const Default: Story = {
  args: {
    images: sampleImages,
    searchParams: {},
  },
};

export const PortraitGallery: Story = {
  args: {
    searchParams: {},
    images: [
      {
        id: "portrait1",
        src: "https://placehold.jp/300x400.png",
        alt: "ポートレート1",
        width: 300,
        height: 400,
        title: "モデル画像",
      },
      {
        id: "portrait2",
        src: "https://placehold.jp/250x350.png",
        alt: "ポートレート2",
        width: 250,
        height: 350,
        title: "プロフィール",
      },
      {
        id: "portrait3",
        src: "https://placehold.jp/320x480.png",
        alt: "ポートレート3",
        width: 320,
        height: 480,
        title: "縦長撮影",
      },
      {
        id: "portrait4",
        src: "https://placehold.jp/280x420.png",
        alt: "ポートレート4",
        width: 280,
        height: 420,
      },
      {
        id: "portrait5",
        src: "https://placehold.jp/300x450.png",
        alt: "ポートレート5",
        width: 300,
        height: 450,
        title: "アート画像",
      },
      {
        id: "portrait6",
        src: "https://placehold.jp/260x390.png",
        alt: "ポートレート6",
        width: 260,
        height: 390,
      },
    ],
  },
};

export const LandscapeGallery: Story = {
  args: {
    searchParams: {},
    images: [
      {
        id: "landscape1",
        src: "https://placehold.jp/500x300.png",
        alt: "風景1",
        width: 500,
        height: 300,
        title: "山の風景",
      },
      {
        id: "landscape2",
        src: "https://placehold.jp/600x200.png",
        alt: "風景2",
        width: 600,
        height: 200,
        title: "パノラマビュー",
      },
      {
        id: "landscape3",
        src: "https://placehold.jp/450x250.png",
        alt: "風景3",
        width: 450,
        height: 250,
        title: "海の景色",
      },
      {
        id: "landscape4",
        src: "https://placehold.jp/520x280.png",
        alt: "風景4",
        width: 520,
        height: 280,
      },
      {
        id: "landscape5",
        src: "https://placehold.jp/480x300.png",
        alt: "風景5",
        width: 480,
        height: 300,
        title: "都市の夜景",
      },
    ],
  },
};

export const MixedAspectRatios: Story = {
  args: {
    searchParams: {},
    images: [
      {
        id: "square1",
        src: "https://placehold.jp/300x300.png",
        alt: "正方形",
        width: 300,
        height: 300,
        title: "スクエア",
      },
      {
        id: "tall1",
        src: "https://placehold.jp/200x600.png",
        alt: "縦長",
        width: 200,
        height: 600,
        title: "縦長バナー",
      },
      {
        id: "wide1",
        src: "https://placehold.jp/600x150.png",
        alt: "横長",
        width: 600,
        height: 150,
        title: "ワイドバナー",
      },
      {
        id: "portrait1",
        src: "https://placehold.jp/320x480.png",
        alt: "ポートレート",
        width: 320,
        height: 480,
      },
      {
        id: "landscape1",
        src: "https://placehold.jp/480x320.png",
        alt: "ランドスケープ",
        width: 480,
        height: 320,
      },
      {
        id: "square2",
        src: "https://placehold.jp/250x250.png",
        alt: "小さな正方形",
        width: 250,
        height: 250,
        title: "小スクエア",
      },
    ],
  },
};

export const FewImages: Story = {
  args: {
    images: sampleImages.slice(0, 4),
    searchParams: {},
  },
};

export const WithPagination: Story = {
  args: {
    images: [...sampleImages, ...sampleImages, ...sampleImages], // 36枚の画像
    currentPage: 1,
    itemsPerPage: 12,
    searchParams: {},
  },
};

export const PaginationSecondPage: Story = {
  args: {
    images: [...sampleImages, ...sampleImages, ...sampleImages], // 36枚の画像
    currentPage: 2,
    itemsPerPage: 12,
    searchParams: {},
  },
};

export const PaginationLastPage: Story = {
  args: {
    images: [...sampleImages, ...sampleImages, ...sampleImages], // 36枚の画像
    currentPage: 3,
    itemsPerPage: 12,
    searchParams: {},
  },
};
