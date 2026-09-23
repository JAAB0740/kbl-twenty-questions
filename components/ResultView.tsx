"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import DecisionTree from "@/components/DecisionTree";
import TraitBars from "@/components/TraitBars";
import { decodeAnswers } from "@/lib/answers";
import { buildResult, isCompleteAnswerSet } from "@/lib/scoring";
import { downloadBlob, renderShareImage } from "@/lib/shareImage";
import type { MarginBand } from "@/lib/types";

/**
 * 1위-2위 격차 구간별 접전 안내. HERO 카드 하단 status strip에 쓰인다. (SPEC 10장)
 * tie/close는 실제 2위 팀 이름을 넣어 보여준다.
 */
const MARGIN_BADGES: Record<
  MarginBand,
  { emoji: string; text: (secondTeamName: string) => string } | null
> = {
  tie: {
    emoji: "🔥",
    text: (name) => `거의 동률! ${name}도 꽤 잘 맞아요.`,
  },
  close: {
    emoji: "👀",
    text: () => "아슬아슬한 접전! 두 번째 팀도 꽤 잘 맞아요.",
  },
  normal: null,
  clear: {
    emoji: "🎯",
    text: () => "취향이 꽤 선명하네요. 1순위 팀이 확실하게 앞섰습니다.",
  },
};

/**
 * 히든 카드에서만 쓰는 UI 전용 아이콘/부제. hidden condition·본문 문구는 건드리지 않는다.
 * lib/scoring.ts의 HIDDEN_RESULTS id와 1:1로만 맞춘다.
 */
const HIDDEN_UI_META: Record<string, { icon: string; subtitle: string }> = {
  "winner-only": { icon: "👑", subtitle: "지는 건 서사로 안 쳐주는 타입" },
  "pain-collector": { icon: "🧘", subtitle: "쉽게 행복해지는 방법을 거부한 사람" },
  "dong-sommelier": { icon: "💩", subtitle: "남들이 말려도 직접 먹어봐야 아는 타입" },
  "strong-heart": { icon: "⚡", subtitle: "평온한 경기를 견디지 못하는 타입" },
  romantic: { icon: "🌹", subtitle: "그때 그 시즌이 진짜였지를 참지 못하는 타입" },
};

/** 등장 시 카드 주변에 아주 짧게 반짝이는 3개의 sparkle. 장식용, 1초 내 종료. */
const HIDDEN_SPARKLES = [
  { style: { top: "-8px", right: "18px" }, delay: 460 },
  { style: { top: "10px", left: "-6px" }, delay: 540 },
  { style: { bottom: "-6px", right: "-4px" }, delay: 620 },
];

export default function ResultView() {
  const searchParams = useSearchParams();
  const encoded = searchParams.get("a");
  const decoded = useMemo(() => decodeAnswers(encoded), [encoded]);
  const result = useMemo(
    () =>
      decoded && isCompleteAnswerSet(decoded.answers)
        ? buildResult(decoded.answers, decoded.locationWeight, decoded.region)
        : null,
    [decoded],
  );

  const [showTree, setShowTree] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!decoded || !result) {
    return (
      <main className="app-shell gap-6 pt-10">
        <h1 className="text-[24px] font-extrabold leading-snug">
          결과를 불러오지 못했습니다.
        </h1>
        <p className="text-[15px] leading-relaxed text-court-muted">
          주소가 잘린 것 같습니다. 테스트를 다시 진행하면 결과가 나옵니다.
        </p>
        <Link href="/test" className="btn-primary">
          테스트 다시 하기
        </Link>
      </main>
    );
  }

  const { answers } = decoded;
  const [first, second, third] = result.ranking;
  const team = first.team;
  const marginBadge = MARGIN_BADGES[result.marginBand];

  const share = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    const text = `나와 가장 잘 맞는 KBL 팀은 ${team.name} (농구 궁합 ${first.percent}%)`;

    try {
      if (navigator.share) {
        await navigator.share({ title: "KBL 스무고개", text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setNotice("결과 링크를 복사했습니다.");
    } catch {
      setNotice("공유가 취소됐습니다.");
    }
  };

  const saveImage = async () => {
    setBusy(true);
    setNotice(null);
    try {
      const blob = await renderShareImage({
        team,
        percent: first.percent,
        traits: result.traits,
        hiddenTitle: result.hidden?.title ?? null,
      });
      if (!blob) {
        setNotice("이미지를 만들지 못했습니다.");
        return;
      }
      downloadBlob(blob, `kbl-스무고개-${team.shortName}.png`);
      setNotice("1080x1920 공유 이미지를 저장했습니다.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="app-shell gap-6">
      {/* 1위 HERO — 페이지에서 가장 강한 시각 요소 */}
      <section
        className="card hero-card animate-fade-up overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(160deg, ${team.color}33, transparent 65%)`,
        }}
      >
        <div className="p-6 lg:p-8">
          <p className="text-[13px] font-bold uppercase tracking-[0.1em] text-court-muted">
            당신의 1순위 KBL 팀
          </p>
          <h1
            className="mt-2 text-[32px] font-extrabold leading-tight tracking-tight lg:text-[38px]"
            style={{ color: team.color }}
          >
            {team.name}
          </h1>

          <p className="mt-6 text-[12px] font-bold uppercase tracking-[0.15em] text-court-muted">
            농구 궁합
          </p>
          <p className="mt-0.5 flex items-baseline gap-1">
            <span className="text-[64px] font-extrabold leading-none tracking-tight text-court-accent2 lg:text-[76px]">
              {first.percent}
            </span>
            <span className="text-[28px] font-extrabold text-court-accent2 lg:text-[32px]">
              %
            </span>
          </p>

          <p className="mt-5 text-[12px] font-bold uppercase tracking-[0.15em] text-court-muted">
            당신의 팬 유형
          </p>
          <p className="mt-1.5 text-[18px] font-extrabold leading-snug text-court-ink">
            {team.fanType}
          </p>
          {first.locationBonus && (
            <p className="mt-3 text-[13px] text-court-muted">
              생활권이 가까워 약간의 보너스가 반영됐습니다.
            </p>
          )}

          {marginBadge && (
            <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-court-line/70 bg-court-bg/50 px-4 py-3">
              <span className="text-[16px] leading-none">{marginBadge.emoji}</span>
              <p className="text-[13px] leading-relaxed text-court-ink/90">
                {marginBadge.text(second.team.shortName)}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 히든 결과 — 메인 결과가 아니라 보너스 칭호/업적 해금처럼 보이게 한다.
          1위 HERO가 먼저 그려진 뒤 살짝 늦게(400ms) 등장한다. */}
      {result.hidden && (
        <section
          className="card hidden-card relative p-4"
          style={{ animationDelay: "400ms" }}
        >
          {HIDDEN_SPARKLES.map((sparkle, index) => (
            <span
              key={index}
              aria-hidden="true"
              className="hidden-sparkle"
              style={{ ...sparkle.style, animationDelay: `${sparkle.delay}ms` }}
            >
              ✨
            </span>
          ))}

          <span className="label-chip border-court-accent2/40 text-court-accent2">
            🔓 숨겨진 팬 유형 발견
          </span>

          <h2 className="mt-3 flex items-center gap-2 text-[20px] font-extrabold leading-snug">
            <span aria-hidden="true">
              {HIDDEN_UI_META[result.hidden.id]?.icon ?? "🔓"}
            </span>
            <span>{result.hidden.title}</span>
          </h2>
          <p className="mt-0.5 text-[12px] font-bold text-court-accent2">
            {HIDDEN_UI_META[result.hidden.id]?.subtitle}
          </p>

          <div className="mt-3 space-y-1 text-[14px] leading-relaxed text-court-ink/90">
            {result.hidden.lines.map((line, index) => (
              <p key={index}>{line || " "}</p>
            ))}
          </div>
        </section>
      )}

      <section className="card animate-fade-up p-5">
        <h2 className="text-[13px] font-bold tracking-wide text-court-accent2">
          내 성향 그래프
        </h2>
        <div className="mt-4">
          <TraitBars traits={result.traits} accent={team.color} />
        </div>
      </section>

      <section className="card animate-fade-up p-5">
        <h2 className="text-[13px] font-bold tracking-wide text-court-accent2">
          가장 잘 맞는 이유
        </h2>
        <ul className="mt-3 space-y-2.5 text-[15px] leading-relaxed text-court-ink/90">
          {team.reasons.map((reason) => (
            <li key={reason} className="flex gap-2">
              <span className="text-court-accent">·</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card animate-fade-up p-5">
        <h2 className="text-[13px] font-bold tracking-wide text-court-accent2">
          입덕 시 주의사항
        </h2>
        <ul className="mt-3 space-y-2.5 text-[15px] leading-relaxed text-court-ink/90">
          {team.cautions.map((caution) => (
            <li key={caution} className="flex gap-2">
              <span className="text-court-muted">!</span>
              <span>{caution}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 2·3위 — 1위는 이미 HERO에서 보여줬으므로 여기서는 반복하지 않는다 */}
      <section className="card animate-fade-up p-5">
        <h2 className="text-[13px] font-bold tracking-wide text-court-accent2">
          다른 후보도 궁금하다면
        </h2>
        <div className="mt-3 space-y-2">
          {[second, third].map((entry, index) => (
            <div
              key={entry.team.id}
              className="flex items-center gap-3 rounded-lg border border-court-line/60 px-3.5 py-2.5"
            >
              <span className="w-[34px] shrink-0 text-[11px] font-bold text-court-muted">
                {index + 2}위
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-[14px] font-bold"
                  style={{ color: entry.team.color }}
                >
                  {entry.team.name}
                </p>
                <p className="line-clamp-2 text-[12px] leading-snug text-court-muted">
                  {entry.team.fanType}
                </p>
              </div>
              <span className="shrink-0 text-[15px] font-extrabold tabular-nums text-court-ink/80">
                {entry.percent}%
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="animate-fade-up space-y-3">
        <button
          type="button"
          onClick={() => setShowTree((prev) => !prev)}
          className="btn-ghost py-3"
        >
          {showTree ? "선택 경로 접기" : "내가 여기까지 온 과정 보기"}
        </button>

        {showTree && (
          <div className="card p-6">
            <DecisionTree answers={answers} team={team} />
          </div>
        )}

        <button
          type="button"
          onClick={saveImage}
          disabled={busy}
          className="btn-ghost py-3 disabled:opacity-50"
        >
          {busy ? "이미지 만드는 중..." : "공유용 이미지 저장하기"}
        </button>

        <button type="button" onClick={share} className="btn-primary">
          결과 자랑하러 가기
        </button>
        <Link href="/test" className="btn-outline-accent">
          결과에 불복하고 재심 청구하기
        </Link>

        {notice && (
          <p className="pt-1 text-center text-[13px] text-court-muted">{notice}</p>
        )}
      </section>

      <p className="pb-4 text-center text-[12px] leading-relaxed text-court-muted">
        이 테스트는 재미로 만든 콘텐츠입니다. 어떤 팀을 고르든 정답입니다.
      </p>
    </main>
  );
}
