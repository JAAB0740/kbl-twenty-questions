import Link from "next/link";
import { TEAMS } from "@/data/teams";
import { TOTAL_QUESTIONS } from "@/data/questions";

/** 실제 팀 컬러/로고를 쓰지 않는 순수 시각적 teaser. 테스트 로직과 무관하다. */
const TEASER_BARS = [
  { label: "승부욕", value: 80 },
  { label: "낭만", value: 70 },
  { label: "고통 내성", value: 90 },
];

export default function LandingPage() {
  return (
    <main className="relative mx-auto flex w-full max-w-[1180px] flex-col overflow-hidden px-5 py-10 lg:min-h-[86vh] lg:justify-center lg:px-10 lg:py-14">
      {/* 아주 옅은 코트 장식 — 가독성을 방해하지 않는 선에서만. 랜딩 전용. */}
      <CourtDecoration />

      <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_0.95fr] lg:gap-11">
        {/* 왼쪽: 카피 + CTA */}
        <section className="animate-fade-up">
          <span className="label-chip">🏀 KBL 입문자 환영</span>

          <h1 className="mt-5 text-[30px] font-extrabold leading-[1.32] tracking-tight lg:mt-6 lg:text-[44px] lg:leading-[1.26]">
            <span className="text-court-ink">
              <span className="text-court-accent">KBL</span> 팀이 10개인데
              <br />
              대체 어디를 응원해야 하지?
            </span>
          </h1>
          <p className="mt-3 text-[22px] font-extrabold text-court-accent lg:mt-4 lg:text-[28px]">
            나에게 맞는 KBL 팀 찾기
          </p>

          <p className="mt-5 text-[16px] leading-relaxed text-court-muted lg:mt-6 lg:text-[18px]">
            {TOTAL_QUESTIONS}개의 쓸데없이 진지한 질문으로
            <br />
            당신의 승부욕·낭만·고통 내성을 파헤쳐
            <br />
            KBL {TEAMS.length}개 팀 중 잘 맞는 팀을 찾아드립니다.
          </p>
          <p className="mt-3 text-[14px] leading-relaxed text-court-muted/80 lg:text-[15px]">
            농구를 몰라도 됩니다.
            <br />
            어쩌면 그게 더 정확할 수도 있습니다.
          </p>

          <div className="mt-8 max-w-[360px] space-y-3 lg:mt-10">
            <Link href="/test" className="btn-primary cta-glow text-[18px] py-5">
              🏀 내 팀 찾으러 가기
            </Link>
            <p className="text-center text-[13px] leading-relaxed text-court-muted">
              약 2분 · 농구 지식 0이어도 가능 ·{" "}
              <span className="text-court-accent2/80">결과 불복 시 재심 가능</span>
            </p>
          </div>
        </section>

        {/* 오른쪽: 결과 teaser 카드 (실제 계산 없음, 순수 시각적 미끼) */}
        <section
          className="animate-fade-up"
          style={{ animationDelay: "100ms" }}
          aria-hidden="true"
        >
          <div className="card teaser-card mx-auto max-w-[360px] overflow-hidden p-6 lg:max-w-[440px] lg:p-8">
            <p className="text-[13px] text-court-muted lg:text-[14px]">
              당신의 운명의 팀은…
            </p>
            <p className="mt-3 text-[44px] font-extrabold tracking-tight text-court-ink/90 lg:mt-4 lg:text-[54px]">
              ???
            </p>
            <p className="mt-2 text-[18px] font-extrabold text-court-accent2 lg:text-[22px]">
              농구 궁합 ??%
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-court-ink/70 lg:text-[15px]">
              평범한 농구에는 만족하지 못하는 타입
            </p>

            <div className="mt-6 flex flex-col gap-2.5 lg:mt-8 lg:gap-3.5">
              {TEASER_BARS.map((bar) => (
                <div key={bar.label} className="flex items-center gap-3">
                  <span className="w-[58px] shrink-0 text-[12px] font-semibold text-court-muted lg:w-[68px] lg:text-[13px]">
                    {bar.label}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-court-line/80 lg:h-2.5">
                    <div
                      className="h-full rounded-full bg-court-muted/60"
                      style={{ width: `${bar.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-6 text-center text-[13px] font-semibold text-court-muted lg:mt-8 lg:text-[14px]">
              {TOTAL_QUESTIONS}문제 뒤 공개됩니다 👀
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function CourtDecoration() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-[0.07]"
      viewBox="0 0 1180 720"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
    >
      <circle cx="960" cy="140" r="220" stroke="#F2F4F8" strokeWidth="1.5" />
      <circle cx="960" cy="140" r="70" stroke="#F2F4F8" strokeWidth="1.5" />
      <line x1="0" y1="360" x2="1180" y2="360" stroke="#F2F4F8" strokeWidth="1.5" strokeDasharray="2 10" />
      <circle cx="120" cy="620" r="150" stroke="#F2F4F8" strokeWidth="1.5" />
    </svg>
  );
}
