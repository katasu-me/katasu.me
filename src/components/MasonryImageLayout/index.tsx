import FrameImage from "../FrameImage";
import styles from "./index.module.css";

export interface ImageData {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  title?: string;
}

interface MasonryImageLayoutProps {
  images: ImageData[];
}

export default function MasonryImageLayout({ images }: MasonryImageLayoutProps) {
  return (
    <div className={styles.container}>
      {images.map((image) => (
        <FrameImage
          key={image.id}
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          title={image.title}
          className={styles.imageItem}
        />
      ))}
    </div>
  );
}
