# Career Plan (DreamMate) Frontend-Backend Integration

> **작성일**: 2026-03-29  
> **프론트엔드**: `/frontend/app/dreammate`  
> **백엔드**: `/backend/apps/career_plan`  
> **API 베이스**: `/api/v1/career-plan/` (프로젝트 `urls` 설정 기준)

---

## 개요

DreamMate(커리어 실행)는 **로드맵·드림 자료·드림 스페이스·공유 로드맵**을 다룹니다. 커뮤니티 공유 측면에서는 **`career_path.SharedPlan`과 동일한 통계 필드 패턴**(좋아요·북마크·조회·댓글·**신고**)과 **원본 엔티티당 공유 1행** 제약을 사용합니다.

| career_path | career_plan (DreamMate) |
|-------------|-------------------------|
| `CareerPlan` | `Roadmap` |
| `SharedPlan` | `SharedDreamRoadmap` |
| `SharedPlanGroup` | `SharedDreamRoadmapGroup` |

---

## 주요 모델 ↔ API 리소스

| 리소스 | 모델 | 비고 |
|--------|------|------|
| 로드맵 | `Roadmap` | 활동 `RoadmapItem`, TODO `RoadmapTodo`, 마일스톤 `RoadmapMilestone` |
| 공유 로드맵 | `SharedDreamRoadmap` | `roadmap` FK에 **UniqueConstraint** (로드맵당 1행) |
| 드림 자료 | `DreamResource` | 섹션 `ResourceSection` |
| 드림 스페이스 | `DreamSpace` | 참여자 `SpaceParticipant`, 그룹은 `apps.community.Group` |

---

## 프론트 설정 JSON

프론트는 `frontend/data/dreammate/config/` 아래에서 라벨·탭·필터·히어로 등을 관리합니다.

- `meta.json` — 앱 메타(표시명, API 네임스페이스 힌트)
- `backendModelMap.json` — UI 도메인과 Django 앱 모델 이름 매핑
- `tabs.json` — 메인 탭 정의(선택: `description`, `routeHint`)

`frontend/app/dreammate/config.ts`에서 위 파일을 import하여 상수로 노출합니다.

---

## 운영자(Admin)

- **로드맵** 변경 화면: 활동·주차 TODO·마일스톤 **통합 보기** + 인라인 편집
- **공유 드림 로드맵** 인라인: 로드맵당 최대 1행 (`SharedDreamRoadmapInline`)

자세한 엔드포인트는 `README.md`를 참고하세요.
