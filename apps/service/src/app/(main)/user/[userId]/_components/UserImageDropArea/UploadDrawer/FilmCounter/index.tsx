type Props = {
  total: number;
  max: number;
};

export default function FilmCounter({ total, max }: Props) {
  const digit = max.toString().length;

  const count = max - total;
  const prevCount = count > 0 ? count - 1 : undefined;
  const nextCount = count < max ? count + 1 : undefined;

  return (
    <div className="flex items-center gap-1 text-sm text-warm-black">
      <span className="text-right text-xs">
        のこり
        <br />
        投稿可能数
      </span>
      <div className="relative overflow-hidden rounded-sm bg-warm-black px-2 py-1 text-warm-white before:pointer-events-none before:absolute before:top-0 before:left-0 before:z-1 before:h-2 before:w-full before:bg-gradient-to-b before:from-warm-black before:to-transparent after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:h-2 after:w-full after:bg-gradient-to-t after:from-warm-black after:to-transparent">
        {typeof prevCount !== "undefined" && (
          <span className="-translate-1/2 absolute top-0 left-1/2">{prevCount.toString().padStart(digit, "0")}</span>
        )}
        <span>{count.toString().padStart(digit, "0")}</span>
        {typeof nextCount !== "undefined" && (
          <span className="-translate-1/2 -bottom-5 absolute left-1/2">
            {nextCount.toString().padStart(digit, "0")}
          </span>
        )}
      </div>
      <span>枚</span>
    </div>
  );
}
