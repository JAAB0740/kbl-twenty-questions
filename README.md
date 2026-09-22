# KBL 스무고개

질문 15개에 답하면 KBL 10개 구단 중 가장 잘 맞는 팀을 추천해주는 웹 테스트.
기획 내용은 [SPEC.md](SPEC.md)에 있고, 질문·반응 문구는 SPEC 6장을 그대로 따른다.

## 실행

```bash
npm install
npm run dev     # http://localhost:3211
```

```bash
npm run build   # 프로덕션 빌드
npm run typecheck
```

## 구조

```
app/
  page.tsx            랜딩 페이지
  test/page.tsx       질문 화면 (한 화면에 질문 하나, 선택 후 짧은 transition)
  result/page.tsx     결과 페이지 (Suspense 래퍼)
  layout.tsx          공통 레이아웃 / 폰트
  globals.css         Tailwind + 공통 클래스
components/
  ProgressDots.tsx    상단 진행률 표시 (15문항 기준)
  ResultView.tsx      결과 화면 본문 (client) — TOP3 + margin 안내 포함
  TraitBars.tsx       성향 막대그래프
  DecisionTree.tsx    세로형 선택 경로
data/
  questions.ts        15개 성향 질문·선택지·반응 문구·선택 경로 라벨
  locationStep.ts      위치 optional step (중요도 질문 + 생활권 9개)
  teams.ts            10개 구단 성향값, 팬 성향, 추천 이유, 주의사항
lib/
  types.ts            공용 타입
  scoring.ts          성향 계산, cosine 매칭, 히든 결과
  answers.ts          답변 <-> URL 인코딩 (15문항 + 위치중요도 + 생활권)
  shareImage.ts       1080x1920 공유 이미지 생성
```

데이터와 점수 로직은 `data/`, `lib/`에만 두고 UI 컴포넌트에는 넣지 않는다. (SPEC 15장)

## 동작 방식

- 10개 성향값은 모두 50에서 시작하고, 15개 성향 질문 선택지의 `effects`가 더해진다. (0~100 clamp)
- 팀별 기준 성향값은 SPEC 17장 표가 원본이다. `data/teams.ts`는 그 값을 옮겨둔 것이고
  임의로 조정하지 않는다.
- 궁합은 사용자 성향과 팀 성향 각각에서 50을 뺀 벡터 사이의
  **50-centered cosine similarity**로 계산한다. (SPEC 18장) 범위는 -1~1이고
  랭킹은 이 값(정확히는 지역 보너스를 더한 `adjustedCosine`) 기준으로 정렬한다.
  두 벡터 중 하나라도 magnitude가 1e-6보다 작으면 0으로 방어 처리한다.
- 위치 optional step에서 "직관 거리도 중요해요"를 선택하고 생활권이 일치하는 경우에만
  `adjustedCosine = cosine + 0.03`을 적용하고 -1~1로 clamp한다. 연고지는 취향보다
  훨씬 약한 요소다.
- 화면에 보여주는 "농구 궁합 %"는 랭킹 점수와 분리된 별도 calibration
  (`50 + 50 * sign(cos) * |cos|^1.3`)을 거친 값이며, 랭킹에는 쓰이지 않는다.
- 1위-2위 `adjustedCosine` 격차(margin)에 따라 결과 화면에 접전 안내 문구를 보여준다. (SPEC 10장)
- 히든 결과는 SPEC 8장 조건을 raw trait 값으로만 판정하며, scoring 방식과 무관하다.
  위에서부터 먼저 걸리는 하나만 보여준다.

## 결과 공유

답변은 `/result?a=<15문항><위치중요도1자리><생활권1자리>` 형태로 URL에 그대로 담긴다
(총 17자). 서버 저장소가 없어도 링크만으로 같은 결과가 재현된다.
`공유용 이미지 저장하기`를 누르면 canvas로 1080x1920 세로 이미지를 만들어 PNG로 내려받는다.

## 남은 작업

- 구단 로고·팀 컬러를 공식 자산으로 교체 (현재는 근사 컬러만 사용)
- 결과 페이지 OG 이미지(공유 미리보기) 추가
- 질문별 응답 통계 수집 여부 결정
