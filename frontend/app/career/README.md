# 커리어 패스 (Career Path) — 기능 문서

> **경로**: `frontend/app/career/`  
> **프레임워크**: Next.js 14 App Router · TypeScript · Tailwind CSS

---

## 목차

1. [개요](#1-개요)
2. [탭 구조](#2-탭-구조)
3. [파일 구조](#3-파일-구조)
4. [데이터 구조](#4-데이터-구조)
5. [탐색 탭 (Explore)](#5-탐색-탭-explore)
6. [타임라인 탭 (Timeline)](#6-타임라인-탭-timeline)
7. [커뮤니티 탭 (Community)](#7-커뮤니티-탭-community)
8. [하트(좋아요) & 즐겨찾기 시스템](#8-하트좋아요--즐겨찾기-시스템)
9. [공유 설정 시스템](#9-공유-설정-시스템)
10. [상태 관리 & 로컬스토리지](#10-상태-관리--로컬스토리지)
11. [설정 파일 (config.ts) & JSON 데이터](#11-설정-파일-configts--json-데이터)
12. [추후 백엔드 연동 포인트](#12-추후-백엔드-연동-포인트)

---

## 1. 개요

커리어 패스 기능은 학생이 자신의 진로 로드맵을 설계하고, 학교 커뮤니티 안에서 공유·탐색할 수 있는 핵심 기능입니다.

**주요 기능 요약**

| 기능 | 설명 |
|------|------|
| 커리어 패스 만들기 | 왕국(별) → 직업 → 학년별 계획 단계로 나만의 로드맵 생성 |
| 탐색 | 공식/커뮤니티 커리어 패스 템플릿 탐색 및 즐겨찾기 |
| 타임라인 | 내가 만든 커리어 패스를 WBS 형식으로 시각화 |
| 커뮤니티 | 학교 공간 / 그룹으로 커리어 패스 공유 및 소통 |
| 하트 & 즐겨찾기 | 공유된 패스에 좋아요·즐겨찾기 반응, localStorage 영속 |

---

## 2. 탭 구조

```
/career
├── 🔍 탐색 (explore)      — 커리어 패스 템플릿 탐색 + 즐겨찾기 모아보기
├── 👥 커뮤니티 (community)— 학교 공간 / 그룹
└── 🗺️ 타임라인 (timeline) — 내 커리어 패스 WBS 타임라인
```

탭 순서: **탐색 → 커뮤니티 → 타임라인**

> **빌더 탭은 별도 탭 없이** 탐색·타임라인·커뮤니티 탭 하단의 **"커리어 패스 만들기"** 버튼으로 오버레이 다이얼로그를 통해 접근합니다.

---

## 3. 파일 구조

```
frontend/app/career/
├── page.tsx                          # 메인 페이지 (탭 라우팅, 빌더 다이얼로그 관리)
├── config.ts                         # JSON에서 로드한 LABELS, COLORS, ITEM_TYPES 등 re-export
├── README.md                         # 이 문서
│
├── components/
│   ├── CareerPathList.tsx            # 탐색 탭 — 템플릿 목록 + 즐겨찾기 섹션
│   ├── CareerPathBuilder.tsx         # 빌더 다이얼로그 (단계별 커리어 패스 생성)
│   ├── CareerPathSelector.tsx        # 내 패스 선택 드롭다운
│   ├── CareerPathDetailDialog.tsx    # 템플릿 상세 다이얼로그
│   ├── VerticalTimelineList.tsx      # 타임라인 탭 — 내 커리어 패스 목록
│   │
│   └── community/
│       ├── index.ts                  # 커뮤니티 모듈 exports
│       ├── types.ts                  # TypeScript 인터페이스 정의
│       ├── CommunityTab.tsx          # 커뮤니티 탭 루트 컴포넌트
│       ├── SchoolSpaceView.tsx       # 학교 공간 뷰 (공유 패스 목록, 필터, 정렬)
│       ├── GroupListView.tsx         # 그룹 목록 뷰 (그룹 생성, 멤버, 공유 패스)
│       ├── SharedPlanCardWithReactions.tsx  # 공유 패스 카드 (하트+즐겨찾기 포함)
│       ├── SharedPlanDetailDialog.tsx       # 공유 패스 상세 다이얼로그 (코멘트)
│       └── ShareSettingsDialog.tsx          # 공유 설정 바텀시트 (전체/운영자 공유)
│
└── (Next.js 라우트 파일들)

frontend/data/
├── career-path-templates.json        # 커리어 패스 템플릿 목록
├── career-content.json               # UI 라벨·메시지 (config.ts에서 로드)
├── career-config.json                # 색상, itemTypes, gradeYears, starFilters, routes
└── share-community.json              # 학교·그룹·공유 패스 목 데이터 (meta.ui 포함)
```

---

## 4. 데이터 구조

### CareerPlan (내 커리어 패스)

```typescript
// CareerPathBuilder.tsx
type CareerPlan = {
  id: string;
  starId: string;        // 왕국 ID (예: 'tech')
  starName: string;      // 왕국 이름 (예: '기술 왕국')
  starEmoji: string;
  starColor: string;     // 왕국 테마 색상 (hex)
  jobId: string;
  jobName: string;
  jobEmoji: string;
  title: string;         // 패스 제목
  createdAt: string;     // ISO 날짜
  years: YearPlan[];     // 학년별 계획 배열
  isPublic?: boolean;    // 공유 여부
  shareType?: string;    // 'public' | 'operator'
  sharedAt?: string;     // 공유 시각
};
```

### SharedPlan (커뮤니티 공유 패스)

```typescript
// community/types.ts
interface SharedPlan {
  id: string;
  planId: string;
  ownerId: string;
  ownerName: string;
  ownerEmoji: string;
  ownerGrade: string;    // 학년 ID (예: 'mid2')
  schoolId: string;
  shareType: ShareType;  // 'public' | 'operator'
  title: string;
  jobEmoji: string;
  jobName: string;
  starName: string;
  starEmoji: string;
  starColor: string;
  yearCount: number;
  itemCount: number;
  sharedAt: string;
  likes: number;         // 기본 좋아요 수 (JSON 기준)
  bookmarks: number;     // 기본 즐겨찾기 수 (JSON 기준)
  years: SharedPlanYear[];  // 학년별 타임라인 (목표·활동·수상·자격증)
  operatorComments: OperatorComment[];
  groupIds: string[];
}
```

### UserReactionState (사용자 반응 상태)

```typescript
interface UserReactionState {
  likedPlanIds: string[];       // 좋아요한 패스 ID 목록
  bookmarkedPlanIds: string[];  // 즐겨찾기한 패스 ID 목록
}
```

---

## 5. 탐색 탭 (Explore)

**파일**: `components/CareerPathList.tsx`

### 구성 요소

| 섹션 | 설명 |
|------|------|
| 히어로 헤더 | 총 패스 수, 왕국 수, 총 사용 수 통계 |
| 즐겨찾기 섹션 | 템플릿 즐겨찾기 + 공유 패스 즐겨찾기 모아보기 (있을 때만 표시) |
| 내가 공유한 패스 | isPublic=true인 내 패스 (있을 때만 표시) |
| 왕국 필터 칩 | 전체 / 8개 왕국별 필터링 (STAR_FILTERS 기반) |
| 템플릿 목록 | 필터된 커리어 패스 템플릿 카드 |

### 즐겨찾기 연동

- **템플릿 즐겨찾기**: `template_bookmarks_v1`에 템플릿 ID 배열 저장 → 탐색 탭 상단 "즐겨찾기" 섹션에 표시
- **공유 패스 즐겨찾기**: `community_reactions_v1`의 `bookmarkedPlanIds`를 `share-community.json` 공유 패스와 매핑
- 탐색 탭에서도 하트/즐겨찾기 토글 가능 → 커뮤니티 탭과 동일한 스토리지 공유

### 하단 고정 버튼

탐색 탭에는 **"커리어 패스 만들기"** 버튼이 화면 하단에 고정되어 빌더 다이얼로그를 엽니다.

---

## 6. 타임라인 탭 (Timeline)

**파일**: `components/VerticalTimelineList.tsx`

### 기능

- 내가 만든 커리어 패스 목록을 아코디언 형태로 표시
- 각 패스를 학년별 WBS 타임라인으로 시각화
- 패스 편집, 삭제, 공유 설정 가능
- 공유 버튼 클릭 시 `ShareSettingsDialog` 오픈 → 공유 후 커뮤니티 탭으로 이동

### 공유 상태 표시

| 상태 | 표시 |
|------|------|
| 미공유 | "공유하기" 버튼 |
| 전체 공유 | 초록 배지 "전체 공유" + "공유 해제" 버튼 |
| 운영자 공유 | 보라 배지 "운영자 공유" + "공유 해제" 버튼 |

---

## 7. 커뮤니티 탭 (Community)

**파일**: `components/community/CommunityTab.tsx`

### 서브탭 구조

```
커뮤니티
├── 🏫 학교 공간 (school)
└── 👥 그룹 (groups)
```

### 학교 공간 (`SchoolSpaceView.tsx`)

- 학교 코드 입력으로 학교 참여 (JoinSchoolDialog)
- 같은 학교의 공유 패스 목록 표시
- **필터**: 학년별 (전체/중1/중2/중3 등)
- **필터**: 공유 타입 (전체/전체공유/운영자공유)
- **정렬**: 최신순 / 좋아요순 / 즐겨찾기순
- 검색: 패스 제목, 직업명, 소유자 이름

### 그룹 (`GroupListView.tsx`)

- 참여 중인 그룹 목록 카드
- 그룹 상세 뷰: 멤버 목록 + 멤버들의 공유 패스
- 새 그룹 만들기 다이얼로그 (이름, 설명 입력) — 하단 탭바에 가려지지 않도록 패널 상단 배치
- 초대 코드로 그룹 참여

### 공유 패스 상세 (`SharedPlanDetailDialog.tsx`)

- 학년별 타임라인 표시 (목표·활동·수상·자격증)
- `SharedPlan.years` 배열 기반

### 커리어 패스 만들기 버튼

커뮤니티 탭 하단에 **"커리어 패스 만들기"** 버튼이 고정되어 빌더 다이얼로그를 엽니다.

---

## 8. 하트(좋아요) & 즐겨찾기 시스템

### 동작 원리

```
사용자 액션 (하트/즐겨찾기 클릭)
    │
    ▼
setReactions (functional updater)
    ├── likedPlanIds / bookmarkedPlanIds 배열 업데이트
    └── localStorage.setItem('community_reactions_v1', ...)
    │
    ▼
setLikeCounts / setBookmarkCounts
    └── base(JSON) + 1 또는 base(JSON) + 0
```

### 카운트 계산 방식

| 상황 | 표시 카운트 |
|------|------------|
| 사용자가 좋아요 안 함 | `plan.likes` (JSON 기본값) |
| 사용자가 좋아요 함 | `plan.likes + 1` |
| 사용자가 좋아요 취소 | `plan.likes` |

> **주의**: 현재는 프론트엔드 로컬 상태만 관리합니다. 백엔드 연동 시 실제 집계 API로 교체 예정.

### 즐겨찾기 위치

| 위치 | 설명 |
|------|------|
| 탐색 탭 상단 | 템플릿 즐겨찾기 + 공유 패스 즐겨찾기 모아보기 (있을 때만 표시) |
| 탐색 탭 템플릿 상세 | 템플릿 카드/다이얼로그에 북마크 버튼 (`template_bookmarks_v1`) |
| 커뮤니티 학교 공간 | 각 공유 패스 카드에 즐겨찾기 버튼 |
| 커뮤니티 그룹 | 각 공유 패스 카드에 즐겨찾기 버튼 |
| 공유 패스 상세 다이얼로그 | 상단 액션바에 하트 + 즐겨찾기 버튼 |

### localStorage 키

| 키 | 값 | 설명 |
|----|-----|------|
| `community_reactions_v1` | `UserReactionState` JSON | 공유 패스 하트/즐겨찾기 상태 |
| `template_bookmarks_v1` | `string[]` | 템플릿 ID 배열 (탐색 탭 템플릿 즐겨찾기) |
| `career_plans_v3` | `CareerPlan[]` JSON | 내 커리어 패스 목록 |

---

## 9. 공유 설정 시스템

**파일**: `components/community/ShareSettingsDialog.tsx`

공유 설정·새 그룹 만들기 다이얼로그는 하단 탭바에 가려지지 않도록 `marginBottom: 80`, `maxHeight: calc(100vh - 80px)`로 레이아웃을 조정합니다.

### 공유 타입

| 타입 | 설명 | 대상 |
|------|------|------|
| `public` (전체 공유) | 같은 학교 친구들 + 그룹 멤버 모두 | 학교 공간 + 그룹 |
| `operator` (운영자 공유) | 진로 선생님(운영자)만 | 학교 공간 (운영자 전용) |

### 공유 흐름

```
타임라인 탭 → "공유하기" 버튼
    │
    ▼
ShareSettingsDialog (바텀시트)
    ├── "전체 공유" 선택 → isPublic=true, shareType='public'
    └── "운영자 공유" 선택 → isPublic=true, shareType='operator'
    │
    ▼
handleSharePlan() in page.tsx
    └── setActiveTab('community') — 커뮤니티 탭으로 이동
```

---

## 10. 상태 관리 & 로컬스토리지

### 상태 흐름도

```
page.tsx (최상위)
├── plans: CareerPlan[]          ← localStorage 'career_plans_v3'
├── selectedPlanId: string|null
├── builderOpen: boolean
│
├── CareerPathList (탐색 탭)
│   ├── reactions: UserReactionState  ← localStorage 'community_reactions_v1'
│   ├── templateBookmarks: string[]   ← localStorage 'template_bookmarks_v1'
│   ├── likeCounts: Record<id, number>
│   └── bookmarkCounts: Record<id, number>
│
├── VerticalTimelineList (타임라인 탭)
│   └── plans (props from page.tsx)
│
└── CommunityTab (커뮤니티 탭)
    ├── reactions: UserReactionState  ← localStorage 'community_reactions_v1'
    ├── likeCounts: Record<id, number>
    ├── bookmarkCounts: Record<id, number>
    ├── SchoolSpaceView (props drilling)
    └── GroupListView (props drilling)
```

> **탐색 탭과 커뮤니티 탭은 동일한 localStorage 키를 사용**하므로 두 탭 간 즐겨찾기/하트 상태가 자동으로 동기화됩니다.

---

## 11. 설정 파일 (config.ts) & JSON 데이터

UI 레이블·설정은 **JSON 파일에서 로드**하며, `config.ts`가 이를 re-export합니다.

```typescript
import { LABELS, COLORS, ITEM_TYPES, GRADE_YEARS, STAR_FILTERS, ROUTES } from '../config';
```

| export | 출처 | 설명 |
|--------|------|------|
| `LABELS` | `career-content.json` | 모든 UI 텍스트 (한국어) |
| `COLORS` | `career-config.json` | 테마 색상 (primary, 타입별 색상) |
| `ITEM_TYPES` | `career-config.json` | 커리어 항목 타입 (활동/수상/작품/자격증) |
| `GRADE_YEARS` | `career-config.json` | 학년 목록 (초4 ~ 고2) |
| `STAR_FILTERS` | `career-config.json` | 왕국(별) 필터 옵션 (전체/탐구/창작/기술 등) |
| `ROUTES` | `career-config.json` | 탭별 URL 경로 |

### JSON 파일 역할

| 파일 | 역할 |
|------|------|
| `career-content.json` | 페이지·탭·탐색·빌더·타임라인·커뮤니티·공유설정·반응·신고 등 UI 라벨 |
| `career-config.json` | colors, itemTypes, gradeYears, starFilters, routes |
| `share-community.json` | schools, groups, sharedPlans + meta.ui (학교/그룹 다이얼로그 라벨) |

---

## 12. 추후 백엔드 연동 포인트

| 기능 | 현재 (프론트 전용) | 백엔드 연동 시 |
|------|-------------------|---------------|
| 커리어 패스 저장 | localStorage | `POST /api/career-plans` |
| 공유 패스 목록 | `share-community.json` | `GET /api/community/plans?schoolId=` |
| 하트 토글 | localStorage 카운트 | `POST /api/community/plans/:id/like` |
| 즐겨찾기 토글 | localStorage 카운트 | `POST /api/community/plans/:id/bookmark` |
| 코멘트 작성 | `handleAddComment` (stub) | `POST /api/community/plans/:id/comments` |
| 학교 참여 | 코드 매칭 (JSON) | `POST /api/schools/join` |
| 그룹 생성 | 로컬 상태 | `POST /api/groups` |

---

*최종 업데이트: 2026-03-07 (JSON 기반 config, 탭 순서, localStorage 키 반영)*
