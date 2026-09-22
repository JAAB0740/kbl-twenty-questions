import type { ImportanceOption, RegionOption } from "@/lib/types";

/**
 * 15개 성향 질문이 끝난 뒤 표시하는 optional step.
 * 성향 점수 계산에는 들어가지 않고, 지역 보너스(scoring.ts) 계산에만 쓰인다.
 */
export const LOCATION_STEP_PROMPT = ["마지막으로 하나만!", "직관 거리도 추천에 반영할까요?"];

export const IMPORTANCE_OPTIONS: ImportanceOption[] = [
  { label: "직관 거리도 중요해요", value: true },
  { label: "상관없어요. 마음 가는 팀이 내 팀입니다.", value: false },
];

/** 직관 거리가 중요하다고 답한 경우에만 노출되는 생활권 9개. */
export const REGION_OPTIONS: RegionOption[] = [
  { id: "seoul", label: "서울" },
  { id: "goyang", label: "경기 북서부" },
  { id: "suwon", label: "경기 남부" },
  { id: "anyang", label: "경기 중부" },
  { id: "gangwon", label: "강원" },
  { id: "busan", label: "부산·경남" },
  { id: "daegu", label: "대구·경북" },
  { id: "ulsan", label: "울산" },
  { id: "any", label: "상관없음" },
];
