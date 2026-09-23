import { QUESTIONS } from "@/data/questions";
import { TEAMS } from "@/data/teams";
import type {
  HiddenResult,
  MarginBand,
  RegionId,
  TeamScore,
  TestResult,
  TraitKey,
  Traits,
} from "@/lib/types";

/** 모든 성향은 50에서 시작한다. (SPEC 4장) */
export const INITIAL_TRAITS: Traits = {
  winning: 50,
  star: 50,
  offense: 50,
  defense: 50,
  tradition: 50,
  underdog: 50,
  chaos: 50,
  patience: 50,
  youth: 50,
  storyline: 50,
};

export const TRAIT_KEYS = Object.keys(INITIAL_TRAITS) as TraitKey[];

/** 결과 페이지 막대그래프 라벨. (SPEC 8장) */
export const TRAIT_BARS: { label: string; get: (t: Traits) => number }[] = [
  { label: "승부욕", get: (t) => t.winning },
  { label: "스타 사랑", get: (t) => t.star },
  { label: "화력", get: (t) => t.offense },
  { label: "수비 사랑", get: (t) => t.defense },
  { label: "전통", get: (t) => t.tradition },
  { label: "언더독", get: (t) => t.underdog },
  { label: "낭만", get: (t) => t.storyline },
  { label: "인내심", get: (t) => t.patience },
  { label: "육성", get: (t) => t.youth },
  // 안정 추구는 chaos의 반대값으로 보여준다.
  { label: "안정 추구", get: (t) => 100 - t.chaos },
];

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

/**
 * 히든 결과. (SPEC 7장)
 * raw user trait 값으로만 판정한다. scoring 방식(cosine)과는 완전히 별개다.
 * id는 내부 식별자일 뿐 화면에 노출되지 않는다. 배열 순서 = findHidden의 우선순위
 * (여러 조건이 동시에 맞아도 먼저 나오는 것 하나만 보여준다).
 */
export const HIDDEN_RESULTS: HiddenResult[] = [
  {
    // 한국어 별칭: "똥믈리에". 고생을 견디는 사람이 아니라
    // 검증되지 않은 선택을 굳이 직접 해보는 사람이라는 캐릭터라서 patience 조건은 넣지 않는다.
    id: "dong-sommelier",
    title: "똥믈리에",
    lines: [
      "다들 아니라고 했습니다.",
      "데이터도 아니라고 했습니다.",
      "그런데 직접 봐야 직성이 풀립니다.",
      "",
      "그리고 가끔 진짜 맛집을 발견합니다.",
    ],
    matches: (t) =>
      t.underdog >= 80 && t.tradition <= 40 && t.youth >= 65 && t.chaos >= 65,
  },
  {
    id: "romantic",
    title: "영광의 시대 빌런",
    lines: [
      "성적표보다 기억에 남는 시즌이 중요합니다.",
      "",
      "그리고 누가 묻지도 않았는데",
      "'그 시즌은 진짜 달랐는데…'",
      "로 이야기를 시작합니다.",
    ],
    matches: (t) => t.storyline >= 90 && t.underdog >= 75,
  },
  {
    id: "pain-collector",
    title: "고통 수집가 (보살)",
    lines: [
      "연패해도 봅니다.",
      "리빌딩이어도 봅니다.",
      "그리고 다음 경기도 봅니다.",
      "",
      "이쯤 되면 응원이 아니라 수행입니다.",
    ],
    matches: (t) => t.patience >= 75 && t.underdog >= 85,
  },
  {
    id: "winner-only",
    title: "강팀충",
    lines: [
      "스포츠는 결국 이겨야 재밌습니다.",
      "감동적인 패배요?",
      "일단 이기고 감동하겠습니다.",
    ],
    matches: (t) => t.winning >= 90 && t.patience <= 35 && t.storyline <= 50,
  },
  {
    id: "strong-heart",
    title: "도파민 중독자",
    lines: [
      "20점 차 리드? 아직 모릅니다.",
      "4쿼터 역전? 오히려 좋습니다.",
      "",
      "편안한 경기는 하이라이트가 부족합니다.",
    ],
    matches: (t) => t.chaos >= 90,
  },
];

export type AnswerSet = number[];

export function isCompleteAnswerSet(answers: AnswerSet): boolean {
  if (answers.length !== QUESTIONS.length) return false;
  return QUESTIONS.every((question, index) => {
    const choice = answers[index];
    return (
      Number.isInteger(choice) && choice >= 0 && choice < question.options.length
    );
  });
}

/** 15문항 답변을 성향값으로 변환한다. 위치/지역은 별도 입력으로 받는다. */
export function computeTraits(answers: AnswerSet): Traits {
  const traits: Traits = { ...INITIAL_TRAITS };

  QUESTIONS.forEach((question, index) => {
    const choice = answers[index];
    if (choice === undefined) return;
    const option = question.options[choice];
    if (!option) return;

    for (const [key, delta] of Object.entries(option.effects) as [
      TraitKey,
      number,
    ][]) {
      traits[key] = clamp(traits[key] + delta, 0, 100);
    }
  });

  return traits;
}

const COSINE_EPSILON = 1e-6;

/**
 * 50을 중심으로 옮긴 두 벡터의 cosine similarity. 범위 -1~1.
 * 둘 중 하나라도 magnitude가 1e-6보다 작으면(=거의 중립) 0으로 방어 처리한다.
 * (SPEC 16장)
 */
export function centeredCosine(user: Traits, team: Traits): number {
  let dot = 0;
  let userNormSq = 0;
  let teamNormSq = 0;

  for (const key of TRAIT_KEYS) {
    const u = user[key] - 50;
    const t = team[key] - 50;
    dot += u * t;
    userNormSq += u * u;
    teamNormSq += t * t;
  }

  const userNorm = Math.sqrt(userNormSq);
  const teamNorm = Math.sqrt(teamNormSq);

  if (userNorm < COSINE_EPSILON || teamNorm < COSINE_EPSILON) return 0;
  return dot / (userNorm * teamNorm);
}

/**
 * 직관 거리가 중요하다고 답했고 생활권이 일치하는 경우에만 주는 아주 약한 보너스.
 * cosine 스케일(-1~1)에서 +0.03이며, 최종 adjustedCosine은 -1~1로 clamp한다. (SPEC 4장)
 */
const LOCATION_BONUS = 0.03;

/**
 * ranking 점수(cosine)와 화면 표시용 "농구 궁합 %"는 분리한다.
 * 표시값은 calibration을 거치며, 이 함수의 결과는 랭킹에 쓰이지 않는다. (SPEC 5장)
 */
export function displayCompatibility(cosine: number): number {
  const calibrated = 50 + 50 * Math.sign(cosine) * Math.pow(Math.abs(cosine), 1.3);
  return Math.round(clamp(calibrated, 0, 100));
}

/** 1위-2위 adjustedCosine 격차에 따른 접전 안내 구간. (SPEC 6장) */
export function marginBandOf(gap: number): MarginBand {
  if (gap < 0.01) return "tie";
  if (gap < 0.03) return "close";
  if (gap < 0.1) return "normal";
  return "clear";
}

export function rankTeams(
  traits: Traits,
  locationWeight: boolean,
  region: RegionId,
): TeamScore[] {
  const scored = TEAMS.map((team) => {
    const cosine = centeredCosine(traits, team.traits);
    const locationBonus =
      locationWeight && region !== "any" && team.region === region;
    const adjustedCosine = clamp(
      cosine + (locationBonus ? LOCATION_BONUS : 0),
      -1,
      1,
    );

    return {
      team,
      cosine,
      adjustedCosine,
      percent: displayCompatibility(adjustedCosine),
      locationBonus,
    };
  });

  return scored.sort((a, b) => b.adjustedCosine - a.adjustedCosine);
}

export function findHidden(traits: Traits): HiddenResult | null {
  return HIDDEN_RESULTS.find((hidden) => hidden.matches(traits)) ?? null;
}

export function buildResult(
  answers: AnswerSet,
  locationWeight: boolean,
  region: RegionId,
): TestResult {
  const traits = computeTraits(answers);
  const ranking = rankTeams(traits, locationWeight, region);
  const gap =
    ranking.length >= 2
      ? ranking[0].adjustedCosine - ranking[1].adjustedCosine
      : 1;

  return {
    traits,
    locationWeight,
    region,
    ranking,
    hidden: findHidden(traits),
    marginBand: marginBandOf(gap),
  };
}
