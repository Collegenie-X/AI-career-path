# 커리어 패스 템플릿 데이터 구조

드림 패스 탐색 피드 — **고입·대입 합격** 중심. 직업 기반 템플릿은 제거됨.

## 파일 구성

| 파일 | 용도 | 예시 |
|------|------|------|
| `career-path-templates-admission.json` | 대입(대학-학과) 합격 커리어 패스 | 서울대 컴공, KAIST 전기전자, 연세대 의대 등 |
| `career-path-templates-highschool.json` | 고입(과학고·외고·자사고) 합격 커리어 패스 | KSA, 과학고, 외고, 자사고 등 |
| `career-path-templates-index.ts` | 통합 인덱스 (탐색 피드용) | 고입 + 대입 병합 export |

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
