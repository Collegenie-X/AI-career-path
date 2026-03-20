# 커리어 패스 기능 문서

> 경로: `frontend/app/career/`
> 성격: 단일 라우트 기반 커리어 패스 feature module

---

## 목차

1. [개요](#1-개요)
2. [라우트 모델](#2-라우트-모델)
3. [전체 파일 구조](#3-전체-파일-구조)
4. [핵심 화면 책임](#4-핵심-화면-책임)
5. [page.tsx 상태 관리](#5-pagetsx-상태-관리)
6. [빌더 (`CareerPathBuilder`)](#6-빌더-careerPathBuilder)
7. [탐색 탭 (`CareerPathList`)](#7-탐색-탭-careerPathList)
8. [내 패스 탭 (`VerticalTimelineList`)](#8-내-패스-탭-verticaltimelinelist)
9. [커뮤니티 탭 (`CommunityTab`)](#9-커뮤니티-탭-communitytab)
10. [학교 공간 (`SchoolSpaceView`)](#10-학교-공간-schoolspaceview)
11. [그룹 (`GroupListView`)](#11-그룹-grouplistview)
12. [공유 패스 상세 (`SharedPlanDetailDialog`)](#12-공유-패스-상세-sharedplandetaildialog)
13. [커뮤니티 접근 제어](#13-커뮤니티-접근-제어)
14. [TypeScript 타입 구조](#14-typescript-타입-구조)
15. [데이터 소스와 설정](#15-데이터-소스와-설정)
16. [localStorage 키 목록](#16-localstorage-키-목록)
17. [주요 사용자 흐름](#17-주요-사용자-흐름)
18. [현재 구현 제한사항](#18-현재-구현-제한사항)
19. [백엔드 연동 포인트](#19-백엔드-연동-포인트)

---

## 1. 개요

`/career`는 여러 페이지로 나뉜 구조가 아니라, 하나의 페이지 안에서 탭과 다이얼로그로 기능을 전개하는 화면입니다.

| 영역 | 설명 |
|------|------|
| 탐색 | 공식/샘플 커리어 패스 템플릿 탐색, 즐겨찾기, 내 공개 패스 확인 |
| 커뮤니티 | 학교 공간과 그룹에서 공유 패스를 열람하고 반응/코멘트/신고 수행 |
| 내 패스 | 내가 만든 커리어 패스를 생성, 수정, 공유, 삭제 |

현재 구현은 백엔드 없이 JSON 시드 데이터와 `localStorage`를 함께 사용합니다.

---

## 2. 라우트 모델

| 항목 | 값 |
|------|----|
| 실제 라우트 | `/career` |
| 메인 탭 | `explore`, `community`, `timeline` |
| URL 동기화 | `?tab=explore\|community\|timeline` |
| 표시 방식 | 탭 전환 + 바텀시트/풀스크린 다이얼로그 |

`page.tsx`가 탭 전환, `?tab=` 반영, 내 패스 저장, 빌더 열기/닫기를 함께 관리합니다.

---

## 3. 전체 파일 구조

```text
frontend/app/career/
├── page.tsx                              # 탭 상태, 패스 저장, 빌더 오픈/닫기
├── config.ts                             # LABELS, COLORS, ITEM_TYPES, GRADE_YEARS, STAR_FILTERS, ROUTES
├── README.md                             # 이 문서
├── 커뮤니티_학교공간_그룹_운영자_설계.md
└── components/
    ├── CareerPathBuilder.tsx             # 4단계 커리어 패스 생성/수정 위자드
    ├── CareerPathDetailDialog.tsx        # 탐색 탭 템플릿 상세 다이얼로그
    ├── CareerPathList.tsx                # 탐색 탭 (템플릿 목록, 즐겨찾기, 내 공개 패스)
    ├── CareerPathSelector.tsx            # (미사용) 패스 선택 컴포넌트
    ├── CareerPathTimeline.tsx            # (미사용) 타임라인 컴포넌트
    ├── CareerPathTimelinePreview.tsx     # 빌더 Step 4 타임라인 미리보기
    ├── GoalTemplateSelector.tsx          # 빌더 Step 3 목표 템플릿 선택
    ├── ItemDetailDialog.tsx              # 내 패스 항목 상세 다이얼로그
    ├── ReportModal.tsx                   # 신고 모달 (콘텐츠/댓글)
    ├── VerticalTimelineList.tsx          # 내 패스 탭 (아코디언 목록, 인라인 수정)
    └── community/
        ├── CommunityAccessGate.tsx       # 커뮤니티 접근 권한 게이트 (초대코드/가입요청)
        ├── CommunityAdminPanel.tsx       # 운영자 패널 (가입 요청 승인/거절 UI)
        ├── CommunityTab.tsx              # 커뮤니티 탭 루트 (학교/그룹 서브탭, 반응 상태)
        ├── GroupListView.tsx             # 그룹 목록 + 그룹 상세 + 가입 다이얼로그
        ├── JoinRequestDialog.tsx         # 학교/그룹 가입 요청 다이얼로그 (re-export)
        ├── SchoolSpaceView.tsx           # 학교 목록 + 학교 상세 + 가입 다이얼로그
        ├── ShareSettingsDialog.tsx       # 공유 설정 다이얼로그 (전체/운영자 공유)
        ├── SharedPlanCardWithReactions.tsx # 공유 패스 카드 (좋아요/즐겨찾기 포함)
        ├── SharedPlanDetailDialog.tsx    # 공유 패스 상세 (타임라인/댓글/신고)
        ├── formatTime.ts                 # 시간 포맷 유틸 (formatTimeAgo, isRecentlyUpdated)
        ├── index.ts                      # re-export
        └── types.ts                      # 커뮤니티 관련 TypeScript 타입
```

---

## 4. 핵심 화면 책임

| 파일 | 책임 |
|------|------|
| `page.tsx` | 탭 상태, `career_plans_v3` 로드/저장, 빌더 오픈, 온보딩 체크 |
| `CareerPathList.tsx` | 탐색 탭: 템플릿 목록, 즐겨찾기 섹션, 내 공개 패스 섹션 |
| `CareerPathBuilder.tsx` | 4단계 커리어 패스 생성/전체 수정 위자드 |
| `VerticalTimelineList.tsx` | 내 패스 목록, 인라인 수정, 공유 설정, 삭제 |
| `CommunityTab.tsx` | 학교/그룹 서브탭, 리액션 상태, 체크 뱃지 상태, 상세 다이얼로그 제어 |
| `SchoolSpaceView.tsx` | 학교 목록, 학교 상세, 학교 가입 다이얼로그, 코드 복사/탈퇴 |
| `GroupListView.tsx` | 그룹 목록, 그룹 상세, 그룹 가입 다이얼로그, 코드 참여, 접근 게이트 |
| `SharedPlanDetailDialog.tsx` | 공유 패스 상세, 좋아요/즐겨찾기, 댓글/답글, 신고 |
| `ReportModal.tsx` | 콘텐츠/댓글 신고 플로우 (사유 선택 → 상세 입력 → 완료) |

---

## 5. page.tsx 상태 관리

```typescript
const [activeTab, setActiveTab] = useState<TabId>('explore');
const [plans, setPlans] = useState<CareerPlan[]>([]);
const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
const [editingPlan, setEditingPlan] = useState<CareerPlan | null>(null);
const [builderOpen, setBuilderOpen] = useState(false);
const [builderInitialStep, setBuilderInitialStep] = useState<number | undefined>(undefined);
const [showSignupDialog, setShowSignupDialog] = useState(false);
```

| 상태 | 역할 |
|------|------|
| `activeTab` | 현재 탭 (`'explore'` \| `'community'` \| `'timeline'`) |
| `plans` | 내 커리어 패스 배열 (`career_plans_v3`) |
| `selectedPlanId` | 현재 선택된 패스 ID (헤더 뱃지 표시용) |
| `editingPlan` | 빌더에 전달할 수정 대상 패스 |
| `builderOpen` | 빌더 풀스크린 오버레이 표시 여부 |
| `builderInitialStep` | 빌더 시작 단계 (신규: 1, 수정: 3, 템플릿: 3) |
| `showSignupDialog` | 온보딩 미완료 시 회원가입 유도 다이얼로그 |

### 주요 핸들러

| 함수 | 동작 |
|------|------|
| `openNew()` | 온보딩 체크 → 미완료면 `showSignupDialog`, 완료면 빌더 Step 1 오픈 |
| `openEdit(plan)` | 빌더 Step 3으로 수정 오픈 |
| `handleUseTemplate(template)` | 온보딩 체크 → 템플릿을 `CareerPlan`으로 변환 → 빌더 Step 3 오픈 |
| `savePlan(plan)` | 신규/수정 저장, `career_plans_v3` 업데이트, `timeline` 탭으로 이동 |
| `deletePlan(planId)` | 패스 삭제, `selectedPlanId` 갱신 |
| `updatePlanInline(plan)` | 인라인 수정 즉시 반영 (localStorage 동기 업데이트) |
| `handleSharePlan(plan, isPublic)` | 공유 시 `community` 탭으로 이동 |

---

## 6. 빌더 (`CareerPathBuilder`)

### 타입 구조

```typescript
export type PlanItem = {
  id: string;
  type: 'activity' | 'award' | 'portfolio' | 'certification';
  title: string;
  months: number[];      // 다중 월 선택 (1~12)
  difficulty: number;    // 1~5
  cost: string;
  organizer: string;
  custom?: boolean;
};

export type YearPlan = {
  gradeId: string;
  gradeLabel: string;
  goals: string[];
  items: PlanItem[];
  groups?: PlanGroup[];
};

export type CareerPlan = {
  id: string;
  starId: string;
  starName: string;
  starEmoji: string;
  starColor: string;
  jobId: string;
  jobName: string;
  jobEmoji: string;
  years: YearPlan[];
  createdAt: string;
  title: string;
  isPublic?: boolean;
  shareType?: 'public' | 'operator';
  sharedAt?: string;
};
```

### 4단계 구조

| 단계 | 제목 | 주요 데이터 | 동작 |
|------|------|-------------|------|
| Step 1 | 왕국 선택 | `career-maker.json` kingdoms | 2열 그리드, 선택 시 체크 표시 |
| Step 2 | 직업 선택 | `career-maker.json` jobs (왕국 필터) | 선택한 왕국의 직업 목록 |
| Step 3 | 계획 세우기 | `career-maker.json`, `portfolio-items.json`, `goal-templates.json` | 학년별 목표/항목 작성 |
| Step 4 | 완성! | 내부 상태 + `CareerPathTimelinePreview` | 타임라인 미리보기 후 저장 |

### Step 3 세부 동작

- 학년 탭 전환: `GRADE_YEARS` 순서 기준 (초4~고2)
- 목표 추가: `GoalTemplateSelector`에서 선택 또는 직접 입력
- 항목 추가: 추천 항목(`careerMaker.careerItems` + `portfolio-items.json` 병합) 또는 직접 추가
- 월 선택: `MonthPicker` (1~12월 다중 선택, 추천 월 프리셋 제공)
- 저장 시 `GRADE_YEARS` 순서로 정렬

### 빌더 진입 경로

| 경로 | `initialStep` | `editingPlan` |
|------|---------------|---------------|
| 새 패스 만들기 | `1` | `null` |
| 기존 패스 수정 | `3` | 수정 대상 패스 |
| 템플릿 사용 | `3` | 템플릿 → 변환된 `CareerPlan` |

---

## 7. 탐색 탭 (`CareerPathList`)

### 용어 구분

| 용어 | 의미 |
|------|------|
| **커리어 패스 탐색** | 상단 히어로 섹션 전체. 고입·대입·탐구 등 모든 유형을 포함한 진로 로드맵 탐색. **대입 정보가 아님.** |
| **대입** | 필터 칩 중 하나. 대학 입시(수시·정시·유학) 합격 커리어 패스만 필터링. |

### 섹션 구성

```text
CareerPathList
├── 히어로 (커리어 패스 탐색 — 전체 진로 로드맵, 대입 전용 아님)
├── 왕국 필터 (STAR_FILTERS: 전체 + 고입 + 대입 + 8개 왕국)
├── 즐겨찾기 섹션 (template_bookmarks_v1에 저장된 템플릿)
├── 내 공개 패스 섹션 (isPublic === true인 내 패스)
└── 전체 템플릿 목록 (career-path-templates.json, 필터 적용)
```

### 상태 관리

```typescript
const [selectedFilter, setSelectedFilter] = useState('all');
const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
const [detailTemplate, setDetailTemplate] = useState<Template | null>(null);
```

### 즐겨찾기 동작

- `template_bookmarks_v1` (localStorage) → 즐겨찾기 ID 배열
- 북마크 토글 시 즉시 localStorage 업데이트
- 즐겨찾기 섹션은 북마크된 템플릿만 표시

### 내 공개 패스 섹션

- `page.tsx`에서 `plans.filter(p => p.isPublic)` 전달
- `MyPublicPlanCard` 컴포넌트로 렌더 (공개 날짜, 학년 수, 항목 수 표시)

### 커뮤니티 즐겨찾기 섹션

- `community_reactions_v1`에서 `bookmarkedPlanIds` 읽어 표시
- `share-community.json`의 `sharedPlans`에서 해당 ID 매칭

---

## 8. 내 패스 탭 (`VerticalTimelineList`)

### 화면 구성

```text
VerticalTimelineList
├── 패스 없음 → 빈 상태 UI + "커리어 패스 만들기" 버튼
└── 패스 있음 → 아코디언 목록
    ├── 패스 헤더 (제목 인라인 수정, More 메뉴)
    │   └── More 메뉴: 전체 수정 / 공유 설정 / 삭제
    └── 학년별 섹션 (펼치기/접기)
        ├── 목표 목록 (인라인 수정/삭제)
        ├── 항목 목록 (체크박스, 클릭 시 ItemDetailDialog)
        └── 항목 추가 버튼
```

### 인라인 수정 동작

- **제목**: `InlineTitle` 컴포넌트, 클릭 시 input으로 전환, blur/Enter로 저장
- **목표**: `GoalRow` 컴포넌트, 클릭 시 input으로 전환, 빈 값이면 삭제
- **항목 체크**: `checked` 필드 토글, `updatePlanInline` 즉시 반영

### 공유 설정 (`ShareSettingsDialog`)

| 공유 타입 | 설명 |
|-----------|------|
| `public` | 전체 공유 — 같은 학교 친구들과 그룹 멤버 모두 열람 가능 |
| `operator` | 운영자 공유 — 진로 선생님만 열람 가능 (비공개) |

- 공유 확인 시 `isPublic = true`, `shareType`, `sharedAt` 업데이트
- 비공개 전환 시 `isPublic = false`, `shareType = undefined` 초기화

---

## 9. 커뮤니티 탭 (`CommunityTab`)

### 서브탭

```text
[학교 공간 🏫]  [그룹 👥]
```

### 상태 관리

```typescript
const [subTab, setSubTab] = useState<'school' | 'groups'>('school');
const [selectedPlan, setSelectedPlan] = useState<SharedPlan | null>(null);
const [hasAccess, setHasAccess] = useState(false);
const [joinedSchoolIds, setJoinedSchoolIds] = useState<string[]>([]);
const [joinedGroupIds, setJoinedGroupIds] = useState<string[]>([]);
const [reactions, setReactions] = useState<UserReactionState>({ likedPlanIds: [], bookmarkedPlanIds: [] });
const [likeCounts, setLikeCounts] = useState<Record<string, number>>(/* JSON 기본값 */);
const [bookmarkCounts, setBookmarkCounts] = useState<Record<string, number>>(/* JSON 기본값 */);
const [checkedPlans, setCheckedPlans] = useState<Record<string, string>>(/* localStorage */);
```

### 리액션 카운트 계산

- 초기값: `share-community.json`의 `sharedPlans[].likes`, `sharedPlans[].bookmarks`
- 사용자 반응 delta를 더해 표시 (서버 재조회 없음)
- `community_reactions_v1` (localStorage) → `{ likedPlanIds: [], bookmarkedPlanIds: [] }`

### 확인 필요 뱃지

- `community_checked_plans_v1` (localStorage) → `{ [planId]: timestamp }`
- 상세 다이얼로그 열람 시 해당 패스를 '확인함'으로 기록
- 미확인 패스에 뱃지 표시

---

## 10. 학교 공간 (`SchoolSpaceView`)

### 화면 전환 흐름

```text
학교 목록
  └── 학교 카드 클릭
        ├── 미가입 → JoinRequestDialog
        └── 가입 → 학교 상세 (SchoolDetailView)
              ├── 검색 필터
              ├── 공유 타입 필터 (전체/공개/운영자)
              ├── 정렬 (최신/좋아요)
              └── SharedPlanCardWithReactions × N
```

### 학교 카드 뱃지

| 조건 | 뱃지 |
|------|------|
| `school.operatorId === 'me'` | 👑 운영 중 (황금색) |
| `joinedSchoolIds.includes(school.id)` | ⭐ 참여 중 (초록색) |

### 학교 상세 More 메뉴 (가입 학교)

- 학교 코드 복사 (`school.code`)
- 학교 탈퇴 → `leaveSchool(id)` → `career_joined_schools` 업데이트

---

## 11. 그룹 (`GroupListView`)

### 화면 전환 흐름

```text
그룹 목록
  └── 그룹 카드 클릭
        ├── 미가입 → JoinRequestDialog
        └── 가입 → 커뮤니티 접근 권한 확인
              ├── 미접근 → CommunityAccessGate
              └── 접근 → 그룹 상세 (GroupDetailView)
                    ├── 멤버 목록
                    └── SharedPlanCardWithReactions × N
```

### 그룹 목록 하단 버튼

- **새 그룹 만들기**: `CreateGroupDialog` 오픈 (UI만 존재, 실제 저장 미구현)
- **코드로 참여**: `JoinGroupByCodeDialog` 오픈 (초대 코드 입력)

### 그룹 상세 More 메뉴 (가입 그룹)

- 초대 코드 복사 (`group.inviteCode`)
- 그룹 탈퇴 → `leaveGroup(id)` → `career_joined_groups` 업데이트

### `isRecentlyUpdated` 뱃지

- `formatTime.ts`의 `isRecentlyUpdated(date)` — 7일 이내 업데이트 시 `NEW` 뱃지 표시

---

## 12. 공유 패스 상세 (`SharedPlanDetailDialog`)

### 탭 구조

| 탭 | 내용 |
|----|------|
| 타임라인 | 학년별 목표/항목 아코디언 (YearSection) |
| 코멘트 | 댓글/답글 트리, 댓글 작성 |

### 댓글 트리 구조

```typescript
// flat → tree 변환
function buildCommentTree(comments: OperatorComment[]): OperatorCommentNode[]
// parentId 없음 → 최상위, parentId 있음 → 해당 댓글의 replies에 삽입
```

- 새 댓글/답글은 로컬 state에만 반영 (새로고침 후 유지 안 됨)
- `CornerDownRight` 아이콘으로 답글 들여쓰기

### 좋아요/즐겨찾기

- `CommunityTab`에서 `onReactionChange` 콜백으로 상태 끌어올림
- 토글 시 `community_reactions_v1` localStorage 업데이트

### 신고 (`ReportModal`)

- 신고 대상: `'plan'` (콘텐츠) | `'comment'` (댓글)
- 플로우: 사유 선택 → 상세 입력 → 완료 메시지
- `report-reasons.json`에서 신고 사유 목록 로드

---

## 13. 커뮤니티 접근 제어

### 학교/그룹 가입 (`JoinRequestDialog`)

공통 컴포넌트 (`@/components/community/JoinRequestDialog`)를 re-export.

- 미가입 상태에서 학교/그룹 카드 클릭 시 표시
- 가입 요청 → 즉시 `joinSchool(id)` / `joinGroup(id)` 호출 (데모: 즉시 승인)
- 가입 상태는 `career_joined_schools` / `career_joined_groups` (localStorage)

### 전역 커뮤니티 접근 (`CommunityAccessGate`)

그룹 상세 진입 시 `hasCommunityAccess()` 확인.

| 방법 | 동작 |
|------|------|
| 초대 코드 입력 | `DREAM2024` 입력 시 즉시 접근 허용 |
| 가입 요청 | 자기소개 입력 후 즉시 접근 허용 (데모) |

### localStorage 키 (접근 제어)

| 키 | 설명 |
|----|------|
| `launchpad_community_access` | 커뮤니티 접근 허용 여부 |
| `launchpad_community_join_requests` | 가입 요청 목록 |
| `launchpad_community_my_request_id` | 현재 사용자 요청 ID |

> `career`의 그룹 커뮤니티 접근 제어는 `launchpad`와 동일한 공용 스토리지를 사용합니다.

---

## 14. TypeScript 타입 구조

### `CareerPathBuilder.tsx` 타입

```typescript
type PlanItem = {
  id: string;
  type: 'activity' | 'award' | 'portfolio' | 'certification';
  title: string;
  months: number[];
  difficulty: number;
  cost: string;
  organizer: string;
  custom?: boolean;
};

type YearPlan = {
  gradeId: string;
  gradeLabel: string;
  goals: string[];
  items: PlanItem[];
  groups?: PlanGroup[];
};

type CareerPlan = {
  id: string;
  starId: string; starName: string; starEmoji: string; starColor: string;
  jobId: string; jobName: string; jobEmoji: string;
  years: YearPlan[];
  createdAt: string;
  title: string;
  isPublic?: boolean;
  shareType?: 'public' | 'operator';
  sharedAt?: string;
};
```

### `community/types.ts` 주요 타입

```typescript
type ShareType = 'public' | 'operator';

interface SharedPlan {
  id: string;
  ownerId: string; ownerName: string; ownerEmoji: string; ownerGrade: string;
  schoolId: string;
  shareType: ShareType;
  title: string;
  jobEmoji: string; jobName: string;
  starName: string; starEmoji: string; starColor: string;
  yearCount: number; itemCount: number;
  sharedAt: string; updatedAt?: string;
  likes: number; bookmarks: number;
  years: SharedPlanYear[];
  operatorComments: OperatorComment[];
  groupIds: string[];
}

interface OperatorComment {
  id: string;
  parentId?: string;   // 없으면 최상위, 있으면 대댓글
  authorId: string; authorName: string; authorEmoji: string;
  authorRole: 'operator' | 'peer';
  content: string;
  createdAt: string;
}

interface CommunityGroup {
  id: string;
  name: string; emoji: string; description: string; color: string;
  creatorId: string; creatorName: string;
  memberCount: number; members: GroupMember[];
  sharedPlanCount: number;
  inviteCode?: string;
  createdAt: string; updatedAt?: string;
  isOperatorTest?: boolean;
}

interface School {
  id: string;
  name: string; code: string;
  operatorId: string; operatorName: string; operatorEmoji: string;
  grades: string[];
  memberCount: number;
  createdAt: string; updatedAt?: string;
}
```

---

## 15. 데이터 소스와 설정

### `config.ts` export 목록

| export | 출처 | 설명 |
|--------|------|------|
| `LABELS` | `career-content.json` | UI 텍스트, 메시지 |
| `COLORS` | `career-config.json` | 테마 색상 (primary, activity, award 등) |
| `ITEM_TYPES` | `career-config.json` | 항목 타입 정의 (value, label, color, emoji) |
| `GRADE_YEARS` | `career-config.json` | 학년 목록 (초4~고2, id/label/fullLabel/order) |
| `STAR_FILTERS` | `career-config.json` | 왕국 필터 옵션 |
| `ROUTES` | `career-config.json` | 경로 설정 |

### 주요 JSON 데이터 파일

| 파일 | 사용처 |
|------|--------|
| `frontend/data/career-path-templates.json` | 탐색 탭 템플릿 목록 |
| `frontend/data/career-maker.json` | 빌더 왕국/직업/추천 항목 |
| `frontend/data/portfolio-items.json` | 빌더 포트폴리오 추천 항목 |
| `frontend/data/goal-templates.json` | 목표 템플릿 |
| `frontend/data/share-community.json` | 학교, 그룹, 공유 패스, 댓글 시드 |
| `frontend/data/report-reasons.json` | 신고 사유 목록 |
| `frontend/data/career-content.json` | UI 라벨/문구 |
| `frontend/data/career-config.json` | 색상, 타입, 학년, 라우트 |

> **주의**: `CareerPathList.tsx`는 `STAR_FILTERS` 상수를 내부에 별도 선언하고 있습니다. `config.ts`의 `STAR_FILTERS`와 중복 상태이므로 추후 통합이 필요합니다.

---

## 16. localStorage 키 목록

### 커리어 패스

| 키 | 타입 | 설명 |
|----|------|------|
| `career_plans_v3` | `CareerPlan[]` | 내 커리어 패스 배열 |

### 탐색/커뮤니티 반응

| 키 | 타입 | 설명 |
|----|------|------|
| `template_bookmarks_v1` | `string[]` | 탐색 템플릿 즐겨찾기 ID 목록 |
| `community_reactions_v1` | `UserReactionState` | 공유 패스 좋아요/즐겨찾기 ID 목록 |
| `community_checked_plans_v1` | `Record<string, string>` | 확인한 패스 ID → timestamp |

### 커뮤니티 가입 상태

| 키 | 타입 | 설명 |
|----|------|------|
| `career_joined_schools` | `string[]` | 가입한 학교 ID 목록 |
| `career_joined_groups` | `string[]` | 가입한 그룹 ID 목록 |

### 전역 커뮤니티 접근 (launchpad 공용)

| 키 | 타입 | 설명 |
|----|------|------|
| `launchpad_community_access` | `boolean` | 커뮤니티 접근 허용 여부 |
| `launchpad_community_join_requests` | `object[]` | 가입 요청 목록 |
| `launchpad_community_my_request_id` | `string` | 현재 사용자 요청 ID |

---

## 17. 주요 사용자 흐름

### 1. 템플릿 기반 시작

```text
1. 탐색 탭에서 템플릿 카드 클릭 → CareerPathDetailDialog 오픈
2. "이 패스 사용하기" 클릭
3. 온보딩 체크 → 미완료면 회원가입 유도 다이얼로그
4. 템플릿 → CareerPlan 변환 (id, createdAt 신규 생성)
5. 빌더 Step 3으로 진입 (왕국/직업은 템플릿 값 사용)
6. 저장 후 내 패스 탭으로 이동
```

### 2. 새 커리어 패스 만들기

```text
1. 하단 "커리어 패스 만들기" 버튼 클릭
2. 온보딩 미완료 → 회원가입 유도 다이얼로그 표시
3. Step 1: 왕국 선택 (2열 그리드)
4. Step 2: 직업 선택 (왕국 필터 적용)
5. Step 3: 학년별 목표/항목 작성
6. Step 4: 타임라인 미리보기 후 저장
```

### 3. 내 패스 관리

```text
1. 내 패스 탭에서 아코디언 목록 확인
2. 제목/목표 클릭 → 인라인 수정
3. 항목 클릭 → ItemDetailDialog 상세 확인
4. More 메뉴 → 전체 수정 / 공유 설정 / 삭제
5. 공유 설정 → ShareSettingsDialog (전체/운영자 선택)
6. 공유 직후 커뮤니티 탭으로 이동
```

### 4. 학교 공간 이용

```text
1. 커뮤니티 탭 → 학교 공간 서브탭
2. 학교 카드 클릭
3. 미가입 → JoinRequestDialog (즉시 가입)
4. 가입 → 학교 상세 진입
5. 검색/필터/정렬로 공유 패스 탐색
6. 카드 클릭 → SharedPlanDetailDialog
```

### 5. 그룹 이용

```text
1. 커뮤니티 탭 → 그룹 서브탭
2. 그룹 카드 클릭
3. 미가입 → JoinRequestDialog (즉시 가입)
4. 가입 → 커뮤니티 접근 권한 확인
5. 미접근 → CommunityAccessGate (초대코드 DREAM2024 또는 가입요청)
6. 접근 → 그룹 상세 진입
```

### 6. 공유 패스 상호작용

```text
1. 카드 클릭 → SharedPlanDetailDialog 오픈
2. 타임라인 탭: 학년별 계획 확인 (아코디언)
3. 코멘트 탭: 댓글/답글 작성 (로컬 state)
4. 좋아요/즐겨찾기 토글 (community_reactions_v1 업데이트)
5. More 메뉴 → 콘텐츠 신고 (ReportModal)
6. 댓글 More 메뉴 → 댓글 신고 (ReportModal)
```

---

## 18. 현재 구현 제한사항

| 항목 | 현재 상태 |
|------|-----------|
| 커뮤니티 목록 | `share-community.json` 시드 데이터 기반 (정적) |
| 새 그룹 만들기 | UI(`CreateGroupDialog`)만 존재, 실제 목록에 저장 안 됨 |
| 댓글 작성 | 상세 다이얼로그 로컬 state에만 반영, 새로고침 후 유지 안 됨 |
| 학교/그룹 가입 | 데모 성격으로 즉시 승인 |
| 커뮤니티 접근 | 초대코드(`DREAM2024`) 또는 가입요청 시 즉시 승인 |
| 공유 패스 | `VerticalTimelineList`에서 공유 설정 후 커뮤니티 JSON에 실제 추가 안 됨 |
| `CareerPathSelector.tsx` | 현재 메인 진입 흐름에서 미사용 |
| `CareerPathTimeline.tsx` | 현재 메인 진입 흐름에서 미사용 |
| `STAR_FILTERS` | `config.ts`와 `CareerPathList.tsx`에 중복 선언 |

---

## 19. 백엔드 연동 포인트

| 기능 | 현재 | 이후 API 예시 |
|------|------|---------------|
| 내 패스 저장 | `career_plans_v3` (localStorage) | `POST /api/career-plans` |
| 템플릿 조회 | 정적 JSON | `GET /api/career-templates` |
| 공유 패스 목록 | 정적 JSON | `GET /api/community/plans` |
| 댓글/답글 | 로컬 state | `POST /api/community/plans/:id/comments` |
| 좋아요/즐겨찾기 | 로컬 delta | `POST /api/community/plans/:id/reactions` |
| 학교/그룹 가입 | localStorage 직접 저장 | `POST /api/community/join` |
| 그룹 생성 | UI만 존재 | `POST /api/groups` |
| 신고 | 모달만 존재 | `POST /api/reports` |
| 커뮤니티 접근 | localStorage 즉시 승인 | `POST /api/community/access-request` |

---

## 관련 문서

- `frontend/app/career/커뮤니티_학교공간_그룹_운영자_설계.md`

---

최종 업데이트: `2026-03-09`
