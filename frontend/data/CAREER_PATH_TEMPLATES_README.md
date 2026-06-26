# 커리어 패스 템플릿 데이터 구조

커리어 패스 탐색 피드 — **고입·대입 합격** 중심. 직업 기반 템플릿은 제거됨.

> **용어 구분**: 상단 "커리어 패스 탐색" 히어로는 전체 진로 로드맵 탐색 영역이며, **대입 정보가 아님**. "대입"은 필터 칩 중 하나로, 대학 입시 합격 패스만 필터링한다.

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
| **categoryTags** | | `["project","award","paper","intern","volunteer","camp","activity"]` 중 해당 태그 |
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

## 마이그레이션

- `scripts/migrate-career-templates-v2.mjs` — 기존 JSON에 v2 필드 일괄 추가
- 실행: `node scripts/migrate-career-templates-v2.mjs`

## 필터

- **전체** / **고입** / **대입** / 탐구 / 창작 / 기술 / 자연 / 연결 / 질서 / 소통 / 도전
