"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProgressDots from "@/components/ProgressDots";
import { QUESTIONS, TOTAL_QUESTIONS } from "@/data/questions";
import {
  IMPORTANCE_OPTIONS,
  LOCATION_STEP_PROMPT,
  REGION_OPTIONS,
} from "@/data/locationStep";
import { encodeAnswers } from "@/lib/answers";
import type { RegionId } from "@/lib/types";

const PICK_DELAY = 280;
const REACTION_DELAY = 1700;
/** 위치 optional step 전용: reaction 대기 없이 짧은 전환만 거친다. */
const LOCATION_TRANSITION_DELAY = 200;

type Phase = "idle" | "picking" | "reaction";
type Stage = "questions" | "importance" | "region";

/** reaction 말풍선이 사라지기 전 짧게 fade-out만 거치는 구간의 길이. */
const REACTION_LEAVE_LEAD = 180;

export default function TestPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [stage, setStage] = useState<Stage>("questions");
  const [answers, setAnswers] = useState<number[]>([]);
  const [locationWeight, setLocationWeight] = useState<boolean | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [reaction, setReaction] = useState<string | null>(null);
  const [reactionLeaving, setReactionLeaving] = useState(false);
  const timers = useRef<number[]>([]);

  const question = stage === "questions" ? QUESTIONS[step] : null;

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const goToResult = useCallback(
    (finalAnswers: number[], weight: boolean, region: RegionId) => {
      router.push(`/result?a=${encodeAnswers(finalAnswers, weight, region)}`);
    },
    [router],
  );

  const selectQuestion = useCallback(
    (optionIndex: number) => {
      if (phase !== "idle" || !question) return;
      const option = question.options[optionIndex];
      if (!option) return;

      const nextAnswers = [...answers];
      nextAnswers[step] = optionIndex;
      setAnswers(nextAnswers);
      setPicked(optionIndex);
      setPhase("picking");

      const advance = () => {
        clearTimers();
        if (step === TOTAL_QUESTIONS - 1) {
          setStage("importance");
          setStep(0);
        } else {
          setStep(step + 1);
        }
        setPicked(null);
        setPhase("idle");
        setReaction(null);
        setReactionLeaving(false);
      };

      timers.current.push(
        window.setTimeout(() => {
          if (option.reaction) {
            setReaction(option.reaction);
            setReactionLeaving(false);
            setPhase("reaction");
            timers.current.push(
              window.setTimeout(
                () => setReactionLeaving(true),
                Math.max(REACTION_DELAY - REACTION_LEAVE_LEAD, 0),
              ),
            );
            timers.current.push(window.setTimeout(advance, REACTION_DELAY));
          } else {
            advance();
          }
        }, PICK_DELAY),
      );
    },
    [answers, clearTimers, phase, question, step],
  );

  const selectImportance = useCallback(
    (optionIndex: number) => {
      if (phase !== "idle") return;
      const option = IMPORTANCE_OPTIONS[optionIndex];
      if (!option) return;

      setPicked(optionIndex);
      setPhase("picking");
      setLocationWeight(option.value);

      timers.current.push(
        window.setTimeout(() => {
          clearTimers();
          setPicked(null);
          setPhase("idle");
          if (option.value) {
            setStage("region");
          } else {
            goToResult(answers, false, "any");
          }
        }, LOCATION_TRANSITION_DELAY),
      );
    },
    [answers, clearTimers, goToResult, phase],
  );

  const selectRegion = useCallback(
    (optionIndex: number) => {
      if (phase !== "idle") return;
      const option = REGION_OPTIONS[optionIndex];
      if (!option) return;

      setPicked(optionIndex);
      setPhase("picking");

      timers.current.push(
        window.setTimeout(() => {
          clearTimers();
          goToResult(answers, true, option.id);
        }, LOCATION_TRANSITION_DELAY),
      );
    },
    [answers, clearTimers, goToResult, phase],
  );

  const goBack = useCallback(() => {
    clearTimers();
    setPicked(null);
    setPhase("idle");
    setReaction(null);
    setReactionLeaving(false);

    if (stage === "region") {
      setStage("importance");
      return;
    }
    if (stage === "importance") {
      setStage("questions");
      setStep(TOTAL_QUESTIONS - 1);
      return;
    }
    if (step === 0) return;
    setStep(step - 1);
  }, [clearTimers, stage, step]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const numeric = Number.parseInt(event.key, 10);
      if (Number.isNaN(numeric) || numeric < 1) return;
      if (stage === "questions") selectQuestion(numeric - 1);
      else if (stage === "importance") selectImportance(numeric - 1);
      else selectRegion(numeric - 1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectImportance, selectQuestion, selectRegion, stage]);

  const canGoBack = stage !== "questions" || step > 0;

  return (
    <main className="app-shell relative min-h-dvh gap-7 overflow-hidden">
      <TestCourtDecoration />

      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-[13px] font-bold tracking-wide text-court-muted transition hover:text-court-ink"
          >
            KBL 스무고개
          </Link>
          <button
            type="button"
            onClick={goBack}
            disabled={!canGoBack}
            className="text-[13px] font-semibold text-court-muted transition hover:text-court-ink disabled:opacity-30"
          >
            이전 질문
          </button>
        </div>
        {stage === "questions" ? (
          <ProgressDots total={TOTAL_QUESTIONS} current={step} />
        ) : (
          <p className="text-[12px] font-bold tracking-wide text-court-muted">
            성향 테스트 완료 · 마지막 단계
          </p>
        )}
      </header>

      {stage === "questions" && question && (
        <section key={question.id} className="animate-fade-up mt-12">
          <h1 className="text-[24px] font-extrabold leading-[1.35] tracking-tight">
            {question.prompt.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>

          <div className="mt-7 flex flex-col gap-3">
            {question.options.map((option, index) => {
              const isPicked = picked === index;
              const dimmed = phase !== "idle" && !isPicked;
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => selectQuestion(index)}
                  className={[
                    "choice",
                    isPicked ? "choice-picked" : "choice-idle",
                    dimmed ? "choice-dimmed" : "",
                  ].join(" ")}
                >
                  <span className="mr-2 text-[13px] font-bold text-court-muted">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option.label}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {stage === "importance" && (
        <section key="importance" className="animate-quick-fade mt-12">
          <h1 className="text-[24px] font-extrabold leading-[1.35] tracking-tight">
            {LOCATION_STEP_PROMPT.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>

          <div className="mt-7 flex flex-col gap-3">
            {IMPORTANCE_OPTIONS.map((option, index) => {
              const isPicked = picked === index;
              const dimmed = phase !== "idle" && !isPicked;
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => selectImportance(index)}
                  className={[
                    "choice",
                    isPicked ? "choice-picked" : "choice-idle",
                    dimmed ? "choice-dimmed" : "",
                  ].join(" ")}
                >
                  <span className="mr-2 text-[13px] font-bold text-court-muted">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option.label}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {stage === "region" && (
        <section key="region" className="animate-quick-fade mt-12">
          <h1 className="text-[24px] font-extrabold leading-[1.35] tracking-tight">
            생활권과 가장 가까운 곳은?
          </h1>

          <div className="mt-7 grid grid-cols-2 gap-2.5">
            {REGION_OPTIONS.map((option, index) => {
              const isPicked = picked === index;
              const dimmed = phase !== "idle" && !isPicked;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => selectRegion(index)}
                  className={[
                    "choice text-center text-[15px]",
                    isPicked ? "choice-picked" : "choice-idle",
                    dimmed ? "choice-dimmed" : "",
                  ].join(" ")}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-[13px] leading-relaxed text-court-muted">
            지역 정보는 최종 추천에 약한 보너스만 줍니다. 지역 때문에 추천팀이
            무조건 결정되지는 않습니다.
          </p>
        </section>
      )}

      {reaction && (
        <div
          role="status"
          className={[
            "reaction-bubble card flex gap-3 border-court-accent/30 border-l-4 border-l-court-accent bg-court-accent/15 p-4",
            reactionLeaving ? "reaction-out" : "reaction-in",
          ].join(" ")}
        >
          <span className="text-[18px] leading-none" aria-hidden="true">
            🏀
          </span>
          <div>
            <p className="text-[16px] font-bold leading-relaxed text-white">
              {reaction}
            </p>
            <p className="mt-1.5 text-[12px] text-court-muted">
              잠시 후 다음 단계로 넘어갑니다.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

function TestCourtDecoration() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[55%] w-full opacity-[0.06]"
      viewBox="0 0 400 460"
      fill="none"
      preserveAspectRatio="xMidYMax slice"
    >
      {/* 프리드로우 서클 일부 */}
      <circle cx="200" cy="460" r="130" stroke="#F2F4F8" strokeWidth="1.5" />
      {/* 프리드로우 라인 */}
      <line x1="70" y1="330" x2="330" y2="330" stroke="#F2F4F8" strokeWidth="1.5" />
      {/* 코트 사이드라인 일부 */}
      <line x1="20" y1="330" x2="20" y2="460" stroke="#F2F4F8" strokeWidth="1.5" />
      <line x1="380" y1="330" x2="380" y2="460" stroke="#F2F4F8" strokeWidth="1.5" />
    </svg>
  );
}
