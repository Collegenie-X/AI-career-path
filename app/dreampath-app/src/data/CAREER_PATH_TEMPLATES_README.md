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

| 필드 | 필수 | 설명 |
|------|------|------|
| type | ✓ | `activity` \| `award` \| `portfolio` \| `certification` |
| title | ✓ | 항목명 |
| months | ✓ | `[1,2,3]` 목표 월 배열 |
| links | | `[{ title, url, kind? }]` — kind: `official` \| `application` \| `reference` \| `portfolio` \| `result` |
| categoryTags | | `["project","award","paper","intern","volunteer","camp","activity"]` |
| activitySubtype | | type=activity일 때: `project` \| `intern` \| `volunteer` \| `camp` \| `research` \| `general` |

마이그레이션: `node scripts/migrate-career-templates-v2.mjs` (프로젝트 루트)

## 필터

- **전체** / **고입** / **대입** / 탐구 / 창작 / 기술 / 자연 / 연결 / 질서 / 소통 / 도전

## 대입 템플릿 추가 시

1. `career-path-templates-admission.json`에 새 객체 추가
2. `id`: `tpl-admission-{대학코드}-{학과코드}-001`
3. `category: "admission"`, `admissionTypes`, `admissionTypeStrategies`, `successStories` 포함

## 고입 템플릿 추가 시

1. `career-path-templates-highschool.json`에 새 객체 추가
2. `id`: `tpl-highschool-{유형}-001`
3. `category: "highschool"`, `schoolType`, `successStories` 포함
