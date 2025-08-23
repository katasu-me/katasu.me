import { Drawer } from "vaul";
import Button from "@/shared/components/Button";
import FrameImage from "../FrameImage";

export default function ImageDrawer() {
  return (
    <Drawer.Root open>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="fixed right-0 bottom-0 left-0 h-fit rounded-t-xl bg-warm-white pc:px-4 px-8 py-4 outline-none">
          <Drawer.Handle />
          <div className="mx-auto mt-4 max-w-md">
            <Drawer.Title className="mb-4 text-warm-black text-xl ">投稿する</Drawer.Title>

            {/* 画像のプレビュー */}
            <FrameImage
              src="/dummy/b.avif"
              width={2560}
              height={1440}
              alt="画像のプレビュー"
              className="mx-auto mb-4 h-48 w-auto"
            />

            <form>
              <div className="mb-4">
                <label className="mb-1 block font-medium text-sm text-warm-black" htmlFor="image-title">
                  タイトル
                  <span className="text-warm-black text-xs">（なくてもいいよ）</span>
                </label>
                {/** biome-ignore lint/nursery/useUniqueElementIds: このドロワーは常に1つしか表示されないため */}
                <input
                  id="image-title"
                  type="text"
                  className="w-full rounded-md border border-warm-black-50 px-3 py-2 text-warm-black focus:border-warm-black focus:outline-none"
                  placeholder="タイトルを入力"
                />
              </div>

              <Button type="submit" className="mb-4 w-full" variant="fill" disabled>
                投稿
              </Button>
            </form>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
