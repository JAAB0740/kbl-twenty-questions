import { QUESTIONS } from "@/data/questions";
import { REGION_OPTIONS } from "@/data/locationStep";
import type { AnswerSet } from "@/lib/scoring";
import type { RegionId } from "@/lib/types";

export type DecodedResult = {
  answers: AnswerSet;
  locationWeight: boolean;
  region: RegionId;
};

/**
 * 답변을 URL에 담기 위한 인코딩.
 * 15문항 선택 인덱스(각 한 자리) + 위치중요도(1자리, 0/1) + 생활권 인덱스(1자리) 순으로 이어 붙인다.
 * 예: "010110100210003" + "1" + "0" -> 총 17자
 */
export function encodeAnswers(
  answers: AnswerSet,
  locationWeight: boolean,
  region: RegionId,
): string {
  const regionIndex = REGION_OPTIONS.findIndex((option) => option.id === region);
  const questionPart = answers.map((index) => String(index)).join("");
  const locationPart = locationWeight ? "1" : "0";
  const regionPart = String(regionIndex >= 0 ? regionIndex : REGION_OPTIONS.length - 1);
  return `${questionPart}${locationPart}${regionPart}`;
}

export function decodeAnswers(
  encoded: string | null | undefined,
): DecodedResult | null {
  if (!encoded) return null;
  if (encoded.length !== QUESTIONS.length + 2) return null;

  const answers: AnswerSet = [];
  for (let i = 0; i < QUESTIONS.length; i += 1) {
    const choice = Number.parseInt(encoded[i] ?? "", 10);
    if (Number.isNaN(choice)) return null;
    if (choice < 0 || choice >= QUESTIONS[i].options.length) return null;
    answers.push(choice);
  }

  const locationChar = encoded[QUESTIONS.length];
  if (locationChar !== "0" && locationChar !== "1") return null;
  const locationWeight = locationChar === "1";

  const regionIndex = Number.parseInt(encoded[QUESTIONS.length + 1] ?? "", 10);
  if (Number.isNaN(regionIndex) || !REGION_OPTIONS[regionIndex]) return null;
  const region = REGION_OPTIONS[regionIndex].id;

  return { answers, locationWeight, region };
}
