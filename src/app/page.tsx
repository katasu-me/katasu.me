import LogoImage from "@/assets/logo.svg";
import Button from "@/components/Button";
import Footer from "@/components/Footer";

import BudouX from "@/components/BudouX";
import { SITE_NAME } from "@/constants/site";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main>
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <LogoImage className={styles.logo} />
          <h1 className={styles.title}>
            インターネットのかたすみにある、 <br />
            ぽつんと画像をおいておける場所。
          </h1>
          <Button className={styles.ctaButton}>はじめる</Button>
        </div>
      </section>

      <section className={styles.contentSection}>
        <div className={styles.contentText}>
          <p>
            <BudouX>{`${SITE_NAME}はインターネットのかたすみにある、画像をおいておける場所です。`}</BudouX>
          </p>
          <p>
            <BudouX>「せっかくだから写真や画像を公開したい」</BudouX>
            <br />
            <BudouX>「けど、SNSはなんか違うかも……」</BudouX>
          </p>
          <p>
            <BudouX>みたいなシャイな気持ちから生まれました。</BudouX>
          </p>
          <p>
            <BudouX>気になった人がふらっと入って、ふらっと去っていく</BudouX>
            <br />
            <BudouX>そんなかたすみの空間をめざしています。</BudouX>
          </p>
        </div>

        <div className={styles.imageContainer}>
          <div className={styles.imageWrapper}>
            <div className={styles.imageCard}>
              <div className={styles.imageCardBg} />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
