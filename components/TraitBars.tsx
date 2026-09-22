import { TRAIT_BARS } from "@/lib/scoring";
import type { Traits } from "@/lib/types";

type Props = {
  traits: Traits;
  accent: string;
};

export default function TraitBars({ traits, accent }: Props) {
  return (
    <div className="flex flex-col gap-2.5">
      {TRAIT_BARS.map((bar, index) => {
        const value = Math.round(bar.get(traits));
        return (
          <div key={bar.label} className="flex items-center gap-3">
            <span className="w-[68px] shrink-0 text-[13px] font-semibold text-court-muted">
              {bar.label}
            </span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-court-line/80">
              <div
                className="h-full origin-left animate-bar-grow rounded-full"
                style={{
                  width: `${value}%`,
                  backgroundImage: `linear-gradient(90deg, ${accent}, #FFC93C)`,
                  animationDelay: `${index * 45}ms`,
                }}
              />
            </div>
            <span className="w-[34px] shrink-0 text-right text-[12px] font-bold tabular-nums text-court-ink/80">
              {value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
