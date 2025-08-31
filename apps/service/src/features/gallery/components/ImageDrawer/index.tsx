import { useState } from "react";
import Button from "@/shared/components/Button";
import Drawer from "@/shared/components/Drawer";
import Input from "@/shared/components/Input";
import TagInput from "@/shared/components/TagInput";
import FrameImage from "../FrameImage";

export default function ImageDrawer() {
  const [title, setTitle] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  return (
    <Drawer title="投稿する" open>
      {({ Description }) => (
        <>
          <Description hidden>新しい画像を投稿するフォーム</Description>
          {/* 画像のプレビュー */}
          <FrameImage
            src="/dummy/b.avif"
            width={2560}
            height={1440}
            alt="画像のプレビュー"
            className="mx-auto mb-4 h-48 pc:w-auto w-full rotate-[1deg]"
          />

          <form>
            {/** biome-ignore lint/correctness/useUniqueElementIds: 画面に複数でないので */}
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

            {/** biome-ignore lint/correctness/useUniqueElementIds: 画面に複数でないので */}
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
        </>
      )}
    </Drawer>
  );
}
