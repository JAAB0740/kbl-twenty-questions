type Props = {
  total: number;
  current: number;
};

export default function ProgressDots({ total, current }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-[12px] font-semibold tracking-wide text-court-muted">
        <span>
          Q{current + 1} / {total}
        </span>
        <span>{Math.round((current / total) * 100)}%</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: total }).map((_, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <span
              key={index}
              aria-hidden
              className={[
                "h-2.5 w-2.5 rounded-full transition-all duration-300",
                done ? "bg-court-accent" : "",
                active ? "scale-125 bg-court-accent2" : "",
                !done && !active ? "bg-court-line" : "",
              ].join(" ")}
            />
          );
        })}
      </div>
    </div>
  );
}
