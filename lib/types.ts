export type TraitKey =
  | "winning"
  | "star"
  | "offense"
  | "defense"
  | "tradition"
  | "underdog"
  | "chaos"
  | "patience"
  | "youth"
  | "storyline";

export type Traits = Record<TraitKey, number>;

export type RegionId =
  | "seoul"
  | "goyang"
  | "suwon"
  | "anyang"
  | "gangwon"
  | "busan"
  | "daegu"
  | "ulsan"
  | "any";

export type Team = {
  id: string;
  name: string;
  shortName: string;
  city: string;
  region: RegionId;
  color: string;
  color2: string;
  traits: Traits;
  /** 결과 페이지 상단에 붙는 팬 성향 한 줄 */
  fanType: string;
  /** 가장 잘 맞는 이유 3~4개 */
  reasons: string[];
  /** 입덕 시 주의사항 */
  cautions: string[];
  /** 공유 이미지·선택 경로 마지막에 들어가는 한줄평 */
  oneLiner: string;
};

/** 성향 테스트 15문항의 선택지. 위치/지역 질문은 별도 optional step으로 분리되어 있다. */
export type TraitOption = {
  label: string;
  /** 선택 직후 보여주는 반응 문구 (없으면 바로 다음 질문으로) */
  reaction?: string;
  /** 선택 경로(decision tree)에 표시할 문장 */
  treeLabel: string;
  /** 선택 경로에 표시할 태그 (YES / NO ...) */
  treeTag: string;
  effects: Partial<Traits>;
};

export type Question = {
  id: string;
  no: number;
  prompt: string[];
  options: TraitOption[];
};

/** 15문항 종료 후 optional step: 직관 거리 중요도 */
export type ImportanceOption = {
  label: string;
  value: boolean;
};

/** 직관 거리가 중요하다고 답한 경우에만 노출되는 생활권 선택지 */
export type RegionOption = {
  id: RegionId;
  label: string;
};

export type HiddenResult = {
  id: string;
  title: string;
  lines: string[];
  matches: (traits: Traits) => boolean;
};

/** 1위-2위 궁합 격차에 따른 접전 안내 구간. (SPEC 10장) */
export type MarginBand = "tie" | "close" | "normal" | "clear";

export type TeamScore = {
  team: Team;
  /** 원본 cosine similarity, -1~1 */
  cosine: number;
  /** 지역 보너스가 반영된 cosine, -1~1로 clamp됨. 랭킹은 이 값 기준 */
  adjustedCosine: number;
  /** 화면 표시용 농구 궁합 %(0~100). calibration이 적용된 값이며 랭킹에는 쓰이지 않는다 */
  percent: number;
  locationBonus: boolean;
};

export type TestResult = {
  traits: Traits;
  locationWeight: boolean;
  region: RegionId;
  ranking: TeamScore[];
  hidden: HiddenResult | null;
  /** 1위-2위 adjustedCosine 격차 구간 */
  marginBand: MarginBand;
};
