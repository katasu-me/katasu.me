import Link from "../Link";
import DevelopedBy from "./DevelopedBy";
import styles from "./index.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <DevelopedBy />

          <nav className={styles.nav}>
            <Link href="/news">お知らせ</Link>
            <Link href="/terms">利用規約</Link>
            <Link href="/privacy">プライバシーポリシー</Link>
          </nav>

          <p className={styles.copyright}>© katasu.me</p>
        </div>
      </div>
    </footer>
  );
}
