# 커리어 패스 템플릿 데이터 구조

커리어 패스 탐색 피드 — **고입·대입 합격** 중심. 직업 기반 템플릿은 제거됨.

> **용어 구분**: 상단 "커리어 패스 탐색" 히어로는 전체 진로 로드맵 탐색 영역이며, **대입 정보가 아님**. "대입"은 필터 칩 중 하나로, 대학 입시 합격 패스만 필터링한다.

## 패스 vs 실행 구분 (2026-09-28 개편 · 중요)

- **커리어 패스** = 큰 최종 목표(고입·대입·취업·창직)를 향해 **학년별·연도별로 무엇을 준비하는가**. 항목은 준비 마일스톤(성적·기초 / 전형·요건 / 학교 안 활동 / 대표 활동 / 점검·방향).
- **커리어 실행**(`/dreammate`) = 프로젝트·탐구·인터뷰·봉사 등을 **주차별로 어떻게 수행하는가**.
- 패스 항목에는 수행 절차(①②③, 주 N회, 몇 편·몇 건 나열)를 쓰지 않는다. 대표 활동은 year당 1건(창직은 2건)까지만 두고 `executionRef`로 연결한다.

```json
"executionRef": { "form": "project", "label": "학교 불편 1가지를 해결하는 웹앱 1건", "feedId": "tpl-project-01" }
```

- `form`: interview | report | paper | book | volunteer | project | campaign
- `feedId`(선택): `data/dreammate/seed/feedExecutionTemplates.json`의 id. 있으면 `/dreammate?tab=feed&roadmap=<id>`로 이동.
- 렌더: `app/career/components/CareerPathExecutionRefChip.tsx`
- `projectTrack`·`aiTools`는 새 항목에 쓰지 않는다(AI 도구는 `aiOrchestra`에만).
- 취업 템플릿은 개월 단위가 아니라 **연 단위**(준비 1~4년차 + 입사 1~3년차).
- 모든 year는 `gradeId`를 가진다(고입 5종은 `grade`도 함께 보유).

### 현실 반영 원칙

- 일반고는 자소서·면접 없음. 고입 자기주도학습전형 자소서에 어학 점수·교외 수상·자격증·영재교육원·올림피아드 기재 금지.
- 국내 대입에 수상·어학·자격증·개인 봉사·독서 미반영, 소논문 기재 금지 → "교과 연계 탐구보고서". 고3은 1학기까지만 수시 반영.
- Claude는 만 18세 이상 → 중·고 템플릿에 쓰지 않는다. 미성년자는 결제 연동·스토어 배포·외주 수주 단독 불가, 매출 목표 금지.
- 결과 보장형 수치(합격 1곳, 구독자 1,000명, 수익 500만원) 금지 → 통제 가능한 준비 지표.
- 링크는 공식 포털 허용 목록만. successStories는 "예시 시나리오"로 표기(화면 제목도 "준비 예시 시나리오").
- 재작성 규격·검증기: 작업 당시 scratchpad의 `SPEC.md`·`validate.py` (백업: `*.backup-2026-09-28-path-milestone`).

## 2024 대입 개편 반영 (중요)

- 자기소개서(자소서) **폐지** — 전 대학 적용. 본문에서 "자소서" 표현은 모두 "면접 답변·생기부" 기반으로 정리됨.
- 교내외 수상경력 자체는 학생부 대입 미반영 — 대회 참가 과정·결과물이 세특에 기재되는 흐름이 평가 대상.
- 독서활동·자율동아리 별도 항목 대입 미반영 — 본문은 "활동 자체로 세특·면접 소재" 톤으로 작성.
- 수능 최저는 대학·전형·연도별 변동이 크므로 본문 수치 최소화, 어디가(adiga.kr) 링크로 위임.

## 파일 구성

| 파일 | 용도 | 예시 |
|------|------|------|
| `career-path-templates-admission.json` | 대입(대학-학과) 합격 커리어 패스 | 서울대 컴공, KAIST 전기전자, 연세대 의대 등 |
| `career-path-templates-highschool.json` | 고입(영재학교·과학고·외고·자사고·마이스터고) + 일반고 대입 학종 로드맵 | KSA, 서울과고, 대원외고, 민사고, 하나고, 구미전자공고 등 |
| `career-path-templates-future.json` | 2028 대입 미래지향 가상 템플릿 (`isAiGenerated: true`) | AI 코어·피지컬AI 등 |
| `career-path-templates-venture2032.json` | **2032 창직(1인 기업) 8개 별 영역 3년 패스** (`isAiGenerated: true`) | 마이크로 SaaS·AI 영상 스튜디오·1인 리서치 랩·스몰 브랜드·1인 편집국·러닝 코치·환경 데이터 랩·AI 감사관 |
| `career-path-templates-index.ts` | 통합 인덱스 (탐색 피드용) | 고입 + 대입 + 미래 + AI 병합 export |

## highschool.json 내 schoolType 분류

`category: "highschool"`로 묶여 있으며 `schoolType`으로 구분.

| schoolType | 대상 학년 | 설명 |
|------------|-----------|------|
| `specialized-science` | 중1~중3 | 영재학교·과학고 입학 준비 (KSA·서울과고·경기과고 등) |
| `foreign-language` | 중1~중3 | 외국어고 입학 준비 (대원·명덕·한영외고 등) |
| `autonomous-private` | 중1~중3 | 전국형 자사고 입학 준비 (민사고·하나고·외대부고·상산고 등) |
| `meister-vocational` | 중1~중3 | 마이스터고·특성화고 입학 준비 (반도체·SW·바이오·게임 등) |
| `general-hs-univ-prep` | 고1~고3 | 일반고에서 대입 학종 준비 (이공계·AI / 인문사회 / 의약학 / AI·데이터) |

각 특수고 템플릿은 다음 추가 필드를 가짐:
- `recommendedFor: string[]` — 어떤 진로 분야에 유리한지
- `schoolGuide: Array<{ name, city, type, advantage }>` — 학교별 비교 가이드

## 수시·정시·유학 + 합격 후기

- **admissionTypeStrategies**: `{ 수시: "...", 정시: "...", 유학: "..." }` — 전형별 전략
- **successStories**: `[{ year, admissionType/schoolName, quote, strategy, tips }]` — 합격 선배 후기

## 아이템 v2 스키마 (years[].items[])

각 항목은 아래 필드를 가집니다. `url`만 있어도 런타임에서 `links`로 변환되며, JSON에 명시하면 더 정확합니다.

| 필드 | 필수 | 설명 |
|------|------|------|
| type | ✓ | `activity` \| `award` \| `portfolio` \| `certification` |
| title | ✓ | 항목명 |
| months | ✓ | `[1,2,3]` 목표 월 배열 |
| difficulty | | 1~5 난이도 |
| cost | | 비용 (예: 무료, 3만원) |
| organizer | | 주관/출처 |
| url | | 단일 URL (하위호환, links 우선) |
| description | | 상세 설명 |
| **links** | | `[{ title, url, kind? }]` — kind: `official` \| `application` \| `reference` \| `portfolio` \| `result` |
| **categoryTags** | | `["project","award","paper","intern","volunteer","camp","reading","campaign","activity"]` 중 해당 태그. `reading`(독서)·`campaign`(캠페인·영상)은 4대 산출물 집계용 |
| **activitySubtype** | | type=activity일 때: `project` \| `intern` \| `volunteer` \| `camp` \| `research` \| `general` |
| **aiTools** | | 사용·권장 AI/도구 배열 (예: `["ChatGPT","Claude","Notion","Python"]`) |
| **deliverable** | | 산출물 (학생부 세특·면접 답변 카드로 활용 가능한 형태) |

### 예시 (v2)

```json
{
  "type": "activity",
  "title": "KAIST 과학영재캠프 (여름)",
  "months": [7],
  "difficulty": 4,
  "cost": "무료~10만원",
  "organizer": "KAIST",
  "url": "https://gifted.kaist.ac.kr",
  "description": "KAIST 직접 운영. 입시 동기 부여.",
  "links": [{ "title": "KAIST 과학영재캠프 (여름)", "url": "https://gifted.kaist.ac.kr", "kind": "official" }],
  "categoryTags": ["activity", "camp"],
  "activitySubtype": "camp"
}
```

## 2032 창직·AI 시대 확장 필드 (전 템플릿 공통)

모든 템플릿(42종)이 아래 3개 필드를 가지며 `CareerPathAiEraSection.tsx`에서 렌더된다.

| 필드 | 설명 |
|------|------|
| `northStar` | `{ goal, proof, byWhen, ventureNote }` — 명확한 목표 1개 + **수치로 판정 가능한 달성 기준** + 창직 관점 |
| `competencyGrowth` | `{ note, axes[] }` — 축별 3단계 점수(0~100)와 **근거(evidence)**. 축: 🤖 AI 활용력 / 🧭 기획력 / 🔗 융합력 / 🚀 창직력 / 🎤 전달력 / 📚 질문력(독서 기반) |
| `aiOrchestra` | `{ note, agents[] }` — 단계별 `{ stage, tools[], use }`. 1단계 비교 → 2단계 역할 분업 → 3단계 에이전트 자동화 |

### 4대 산출물 원칙 (2026-09-28 이후 폐기)

> 패스는 준비 마일스톤만 담는다. 아래 원칙은 커리어 실행 쪽으로 넘어갔다.

모든 템플릿은 **독서 · 논문(리서치) · 프로젝트 · 캠페인(영상)** 4종 산출물을 최소 1개씩 포함한다.
독서 항목은 ReadingClue식 **1주제 3권 병렬 독서 → 문제 카드 5칸(배경·주장·반론·근거·확인 방법)** 형식으로 통일한다.

## 마이그레이션

- `scripts/migrate-career-templates-v2.mjs` — 기존 JSON에 v2 필드 일괄 추가
- 실행: `node scripts/migrate-career-templates-v2.mjs`

## 필터

- **전체** / **고입** / **대입** / 탐구 / 창작 / 기술 / 자연 / 연결 / 질서 / 소통 / 도전
