import FrameImage from "../FrameImage";

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
    <div className="w-full columns-1 gap-x-[1rem] sm:columns-2 md:columns-3 lg:columns-4">
      {images.map((image) => (
        <FrameImage
          key={image.id}
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          title={image.title}
          className="mb-[1rem] inline-block h-auto w-full break-inside-avoid"
        />
      ))}
    </div>
  );
}
