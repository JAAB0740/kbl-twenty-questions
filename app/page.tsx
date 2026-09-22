import Link from "next/link";
import { TEAMS } from "@/data/teams";
import { TOTAL_QUESTIONS } from "@/data/questions";

export default function LandingPage() {
  return (
    <main className="app-shell gap-8">
      <section className="animate-fade-up pt-6">
        <span className="label-chip">KBL 입문자 전용</span>
        <h1 className="mt-5 text-[34px] font-extrabold leading-[1.22] tracking-tight">
          KBL 스무고개
          <br />
          <span className="text-court-accent">나에게 맞는 KBL 팀</span> 찾기
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-court-muted">
          농구는 잘 모르지만 어느 팀을 응원할지는 정하고 싶은 분들을 위한
          테스트입니다. 질문 {TOTAL_QUESTIONS}개에 답하면 {TEAMS.length}개 구단
          중에서 당신과 가장 잘 맞는 팀을 찾아드립니다.
        </p>
      </section>

      <section className="card animate-fade-up p-5" style={{ animationDelay: "60ms" }}>
        <p className="text-[13px] font-bold tracking-wide text-court-accent2">
          이런 걸 알려드립니다
        </p>
        <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-court-ink/90">
          <li>· 당신과 궁합이 가장 잘 맞는 팀과 궁합 %</li>
          <li>· 2위, 3위 후보와 당신의 팬 성향</li>
          <li>· 추천 이유와 입덕 시 주의사항</li>
          <li>· 조건을 채우면 나오는 히든 결과</li>
        </ul>
      </section>

      <section className="animate-fade-up" style={{ animationDelay: "120ms" }}>
        <p className="text-[13px] font-semibold text-court-muted">대상 구단</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {TEAMS.map((team) => (
            <span
              key={team.id}
              className="rounded-full border px-3 py-1.5 text-[13px] font-medium"
              style={{
                borderColor: `${team.color}55`,
                backgroundColor: `${team.color}14`,
                color: "#E8ECF5",
              }}
            >
              {team.shortName}
            </span>
          ))}
        </div>
      </section>

      <section
        className="animate-fade-up space-y-3 pb-4"
        style={{ animationDelay: "180ms" }}
      >
        <Link href="/test" className="btn-primary">
          내 팀 찾으러 가기
        </Link>
        <p className="text-center text-[13px] leading-relaxed text-court-muted">
          소요 시간 약 2분 · 농구 지식 0으로도 완주 가능
        </p>
      </section>
    </main>
  );
}
