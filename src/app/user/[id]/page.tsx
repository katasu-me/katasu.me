import IconButton from "@/components/IconButton";
import ImageDropArea from "@/components/ImageDropArea";
import UserIcon from "@/components/UserIcon";
import styles from "./page.module.css";

export default function UserPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <UserIcon src="https://avatars.githubusercontent.com/u/44780846?v=4" alt="ユーザーアイコン">
          arrow2nd
        </UserIcon>

        <div className={styles.iconButtons}>
          <IconButton iconName="search" />
          <IconButton iconName="dots" />
        </div>
      </header>

      <ImageDropArea className={styles.dropArea} title="新しい画像を投稿する" />
    </main>
  );
}
