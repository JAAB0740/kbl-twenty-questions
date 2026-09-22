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

/** 1위-2위 격차 구간별 접전 안내 문구. (SPEC 6장) */
const MARGIN_MESSAGES: Record<MarginBand, { title: string; body: string } | null> = {
  tie: {
    title: "거의 동률!",
    body: "두 팀 사이에서 고민할 타입이에요.",
  },
  close: {
    title: "아슬아슬한 접전!",
    body: "두 번째 팀도 꽤 잘 맞아요.",
  },
  normal: null,
  clear: {
    title: "취향이 꽤 선명하네요.",
    body: "1순위 팀이 확실하게 앞섰습니다.",
  },
};

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
  const marginMessage = MARGIN_MESSAGES[result.marginBand];

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
      {result.hidden && (
        <section className="card animate-pop-in border-court-accent/50 bg-court-accent/10 p-5">
          <span className="label-chip border-court-accent/40 text-court-accent2">
            히든 결과
          </span>
          <h2 className="mt-3 text-[20px] font-extrabold">{result.hidden.title}</h2>
          <div className="mt-2 space-y-1 text-[15px] leading-relaxed text-court-ink/90">
            {result.hidden.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </section>
      )}

      <section
        className="card animate-fade-up overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(160deg, ${team.color}2E, transparent 60%)`,
        }}
      >
        <div className="p-6">
          <p className="text-[15px] text-court-muted">당신의 운명의 KBL 팀은</p>
          <h1
            className="mt-2 text-[30px] font-extrabold leading-tight tracking-tight"
            style={{ color: team.color }}
          >
            {team.name}
          </h1>
          <p className="mt-3 text-[22px] font-extrabold text-court-accent2">
            농구 궁합 {first.percent}%
          </p>
          <p className="mt-3 text-[16px] leading-relaxed text-court-ink/90">
            {team.fanType}
          </p>
          {first.locationBonus && (
            <p className="mt-3 text-[13px] text-court-muted">
              생활권이 가까워 약간의 보너스가 반영됐습니다.
            </p>
          )}
        </div>
      </section>

      {marginMessage && (
        <section className="card animate-fade-up border-court-line/70 p-5">
          <p className="text-[15px] font-bold text-court-ink">{marginMessage.title}</p>
          <p className="mt-1 text-[14px] leading-relaxed text-court-muted">
            {marginMessage.body}
          </p>
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

      <section className="card animate-fade-up p-5">
        <h2 className="text-[13px] font-bold tracking-wide text-court-accent2">
          TOP 3 궁합
        </h2>
        <div className="mt-3 space-y-3">
          {[first, second, third].map((entry, index) => (
            <div
              key={entry.team.id}
              className={[
                "flex items-center justify-between gap-3 rounded-xl border px-4 py-3",
                index === 0
                  ? "border-court-accent/50 bg-court-accent/10"
                  : "border-court-line/70",
              ].join(" ")}
            >
              <div>
                <p className="text-[12px] font-bold text-court-muted">
                  궁합 {index + 1}위
                </p>
                <p className="text-[16px] font-bold" style={{ color: entry.team.color }}>
                  {entry.team.name}
                </p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-court-muted">
                  {entry.team.fanType}
                </p>
              </div>
              <span className="shrink-0 text-[18px] font-extrabold tabular-nums text-court-ink">
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
          className="btn-ghost"
        >
          {showTree ? "선택 경로 접기" : "내가 여기까지 온 과정 보기"}
        </button>

        {showTree && (
          <div className="card p-6">
            <DecisionTree answers={answers} team={team} />
          </div>
        )}

        <button type="button" onClick={share} className="btn-ghost">
          결과 자랑하러 가기
        </button>
        <button
          type="button"
          onClick={saveImage}
          disabled={busy}
          className="btn-ghost disabled:opacity-50"
        >
          {busy ? "이미지 만드는 중..." : "공유용 이미지 저장하기"}
        </button>
        <Link href="/test" className="btn-primary">
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
