import type { Question } from "@/lib/types";

/**
 * 베타1 15문항. 질문 문구·반응 문구·trait 델타는 SPEC.md 6장을 그대로 따른다.
 * UI 컴포넌트에서 문구나 델타를 바꾸지 않는다.
 *
 * 위치(직관 거리)·생활권 질문은 이 15문항에 포함되지 않는다.
 * 테스트 종료 후 별도 optional step(data/locationStep.ts)에서 처리한다.
 *
 * 핵심 trait는 ±15, 보조 trait는 ±5 또는 ±10을 기본으로 하고
 * 한 선택지가 건드리는 trait는 최대 3개다. (SPEC 6장 원칙)
 */
export const QUESTIONS: Question[] = [
  {
    id: "q1",
    no: 1,
    prompt: ["스포츠는 결국", "무엇으로 기억되는가?"],
    options: [
      {
        label: "결국 이겼는지가 제일 중요하다",
        effects: { winning: 15, storyline: -5, patience: -5 },
        treeLabel: "결과가 제일 중요하다",
        treeTag: "YES",
      },
      {
        label: "어떻게 싸웠는지가 더 오래 남는다",
        effects: { winning: -15, storyline: 5, patience: 5 },
        reaction:
          "결과보다 서사파시군요. 감독 인터뷰까지 챙겨보실 준비 되셨습니다.",
        treeLabel: "결과가 제일 중요하다",
        treeTag: "NO",
      },
    ],
  },
  {
    id: "q2",
    no: 2,
    prompt: ["경기 종료 10초 전 동점.", "공을 누구에게 주고 싶은가?"],
    options: [
      {
        label: "에이스. 그냥 네가 해.",
        effects: { star: 15, chaos: 5, defense: -5 },
        reaction: "감독보다 에이스를 믿는 타입이군요.",
        treeLabel: "마지막 공은 에이스에게",
        treeTag: "YES",
      },
      {
        label: "약속된 세트플레이로 확실하게.",
        effects: { defense: 10, chaos: -5 },
        treeLabel: "마지막 공은 에이스에게",
        treeTag: "NO",
      },
    ],
  },
  {
    id: "q3",
    no: 3,
    prompt: ["어떤 스코어가 더 재미있는가?"],
    options: [
      {
        label: "105 : 103",
        effects: { offense: 15, chaos: 5 },
        treeLabel: "점수가 많이 나야 재밌다",
        treeTag: "YES",
      },
      {
        label: "68 : 65",
        effects: { defense: 15, chaos: -5 },
        reaction: "점수가 안 나도 괜찮으시군요. 귀한 분입니다.",
        treeLabel: "점수가 많이 나야 재밌다",
        treeTag: "NO",
      },
    ],
  },
  {
    id: "q4",
    no: 4,
    prompt: ["팀에 한 명만 있다면?"],
    options: [
      {
        label: "리그 최고의 슈퍼스타",
        effects: { star: 15 },
        treeLabel: "슈퍼스타가 있어야 한다",
        treeTag: "YES",
      },
      {
        label: "이름값보다 손발 맞는 5명",
        effects: { star: -15, defense: 10 },
        treeLabel: "슈퍼스타가 있어야 한다",
        treeTag: "NO",
      },
    ],
  },
  {
    id: "q5",
    no: 5,
    prompt: ["더 끌리는 팀의 이야기는?"],
    options: [
      {
        label: "우승 역사가 많은 전통의 명가",
        effects: { tradition: 15, winning: 5, underdog: -5 },
        treeLabel: "전통의 명가가 좋다",
        treeTag: "YES",
      },
      {
        label: "지금부터 역사를 새로 쓰는 팀",
        effects: { tradition: -15, underdog: 10, winning: -5 },
        reaction: "주식도 저점에서 사시는 편인가요?",
        treeLabel: "전통의 명가가 좋다",
        treeTag: "NO",
      },
      {
        label: "전통 있는 팀이 새 얼굴로 다시 시대를 여는 것",
        effects: { tradition: 15, youth: 10 },
        reaction: "왕조의 다음 장을 직접 보고 싶은 타입이군요.",
        treeLabel: "명가의 세대교체가 좋다",
        treeTag: "YES",
      },
    ],
  },
  {
    id: "q6",
    no: 6,
    prompt: ["응원팀이 6연패 중이다."],
    options: [
      {
        label: "솔직히 힘들다",
        effects: { winning: 5, patience: -15 },
        treeLabel: "6연패도 버틸 수 있다",
        treeTag: "NO",
      },
      {
        label: "이상하게 더 정이 간다",
        effects: { patience: 15, underdog: 10 },
        reaction: "위험 신호가 감지됐습니다.",
        treeLabel: "6연패도 버틸 수 있다",
        treeTag: "YES",
      },
    ],
  },
  {
    id: "q7",
    no: 7,
    prompt: ["둘 중 하나만 고른다면?"],
    options: [
      {
        label: "매년 플레이오프 가는 꾸준한 강팀",
        effects: { winning: 10, chaos: -10, tradition: 5 },
        treeLabel: "꾸준한 강팀이 좋다",
        treeTag: "YES",
      },
      {
        label: "정규시즌 몰라도 큰 경기에서 미치는 팀",
        effects: { chaos: 15, storyline: 10, defense: -5 },
        reaction: "정규시즌은 긴 예고편일 뿐이라고 생각하시는군요.",
        treeLabel: "꾸준한 강팀이 좋다",
        treeTag: "NO",
      },
    ],
  },
  {
    id: "q8",
    no: 8,
    prompt: ["농구장에서 제일 보고 싶은 장면은?"],
    options: [
      {
        label: "3점이 연속으로 꽂히는 순간",
        effects: { offense: 10, chaos: 5 },
        treeLabel: "3점 폭격이 보고 싶다",
        treeTag: "YES",
      },
      {
        label: "상대 공격을 완전히 막는 순간",
        effects: { defense: 15 },
        treeLabel: "3점 폭격이 보고 싶다",
        treeTag: "NO",
      },
    ],
  },
  {
    id: "q9",
    no: 9,
    prompt: ["15점 앞서던 팀이", "4쿼터에 갑자기 1점 차가 됐다."],
    options: [
      {
        label: "이런 게 스포츠지!",
        effects: { chaos: 15, patience: 5 },
        reaction: "심혈관 건강에 자신이 있으시군요.",
        treeLabel: "롤러코스터 OK",
        treeTag: "YES",
      },
      {
        label: "리드는 끝까지 지켜야 리드다.",
        effects: { chaos: -15, defense: 5, offense: -5 },
        reaction: "불안을 즐기지 않는 것도 재능입니다.",
        treeLabel: "롤러코스터 OK",
        treeTag: "NO",
      },
    ],
  },
  {
    id: "q10",
    no: 10,
    prompt: ["더 마음이 가는 선수는?"],
    options: [
      {
        label: "공 잡을 때마다 관중이 술렁이는 스타",
        effects: { star: 15, offense: 5 },
        treeLabel: "스타가 좋다",
        treeTag: "YES",
      },
      {
        label: "기록엔 안 보여도 궂은일 다 하는 선수",
        effects: { star: -10, storyline: 10 },
        treeLabel: "스타가 좋다",
        treeTag: "NO",
      },
    ],
  },
  {
    id: "q11",
    no: 11,
    prompt: ["팀을 보는 재미라면?"],
    options: [
      {
        label: "완성된 선수들이 우승에 도전하는 것",
        effects: { youth: -15, winning: 5 },
        treeLabel: "완성된 팀이 좋다",
        treeTag: "YES",
      },
      {
        label: "어린 선수들이 하나씩 성장하는 것",
        effects: { youth: 15, patience: 10 },
        reaction: "결과보다 육성일지를 즐기는 타입입니다.",
        treeLabel: "완성된 팀이 좋다",
        treeTag: "NO",
      },
    ],
  },
  {
    id: "q12",
    no: 12,
    prompt: ["친구가", "왜 하필 그 팀이야?", "라고 물었다."],
    options: [
      {
        label: "잘하니까.",
        effects: { winning: 10 },
        treeLabel: "잘하니까 좋아한다",
        treeTag: "YES",
      },
      {
        label: "유명한 선수가 있으니까.",
        effects: { star: 10 },
        treeLabel: "선수 보고 좋아한다",
        treeTag: "YES",
      },
      {
        label: "아무도 안 좋아할 때부터 내가 좋아했으니까.",
        effects: { underdog: 15, storyline: 5 },
        treeLabel: "남들보다 먼저 좋아했다",
        treeTag: "YES",
      },
      {
        label: "나도 모르겠다. 어느 순간 그렇게 됐다.",
        effects: { storyline: 15, chaos: 5 },
        reaction: "팬이 되는 가장 정확한 이유입니다.",
        treeLabel: "이유는 나도 모른다",
        treeTag: "YES",
      },
    ],
  },
  {
    id: "q13",
    no: 13,
    prompt: ["어느 쪽이 더 끌리는가?"],
    options: [
      {
        label: "검증된 강팀이 꾸준히 잘하는 것",
        effects: { underdog: -15, winning: 10 },
        reaction: "이미 증명된 걸 좋아하시는군요. 안전한 선택입니다.",
        treeLabel: "검증된 강팀이 좋다",
        treeTag: "YES",
      },
      {
        label: "아직 주목받지 못한 팀이 성장해서 치고 올라오는 것",
        effects: { underdog: 10, youth: 5 },
        reaction: "남들이 알아보기 전에 먼저 알아보는 타입이군요.",
        treeLabel: "검증된 강팀이 좋다",
        treeTag: "NO",
      },
    ],
  },
  {
    id: "q14",
    no: 14,
    prompt: ["좋아하는 농구 콘텐츠는?"],
    options: [
      {
        label: "그 팀 다큐멘터리, 감독·선수 인터뷰까지 다 챙겨본다",
        effects: { storyline: 15 },
        treeLabel: "이야기까지 챙겨본다",
        treeTag: "YES",
      },
      {
        label: "스탯이랑 순위표만 보면 충분하다",
        effects: { storyline: -15, offense: 5 },
        reaction: "당신에게 필요한 건 이야기가 아니라 데이터입니다.",
        treeLabel: "이야기까지 챙겨본다",
        treeTag: "NO",
      },
    ],
  },
  {
    id: "q15",
    no: 15,
    prompt: ["이런 쪽에 더 마음이 간다."],
    options: [
      {
        label: "신생팀 특유의 새 로고·유니폼·마스코트가 좋다",
        effects: { tradition: -10 },
        reaction: "취향이 힙합니다.",
        treeLabel: "신생팀 감성이 좋다",
        treeTag: "YES",
      },
      {
        label: "오래된 팀 특유의 클래식한 색깔과 분위기가 좋다",
        effects: { tradition: 10, defense: 5 },
        treeLabel: "신생팀 감성이 좋다",
        treeTag: "NO",
      },
    ],
  },
];

export const TOTAL_QUESTIONS = QUESTIONS.length;
