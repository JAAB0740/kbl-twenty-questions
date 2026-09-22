import { QUESTIONS } from "@/data/questions";
import type { Team } from "@/lib/types";

type Props = {
  answers: number[];
  team: Team;
};

/** SPEC 10장: 위에서 아래로 이어지는 세로형 선택 경로. */
export default function DecisionTree({ answers, team }: Props) {
  const nodes = QUESTIONS.map((question, index) => {
    const option = question.options[answers[index] ?? 0];
    return {
      id: question.id,
      label: option?.treeLabel ?? "",
      tag: option?.treeTag ?? "",
    };
  });

  return (
    <div className="animate-fade-up flex flex-col items-center text-center">
      <span className="rounded-md border border-court-line bg-court-card px-3 py-1 text-[12px] font-extrabold tracking-[0.2em] text-court-muted">
        START
      </span>

      {nodes.map((node) => (
        <div key={node.id} className="flex flex-col items-center">
          <span className="my-1 h-5 w-px bg-court-line" aria-hidden />
          <p className="text-[15px] font-semibold leading-snug text-court-ink">
            {node.label}
          </p>
          <span
            className={[
              "mt-1 text-[12px] font-extrabold tracking-[0.15em]",
              node.tag === "NO" ? "text-court-muted" : "text-court-accent2",
            ].join(" ")}
          >
            {node.tag}
          </span>
        </div>
      ))}

      <span className="my-1 h-5 w-px bg-court-line" aria-hidden />
      <span
        className="rounded-xl px-4 py-2 text-[17px] font-extrabold"
        style={{ backgroundColor: `${team.color}22`, color: team.color }}
      >
        {team.shortName}
      </span>

      <p className="mt-5 text-[14px] leading-relaxed text-court-muted">
        {team.oneLiner}
      </p>
    </div>
  );
}
