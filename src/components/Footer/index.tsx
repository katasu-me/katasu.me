import DevelopedBy from "./DevelopedBy";
import styles from "./index.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <DevelopedBy />

          <nav className={styles.nav}>
            <a href="/news" className={styles.navLink}>
              お知らせ
            </a>
            <a href="/terms" className={styles.navLink}>
              利用規約
            </a>
            <a href="/privacy" className={styles.navLink}>
              プライバシーポリシー
            </a>
          </nav>

          <p className={styles.copyright}>© katasu.me</p>
        </div>
      </div>
    </footer>
  );
}
