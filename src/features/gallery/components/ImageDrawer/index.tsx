/** biome-ignore-all lint/nursery/useUniqueElementIds: 画面に複数出るドロワーではないため */
import { useState } from "react";
import { Drawer } from "vaul";
import Button from "@/shared/components/Button";
import Input from "@/shared/components/Input";
import TagInput from "@/shared/components/TagInput";
import FrameImage from "../FrameImage";

export default function ImageDrawer() {
  const [title, setTitle] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  return (
    <Drawer.Root open>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="fixed right-0 bottom-0 left-0 h-fit rounded-t-xl bg-warm-white p-8 pc:px-4 pt-4 outline-none">
          <Drawer.Handle />
          <div className="mx-auto mt-4 max-w-md">
            <Drawer.Title className="mb-4 text-warm-black text-xl ">投稿する</Drawer.Title>

            {/* 画像のプレビュー */}
            <FrameImage
              src="/dummy/b.avif"
              width={2560}
              height={1440}
              alt="画像のプレビュー"
              className="mx-auto mb-4 h-48 w-auto rotate-[1deg]"
            />

            <form>
              <Input
                id="image-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="タイトルを入力"
                maxLength={100}
                currentLength={title.length}
                label={
                  <>
                    タイトル
                    <span className="text-warm-black text-xs">（なくてもいいよ）</span>
                  </>
                }
              />

              <TagInput
                suggestTags={["風景", "旅行", "食べ物", "動物", "建築", "アート", "自然", "ポートレート"]}
                tags={selectedTags}
                onChange={setSelectedTags}
                placeholder="タグを追加"
                id="image-tags"
              />

              <Button type="submit" className="mt-8 w-full" variant="fill">
                投稿
              </Button>
            </form>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
