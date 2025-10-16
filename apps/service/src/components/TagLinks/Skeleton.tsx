import { twMerge } from "tailwind-merge";

type Props = {
  className?: string;
};

export default function TagLinksSkeleton({ className }: Props) {
  return (
    <output className={twMerge("flex animate-pulse flex-wrap gap-2 py-1", className)} aria-busy="true">
      {/* タグ */}
      {[1, 2, 3, 4].map((i) => (
        <div key={`tag-skeleton-${i}`} className="h-8 w-16 rounded-md bg-warm-black-25" aria-hidden="true" />
      ))}

      {/* もっとみる */}
      <div className="h-8 w-20 rounded-md border border-warm-black bg-warm-white opacity-25" aria-hidden="true" />
    </output>
  );
}
