import { Drawer } from "vaul";

export default function ImageDrawer() {
  return (
    <Drawer.Root open>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content>
          <Drawer.Handle />
          <Drawer.Title>画像を投稿する</Drawer.Title>
          <Drawer.Description />
          <Drawer.Close />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
