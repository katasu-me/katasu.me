import ImageNeko from "@/assets/images/neko.png";

import { AUTHOR_NAME, AUTHOR_X_URL } from "@/constants/author";
import styles from "./index.module.css";

export default function DevelopedBy() {
  return (
    <div className={styles.developedBy}>
      <div className={styles.label}>\ わたしがつくっています /</div>
      <a href={AUTHOR_X_URL} target="_blank" rel="noopener noreferrer" className={styles.link}>
        <img className={styles.icon} src={ImageNeko.src} alt={`${AUTHOR_NAME}のアイコン`} />
      </a>
    </div>
  );
}
