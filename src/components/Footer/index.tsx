import Link from "../Link";
import DevelopedBy from "./DevelopedBy";

export default function Footer() {
  return (
    <footer className="mx-auto border-warm-black-25 border-t px-0 py-32 md:px-32">
      <div className="mx-auto max-w-xl">
        <div className="flex flex-col items-center justify-center gap-12">
          <DevelopedBy />

          <nav className="flex flex-col items-center gap-2 text-sm text-warm-black">
            <Link href="/news">お知らせ</Link>
            <Link href="/terms">利用規約</Link>
            <Link href="/privacy">プライバシーポリシー</Link>
          </nav>

          <p className="text-xs">© katasu.me</p>
        </div>
      </div>
    </footer>
  );
}
