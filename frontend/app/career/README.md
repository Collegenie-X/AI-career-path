# 커리어 패스 (Career Path) — 기능 문서

> **경로**: `frontend/app/career/`  
> **프레임워크**: Next.js 14 App Router · TypeScript · Tailwind CSS · Framer Motion

---

## 목차

1. [개요](#1-개요)
2. [탭 구조](#2-탭-구조)
3. [전체 파일 구조](#3-전체-파일-구조)
4. [데이터 구조 (TypeScript 타입)](#4-데이터-구조-typescript-타입)
5. [메인 페이지 (`page.tsx`)](#5-메인-페이지-pagetsx)
6. [탐색 탭 (`CareerPathList`)](#6-탐색-탭-careerpathlist)
7. [빌더 다이얼로그 (`CareerPathBuilder`)](#7-빌더-다이얼로그-careerpathbuilder)
8. [타임라인 탭 (`VerticalTimelineList`)](#8-타임라인-탭-verticaltimelinelist)
9. [커뮤니티 탭 (`CommunityTab`)](#9-커뮤니티-탭-communitytab)
10. [하트·즐겨찾기 시스템](#10-하트즐겨찾기-시스템)
11. [공유 설정 시스템 (`ShareSettingsDialog`)](#11-공유-설정-시스템-sharесettingsdialog)
12. [유저 시나리오](#12-유저-시나리오)
13. [순서도 (플로우차트)](#13-순서도-플로우차트)
14. [컴포넌트 Props 명세](#14-컴포넌트-props-명세)
15. [설정 파일 & JSON 데이터](#15-설정-파일--json-데이터)
16. [localStorage 키 목록](#16-localstorage-키-목록)
17. [추후 백엔드 연동 포인트](#17-추후-백엔드-연동-포인트)

---

## 1. 개요

커리어 패스 기능은 학생이 자신의 진로 로드맵을 **직접 설계**하고, 학교 커뮤니티 안에서 **공유·탐색**할 수 있는 핵심 기능입니다.

**주요 기능 요약**

| 기능 | 설명 |
|------|------|
| 커리어 패스 만들기 | 왕국(별) → 직업 → 학년별 계획 4단계로 나만의 로드맵 생성 |
| 탐색 | 공식/커뮤니티 커리어 패스 템플릿 탐색 및 즐겨찾기 |
| 타임라인 | 내가 만든 커리어 패스를 WBS 형식으로 시각화·편집 |
| 커뮤니티 | 학교 공간 / 그룹으로 커리어 패스 공유 및 소통 |
| 하트 & 즐겨찾기 | 공유된 패스에 좋아요·즐겨찾기 반응, localStorage 영속 |

---

## 2. 탭 구조

```
/career
├── 🔍 탐색 (explore)       — 커리어 패스 템플릿 탐색 + 즐겨찾기 모아보기
├── 👥 커뮤니티 (community) — 학교 공간 / 그룹
└── 🗺️ 타임라인 (timeline)  — 내 커리어 패스 WBS 타임라인
```

탭 순서: **탐색 → 커뮤니티 → 타임라인**

> **빌더 탭은 별도 탭 없이** 탐색·타임라인·커뮤니티 탭 하단의 **"커리어 패스 만들기"** 버튼으로 풀스크린 오버레이 다이얼로그를 통해 접근합니다.

---

## 3. 전체 파일 구조

```
frontend/app/career/
├── page.tsx                                # 메인 페이지 (탭 라우팅, 빌더 다이얼로그 관리)
├── config.ts                               # LABELS, COLORS, ITEM_TYPES, GRADE_YEARS 등 re-export
├── README.md                               # 이 문서
│
├── components/
│   ├── CareerPathList.tsx                  # 탐색 탭 (템플릿 목록 + 즐겨찾기 섹션)
│   ├── CareerPathBuilder.tsx               # 빌더 다이얼로그 (4단계 커리어 패스 생성)
│   ├── CareerPathDetailDialog.tsx          # 템플릿 상세 다이얼로그 (댓글·즐겨찾기)
│   ├── CareerPathSelector.tsx              # 내 패스 선택 드롭다운
│   ├── CareerPathTimeline.tsx              # 단일 패스 타임라인 렌더러
│   ├── VerticalTimelineList.tsx            # 타임라인 탭 (내 패스 목록·편집·공유)
│   ├── ItemDetailDialog.tsx                # 항목 상세 다이얼로그
│   ├── GoalTemplateSelector.tsx            # 목표 템플릿 선택 바텀시트
│   ├── ReportModal.tsx                     # 신고 모달
│   │
│   └── community/
│       ├── index.ts                        # 커뮤니티 모듈 exports
│       ├── types.ts                        # TypeScript 인터페이스 정의
│       ├── CommunityTab.tsx                # 커뮤니티 탭 루트 (서브탭 + 반응 상태 관리)
│       ├── SchoolSpaceView.tsx             # 학교 공간 뷰 (공유 패스 목록·필터·정렬·검색)
│       ├── GroupListView.tsx               # 그룹 목록 뷰 (그룹 생성·멤버·공유 패스)
│       ├── SharedPlanCardWithReactions.tsx # 공유 패스 카드 (하트+즐겨찾기 포함)
│       ├── SharedPlanDetailDialog.tsx      # 공유 패스 상세 다이얼로그 (코멘트)
│       └── ShareSettingsDialog.tsx         # 공유 설정 바텀시트 (전체/운영자 공유)
```

**데이터 파일** (`frontend/data/`)

| 파일 | 역할 | 사용 위치 |
|------|------|-----------|
| `career-path-templates.json` | 커리어 패스 템플릿 목록 | `CareerPathList`, `CareerPathDetailDialog` |
| `career-content.json` | UI 라벨·메시지 | `config.ts` → LABELS |
| `career-config.json` | 색상, itemTypes, gradeYears, starFilters, routes | `config.ts` |
| `career-maker.json` | 빌더용 왕국·직업·careerItems 데이터 | `CareerPathBuilder` |
| `portfolio-items.json` | 왕국별 포트폴리오 추천 항목 | `CareerPathBuilder` (AddItemSheet) |
| `share-community.json` | 학교·그룹·공유 패스 목 데이터 | `CommunityTab`, `CareerPathList` |
| `goal-templates.json` | 목표 템플릿 목록 | `GoalTemplateSelector` |

---

## 4. 데이터 구조 (TypeScript 타입)

### 4-1. CareerPlan — 내 커리어 패스 (`CareerPathBuilder.tsx`)

```typescript
type CareerPlan = {
  id: string;
  starId: string;        // 왕국 ID (예: 'tech')
  starName: string;      // 왕국 이름 (예: '기술 왕국')
  starEmoji: string;
  starColor: string;     // 왕국 테마 색상 (hex)
  jobId: string;
  jobName: string;
  jobEmoji: string;
  title: string;         // 패스 제목 (예: '소프트웨어 개발자 커리어 패스')
  createdAt: string;     // ISO 날짜
  years: YearPlan[];     // 학년별 계획 배열
  isPublic?: boolean;    // 공유 여부
  shareType?: string;    // 'public' | 'operator'
  sharedAt?: string;     // 공유 시각
};

type YearPlan = {
  gradeId: string;       // 'elem4', 'mid1', 'high2' 등
  gradeLabel: string;    // '초4', '중1', '고2' 등
  goals: string[];       // 학년 목표 텍스트 배열
  items: PlanItem[];     // 활동·수상·작품·자격증 항목
  groups?: PlanGroup[];  // 그룹(1학기, 여름방학 등)
};

type PlanItem = {
  id: string;
  type: 'activity' | 'award' | 'portfolio' | 'certification';
  title: string;
  months: number[];      // 다중 월 선택 (예: [3, 6, 9])
  difficulty: number;    // 1~5
  cost: string;
  organizer: string;
  custom?: boolean;      // 직접 입력 여부
};

type PlanGroup = {
  id: string;
  label: string;         // '1학기', '여름방학' 등
  items: PlanItem[];
};
```

### 4-2. SharedPlan — 커뮤니티 공유 패스 (`community/types.ts`)

```typescript
interface SharedPlan {
  id: string;
  planId: string;
  ownerId: string;
  ownerName: string;
  ownerEmoji: string;
  ownerGrade: string;    // 학년 ID (예: 'mid2')
  schoolId: string;
  shareType: 'public' | 'operator';
  title: string;
  jobEmoji: string;
  jobName: string;
  starName: string;
  starEmoji: string;
  starColor: string;
  yearCount: number;
  itemCount: number;
  sharedAt: string;
  likes: number;
  bookmarks: number;
  years: SharedPlanYear[];
  operatorComments: OperatorComment[];
  groupIds: string[];
}

interface UserReactionState {
  likedPlanIds: string[];
  bookmarkedPlanIds: string[];
}
```

---

## 5. 메인 페이지 (`page.tsx`)

### 상태 관리

```typescript
const [activeTab, setActiveTab] = useState<TabId>('explore');
const [plans, setPlans] = useState<CareerPlan[]>([]);
const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
const [editingPlan, setEditingPlan] = useState<CareerPlan | null>(null);
const [builderOpen, setBuilderOpen] = useState(false);
const [builderInitialStep, setBuilderInitialStep] = useState<number | undefined>(undefined);
const [mounted, setMounted] = useState(false);
```

| 상태 | 역할 |
|------|------|
| `activeTab` | 현재 활성 탭 (`'explore'` \| `'community'` \| `'timeline'`) |
| `plans` | localStorage에서 로드한 내 커리어 패스 배열 |
| `selectedPlanId` | 타임라인 탭에서 선택된 패스 ID |
| `editingPlan` | 빌더에서 편집 중인 패스 (null이면 새로 만들기) |
| `builderOpen` | 빌더 다이얼로그 표시 여부 |
| `builderInitialStep` | 빌더 진입 시 시작 단계 (1=새로만들기, 3=편집) |
| `mounted` | SSR 하이드레이션 완료 여부 (localStorage 접근 전 가드) |

### 초기화 알고리즘

```typescript
useEffect(() => {
  setMounted(true);

  // 1. URL 쿼리 파라미터로 탭 직접 진입
  const tabParam = searchParams.get('tab') as TabId | null;
  if (tabParam && ['explore', 'timeline', 'community'].includes(tabParam)) {
    setActiveTab(tabParam);
  }

  // 2. localStorage에서 내 패스 로드
  const raw = localStorage.getItem('career_plans_v3');
  if (raw) {
    const loadedPlans = JSON.parse(raw) as CareerPlan[];
    setPlans(loadedPlans);
    if (loadedPlans.length > 0) setSelectedPlanId(loadedPlans[0].id);
  }
}, []);
```

### 핵심 함수 알고리즘

#### `savePlan(plan)` — 패스 저장·수정

```typescript
savePlan(plan):
  existingIndex = plans.findIndex(p => p.id === plan.id)
  updatedPlans = existingIndex >= 0
    ? plans.map((p, i) => i === existingIndex ? plan : p)  // 수정
    : [...plans, plan]                                      // 신규 추가
  savePlans(updatedPlans)
  setSelectedPlanId(plan.id)
  setBuilderOpen(false)
  setEditingPlan(null)
  setActiveTab('timeline')  // 저장 후 타임라인 탭으로 이동
```

#### `deletePlan(planId)` — 패스 삭제

```typescript
deletePlan(planId):
  updatedPlans = plans.filter(p => p.id !== planId)
  savePlans(updatedPlans)
  if (selectedPlanId === planId):
    setSelectedPlanId(updatedPlans.length > 0 ? updatedPlans[0].id : null)
```

#### `handleUseTemplate(template)` — 템플릿으로 패스 생성

```typescript
handleUseTemplate(template):
  plan = {
    id: `from-template-${Date.now()}`,
    ...template 메타데이터,
    createdAt: new Date().toISOString(),
    years: template.years.map(y => ({
      ...y,
      items: y.items.map((item, idx) => ({
        id: `tpl-${y.gradeId}-${idx}-${Date.now()}`,
        type: item.type,
        months: item.months ?? [item.month ?? 3],
        ...item 나머지 필드
      }))
    }))
  }
  savePlan(plan)  // → 타임라인 탭으로 이동
```

#### `openNew()` / `openEdit(plan)` — 빌더 진입

```typescript
openNew():
  setEditingPlan(null)
  setBuilderInitialStep(1)   // Step 1 (왕국 선택)부터 시작
  setBuilderOpen(true)

openEdit(plan):
  setEditingPlan(plan)
  setBuilderInitialStep(3)   // Step 3 (계획 세우기)부터 시작
  setBuilderOpen(true)
```

### 화면 구성

```
CareerPage (Suspense wrapper)
└── CareerPageContent
    ├── StarField                    # 배경 별 반짝임 (absolute)
    ├── 헤더 (sticky)
    │   ├── "커리어 패스" 제목
    │   ├── 선택된 패스 직업 뱃지 (selectedPlan 있을 때)
    │   └── 탭 바 (탐색 / 커뮤니티 / 타임라인)
    │
    ├── [explore 탭]
    │   ├── CareerPathList
    │   └── "커리어 패스 만들기" 고정 버튼 (fixed bottom-20)
    │
    ├── [timeline 탭]
    │   └── VerticalTimelineList
    │
    ├── [community 탭]
    │   └── CommunityTab
    │
    ├── TabBar
    │
    └── [builderOpen] CareerPathBuilder (fixed inset-0, z-50)
```

---

## 6. 탐색 탭 (`CareerPathList`)

**파일**: `components/CareerPathList.tsx`

### 상태 관리

```typescript
const [activeFilter, setActiveFilter] = useState('all');
const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
const [templateBookmarkIds, setTemplateBookmarkIds] = useState<string[]>([]);
const [reactions, setReactions] = useState<UserReactionState>({ likedPlanIds: [], bookmarkedPlanIds: [] });
const [likeCounts, setLikeCounts] = useState<Record<string, number>>(...);
const [bookmarkCounts, setBookmarkCounts] = useState<Record<string, number>>(...);
```

### 화면 구성

```
CareerPathList
├── 히어로 헤더                    # 총 패스 수 · 왕국 수 · 총 사용 수 통계
│
├── [즐겨찾기 섹션] (totalBookmarkCount > 0 일 때만)
│   ├── BookmarkedTemplateCard × N  # 템플릿 즐겨찾기
│   └── BookmarkedCommunityCard × N # 커뮤니티 공유 패스 즐겨찾기
│
├── [내가 공유한 패스] (myPublicPlans.length > 0 일 때만)
│   └── MyPublicPlanCard × N
│
├── 왕국 필터 칩 (전체 + 8개 왕국)
│
└── 템플릿 목록
    └── TemplateRow × N
        └── 클릭 → setSelectedTemplate(template) → CareerPathDetailDialog 오픈
```

### 필터링 알고리즘

```typescript
const filtered = useMemo(() => {
  return activeFilter === 'all'
    ? templates
    : templates.filter(t => t.starId === activeFilter);
}, [activeFilter]);
```

### 즐겨찾기 토글 알고리즘

```typescript
// 템플릿 즐겨찾기
handleToggleTemplateBookmark(templateId, e):
  e.stopPropagation()
  setTemplateBookmarkIds(prev => {
    next = prev.includes(templateId)
      ? prev.filter(id => id !== templateId)
      : [...prev, templateId]
    localStorage.setItem('template_bookmarks_v1', JSON.stringify(next))
    return next
  })

// 커뮤니티 패스 즐겨찾기
handleToggleCommunityBookmark(planId):
  setReactions(prev => {
    wasBookmarked = prev.bookmarkedPlanIds.includes(planId)
    updated = { ...prev, bookmarkedPlanIds: wasBookmarked ? 제거 : 추가 }
    localStorage.setItem('community_reactions_v1', JSON.stringify(updated))
    base = sharedPlans.find(p.id === planId)?.bookmarks ?? 0
    setBookmarkCounts(prev => ({ ...prev, [planId]: base + (wasBookmarked ? 0 : 1) }))
    return updated
  })
```

### 서브 컴포넌트

| 컴포넌트 | 역할 |
|----------|------|
| `TemplateRow` | 템플릿 카드 (하트·즐겨찾기 버튼 포함) |
| `MyPublicPlanCard` | 내가 공개한 패스 카드 |
| `BookmarkedTemplateCard` | 즐겨찾기된 템플릿 카드 |
| `BookmarkedCommunityCard` | 즐겨찾기된 커뮤니티 패스 카드 |

---

## 7. 빌더 다이얼로그 (`CareerPathBuilder`)

**파일**: `components/CareerPathBuilder.tsx`

### 4단계 구조

```
Step 1 — 왕국 선택 (🌟)
  └── careerMaker.kingdoms 2열 그리드
      └── 선택 시 starId 세팅

Step 2 — 직업 선택 (🎯)
  └── kingdom.representativeJobs 목록
      └── 선택 시 jobId 세팅

Step 3 — 계획 세우기 (📋)
  └── YearPlanCard × N (학년별 아코디언)
      ├── 목표 입력 (최대 5개)
      ├── 항목 추가 (AddItemSheet)
      └── 그룹 추가 (1학기, 여름방학 등)

Step 4 — 완성! (🎉)
  └── Step4Summary (통계 요약)
      └── "저장하고 타임라인 보기" → handleSave()
```

### 상태 관리

```typescript
const [step, setStep] = useState(initialStep ?? 1);
const [starId, setStarId] = useState(initialPlan?.starId ?? '');
const [jobId, setJobId] = useState(initialPlan?.jobId ?? '');
const [yearPlans, setYearPlans] = useState<YearPlan[]>(initialPlan?.years ?? []);
```

### 진행 가능 조건 알고리즘

```typescript
canProceed():
  step === 1 → !!starId
  step === 2 → !!jobId
  step === 3 → yearPlans.length > 0
  step === 4 → true (항상 저장 가능)
```

### 저장 알고리즘

```typescript
handleSave():
  gradeOrder = GRADE_YEARS.reduce((acc, g, i) => { acc[g.id] = i; ... })
  plan = {
    id: initialPlan?.id ?? `plan-${Date.now()}`,
    starId, starName, starEmoji, starColor,
    jobId, jobName, jobEmoji,
    years: yearPlans.sort((a, b) => gradeOrder[a.gradeId] - gradeOrder[b.gradeId]),
    createdAt: initialPlan?.createdAt ?? new Date().toISOString(),
    title: `${job.name} 커리어 패스`,
  }
  onSave(plan)  // → page.tsx의 savePlan()
```

### `AddItemSheet` — 항목 추가 바텀시트

**두 가지 모드**

| 모드 | 설명 |
|------|------|
| `pick` (추천 선택) | `careerMaker.careerItems` + `portfolioItems` 목록에서 선택 후 월 설정 |
| `custom` (직접 입력) | 유형·이름·월·난이도·비용·주관 직접 입력 |

**추천 항목 데이터 병합 알고리즘**

```typescript
careerItems = kingdom.careerItems.map(it => ({ ...it }))
portItems = portfolioItems.kingdoms[starId].map(it => ({
  ...it, type: 'portfolio', cost: '자체 제작', organizer: '개인'
}))
allItems = [...careerItems, ...portItems]
filtered = filterType === 'all' ? allItems : allItems.filter(it => it.type === filterType)
```

**월 선택 (`MonthPicker`) 알고리즘**

```typescript
toggle(month):
  selected.includes(m)
    ? onChange(selected.filter(x => x !== m))       // 선택 해제
    : onChange([...selected, m].sort((a,b) => a-b)) // 정렬하여 추가
```

### `YearPlanCard` — 학년 카드

**내부 상태**

```typescript
const [showAddItem, setShowAddItem] = useState(false);
const [addItemGroupId, setAddItemGroupId] = useState<string | undefined>(undefined);
const [goalInput, setGoalInput] = useState('');
const [editingGoalIdx, setEditingGoalIdx] = useState<number | null>(null);
const [editingItemId, setEditingItemId] = useState<string | null>(null);
const [celebrateGoal, setCelebrateGoal] = useState<number | null>(null);
const [celebrateItemId, setCelebrateItemId] = useState<string | null>(null);
```

**축하 효과 알고리즘**

```typescript
addGoal():
  newGoals = [...yearPlan.goals, goalInput.trim()]
  onUpdate({ ...yearPlan, goals: newGoals })
  setCelebrateGoal(newGoals.length - 1)
  setTimeout(() => setCelebrateGoal(null), 1000)
  // → Framer Motion scale: [1, 1.05, 1] + radial-gradient glow
```

**그룹 내 항목 추가 알고리즘**

```typescript
addItem(item, groupId?):
  newItem = { ...item, id: `item-${Date.now()}-${random}` }
  if (groupId):
    groups = yearPlan.groups.map(g =>
      g.id === groupId ? { ...g, items: [...g.items, newItem] } : g
    )
    onUpdate({ ...yearPlan, groups })
  else:
    onUpdate({ ...yearPlan, items: [...yearPlan.items, newItem] })
```

### `Step3Planner` — 학년 플래너

**학년 추가 알고리즘**

```typescript
addGrade(gradeId):
  grade = GRADE_YEARS.find(g => g.id === gradeId)
  newYear = { gradeId, gradeLabel: grade.label, goals: [], items: [] }
  onUpdateYears([...yearPlans, newYear])
  setExpandedId(gradeId)
  setShowGradePicker(false)
  setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
```

**학년 그룹 분류**

```typescript
[
  { label: '초등', grades: GRADE_YEARS.filter(g => g.id.startsWith('elem')) },
  { label: '중학교', grades: GRADE_YEARS.filter(g => g.id.startsWith('mid')) },
  { label: '고등학교', grades: GRADE_YEARS.filter(g => g.id.startsWith('high')) },
]
// 이미 추가된 학년은 available에서 제외
available = group.grades.filter(g => !usedIds.includes(g.id))
```

---

## 8. 타임라인 탭 (`VerticalTimelineList`)

**파일**: `components/VerticalTimelineList.tsx`

### 기능

- 내가 만든 커리어 패스 목록을 아코디언 형태로 표시
- 각 패스를 학년별 WBS 타임라인으로 시각화
- 패스 제목 인라인 편집 (`InlineTitle`)
- 목표 인라인 편집·삭제 (`GoalRow`)
- 항목 체크 완료 처리 (checked 상태)
- 패스 편집(빌더 Step3 진입), 삭제, 공유 설정

### 공유 상태 표시

| 상태 | 표시 |
|------|------|
| 미공유 | "공유하기" 버튼 (Share2 아이콘) |
| 전체 공유 | 초록 뱃지 "전체공개" + "공개중" 표시 |
| 운영자 공유 | 보라 뱃지 "운영자공개" + "운영자공개중" 표시 |

### `InlineTitle` 컴포넌트 알고리즘

```typescript
commit():
  t = draft.trim()
  if (t) onSave(t)
  else setDraft(value)  // 빈 값이면 원래 값으로 복원
  setEditing(false)

// Enter → commit, Escape → 취소
// onBlur → commit
```

---

## 9. 커뮤니티 탭 (`CommunityTab`)

**파일**: `components/community/CommunityTab.tsx`

### 서브탭 구조

```
커뮤니티
├── 🏫 학교 공간 (school)   — SchoolSpaceView
└── 👥 그룹 (groups)        — GroupListView
```

### 상태 관리

```typescript
const [subTab, setSubTab] = useState<SubTab>('school');
const [showJoinSchool, setShowJoinSchool] = useState(false);
const [selectedPlan, setSelectedPlan] = useState<SharedPlan | null>(null);
const [joinedSchool, setJoinedSchool] = useState<School | null>(communityData.schools[0]);
const [reactions, setReactions] = useState<UserReactionState>({ likedPlanIds: [], bookmarkedPlanIds: [] });
const [likeCounts, setLikeCounts] = useState<Record<string, number>>(...);
const [bookmarkCounts, setBookmarkCounts] = useState<Record<string, number>>(...);
```

### `SchoolSpaceView` — 학교 공간

**필터·정렬 알고리즘**

```typescript
filteredPlans = useMemo(() => {
  let result = sharedPlans

  // 1. 학년 필터
  if (gradeFilter !== 'all')
    result = result.filter(p => p.ownerGrade === gradeFilter)

  // 2. 공유 타입 필터
  if (shareTypeFilter !== 'all')
    result = result.filter(p => p.shareType === shareTypeFilter)

  // 3. 검색 (제목·직업명·소유자 이름)
  if (searchQuery.trim())
    result = result.filter(p =>
      p.title.includes(q) || p.jobName.includes(q) || p.ownerName.includes(q)
    )

  // 4. 정렬
  if (sortBy === 'recent')   result.sort((a,b) => b.sharedAt - a.sharedAt)
  if (sortBy === 'likes')    result.sort((a,b) => likeCounts[b.id] - likeCounts[a.id])
  if (sortBy === 'bookmarks') result.sort((a,b) => bookmarkCounts[b.id] - bookmarkCounts[a.id])

  return result
}, [sharedPlans, gradeFilter, shareTypeFilter, searchQuery, sortBy, likeCounts, bookmarkCounts])
```

**필터 옵션**

| 필터 | 옵션 |
|------|------|
| 학년 | 전체 / 초4~고2 (GRADE_YEARS 기반) |
| 공유 타입 | 전체 / 전체 공유 / 운영자 공유 |
| 정렬 | 최신순 / 좋아요순 / 즐겨찾기순 |
| 검색 | 제목·직업명·소유자 이름 |

### `SharedPlanCardWithReactions` — 공유 패스 카드

- 첫 번째 학년의 첫 2개 항목 미리보기
- 공유 타입 배지 (🌐 전체공유 / 🛡️ 운영자공유)
- 하트·즐겨찾기 버튼 (클릭 시 `stopPropagation` + 상위 토글 함수 호출)
- 댓글 수 표시 (`plan.operatorComments.length`)

---

## 10. 하트·즐겨찾기 시스템

### 동작 원리

```
사용자 클릭 (하트/즐겨찾기)
    │
    ▼
setReactions (functional updater)
    ├── likedPlanIds / bookmarkedPlanIds 배열 업데이트
    └── localStorage.setItem('community_reactions_v1', ...)
    │
    ▼
setLikeCounts / setBookmarkCounts
    └── base(JSON 기본값) + 1 또는 + 0
```

### 카운트 계산 방식

| 상황 | 표시 카운트 |
|------|------------|
| 사용자가 좋아요 안 함 | `plan.likes` (JSON 기본값) |
| 사용자가 좋아요 함 | `plan.likes + 1` |
| 사용자가 좋아요 취소 | `plan.likes` |

### 즐겨찾기 위치

| 위치 | 저장 키 |
|------|---------|
| 탐색 탭 — 템플릿 카드 | `template_bookmarks_v1` |
| 탐색 탭 — 즐겨찾기 섹션 | 두 키 통합 표시 |
| 커뮤니티 학교 공간 | `community_reactions_v1` |
| 커뮤니티 그룹 | `community_reactions_v1` |
| 공유 패스 상세 다이얼로그 | `community_reactions_v1` |

---

## 11. 공유 설정 시스템 (`ShareSettingsDialog`)

**파일**: `components/community/ShareSettingsDialog.tsx`

### 공유 타입

| 타입 | 설명 | 대상 |
|------|------|------|
| `public` (전체 공유) | 같은 학교 친구들 + 그룹 멤버 모두 | 학교 공간 + 그룹 |
| `operator` (운영자 공유) | 진로 선생님(운영자)만 | 학교 공간 운영자 전용 |

### 공유 흐름

```
타임라인 탭 → "공유하기" 버튼 클릭
    │
    ▼
ShareSettingsDialog (바텀시트, z-50)
    ├── 공유 옵션 선택 (전체 공유 / 운영자 공유)
    └── "공유하기" 확인 버튼
            │
            ▼
        onConfirm(shareType) → VerticalTimelineList
            └── plan.isPublic = true, plan.shareType = shareType
                └── onSharePlan(plan, true, shareType) → page.tsx
                        └── setActiveTab('community')
```

### 공유 해제 흐름

```
ShareSettingsDialog → "공유 해제" 버튼
    └── onMakePrivate() → plan.isPublic = false
```

---

## 12. 유저 시나리오

### 시나리오 A: 처음 커리어 패스 만들기

```
1. /career 진입 → 탐색 탭 (기본)
2. 하단 "커리어 패스 만들기" 버튼 클릭 → CareerPathBuilder 오픈
3. Step 1: "기술 왕국 ⚙️" 선택 → "다음으로"
4. Step 2: "소프트웨어 개발자" 선택 → "다음으로"
5. Step 3: "학년 선택하기" → "중1" 추가
   - 목표 입력: "알고리즘 기초 학습"
   - 항목 추가 (추천 선택): "전국 정보올림피아드" 선택 → 3월 선택 → 추가
   - 항목 추가 (직접 입력): "교내 코딩 대회 금상" 직접 입력
   - "다음 학년 추가하기" → "중2" 추가
6. Step 4: 요약 확인 → "저장하고 타임라인 보기"
7. 타임라인 탭으로 자동 이동 → 내 패스 확인
```

### 시나리오 B: 템플릿으로 빠르게 시작

```
1. 탐색 탭 → 왕국 필터 "기술" 선택
2. "소프트웨어 개발자 커리어 패스" TemplateRow 클릭
3. CareerPathDetailDialog 오픈 → 학년별 상세 확인
4. "이 패스 사용하기" 버튼 클릭
5. handleUseTemplate() → 템플릿 데이터로 CareerPlan 생성
6. savePlan() → 타임라인 탭으로 이동
```

### 시나리오 C: 커뮤니티에 공유하기

```
1. 타임라인 탭 → 내 패스 카드 → "공유하기" 버튼 클릭
2. ShareSettingsDialog 오픈
3. "전체 공유" 선택 → "공유하기" 확인
4. plan.isPublic = true, plan.shareType = 'public'
5. handleSharePlan() → setActiveTab('community')
6. 커뮤니티 탭 학교 공간에서 내 패스 확인
```

### 시나리오 D: 친구 패스 탐색 및 즐겨찾기

```
1. 커뮤니티 탭 → 학교 공간
2. 학년 필터 "중2", 정렬 "좋아요순" 설정
3. 관심 있는 패스 카드 클릭 → SharedPlanDetailDialog 오픈
4. 학년별 타임라인 확인
5. 상단 즐겨찾기 버튼 클릭 → bookmarkedPlanIds에 추가
6. 탐색 탭으로 이동 → 상단 즐겨찾기 섹션에 표시됨
```

---

## 13. 순서도 (플로우차트)

### 13-1. 전체 탭 흐름

```
/career 진입
    │
    ▼
URL ?tab= 파라미터 확인
    ├── tab=explore    → 탐색 탭
    ├── tab=community  → 커뮤니티 탭
    ├── tab=timeline   → 타임라인 탭
    └── 없음           → 탐색 탭 (기본)
    │
    ▼
localStorage 'career_plans_v3' 로드
    ├── 있음 → plans 세팅, selectedPlanId = plans[0].id
    └── 없음 → plans = []
```

### 13-2. 빌더 다이얼로그 흐름

```
빌더 오픈 (builderOpen = true)
    │
    ▼
Step 1: 왕국 선택
  canProceed = !!starId
    │ (다음으로)
    ▼
Step 2: 직업 선택
  canProceed = !!jobId
    │ (다음으로)
    ▼
Step 3: 계획 세우기
  canProceed = yearPlans.length > 0
    │
    ├── 학년 추가 → YearPlanCard 생성
    │   ├── 목표 입력 (최대 5개, Enter로 추가)
    │   ├── 항목 추가 → AddItemSheet 오픈
    │   │   ├── [추천 선택] 항목 클릭 → 월 선택 → 추가
    │   │   └── [직접 입력] 유형·이름·월·난이도·비용 입력 → 추가
    │   └── 그룹 추가 → 그룹 내 항목 추가 가능
    │
    │ (미리보기)
    ▼
Step 4: 완성 요약
    │ (저장하고 타임라인 보기)
    ▼
handleSave()
    └── 학년 순서 정렬 (gradeOrder 기반)
        └── onSave(plan) → page.tsx savePlan()
                └── setActiveTab('timeline')
```

### 13-3. 커뮤니티 반응 흐름

```
하트/즐겨찾기 버튼 클릭
    │
    ▼
setReactions (functional updater)
    ├── likedPlanIds 토글 (추가/제거)
    └── localStorage 저장
    │
    ▼
setLikeCounts / setBookmarkCounts
    └── base + (liked ? 1 : 0)
    │
    ▼
UI 즉시 반영
    ├── 탐색 탭 즐겨찾기 섹션 (동일 키 공유)
    └── 커뮤니티 탭 카드
```

### 13-4. 공유 흐름

```
타임라인 탭 "공유하기" 버튼
    │
    ▼
ShareSettingsDialog 오픈
    │
    ├── 공유 타입 선택 (public / operator)
    │
    ▼
onConfirm(shareType)
    └── updatePlanInline({
          ...plan,
          isPublic: true,
          shareType,
          sharedAt: new Date().toISOString()
        })
        └── localStorage 저장
            └── handleSharePlan() → setActiveTab('community')
```

---

## 14. 컴포넌트 Props 명세

### 메인 페이지

| 컴포넌트 | Props | 타입 |
|----------|-------|------|
| `CareerPathList` | `onUseTemplate`, `onNewPath`, `myPublicPlans`, `onViewMyPlan` | 각 함수·배열 |
| `CareerPathBuilder` | `initialPlan`, `initialStep`, `onSave`, `onClose` | `CareerPlan \| null`, `number`, 함수들 |
| `VerticalTimelineList` | `allPlans`, `onEdit`, `onUpdatePlan`, `onDeletePlan`, `onNewPlan`, `onSharePlan` | 배열·함수들 |
| `CommunityTab` | `onNewPlan` | `() => void` |

### 커뮤니티 컴포넌트

| 컴포넌트 | Props | 타입 |
|----------|-------|------|
| `SchoolSpaceView` | `school`, `sharedPlans`, `likedPlanIds`, `bookmarkedPlanIds`, `likeCounts`, `bookmarkCounts`, `onToggleLike`, `onToggleBookmark`, `onViewPlanDetail`, `onJoinSchool` | 각 타입 참조 |
| `SharedPlanCardWithReactions` | `plan`, `isLiked`, `isBookmarked`, `likeCount`, `bookmarkCount`, `onToggleLike`, `onToggleBookmark`, `onViewDetail` | 각 타입 참조 |
| `ShareSettingsDialog` | `planTitle`, `currentShareType`, `onConfirm`, `onMakePrivate`, `onClose` | 각 타입 참조 |

---

## 15. 설정 파일 & JSON 데이터

### `config.ts`

| export | 출처 | 설명 |
|--------|------|------|
| `LABELS` | `career-content.json` | 모든 UI 텍스트 (한국어) |
| `COLORS` | `career-config.json` | primary, activity, award, certification, portfolio, goal, background |
| `ITEM_TYPES` | `career-config.json` | 커리어 항목 타입 (value, label, color, emoji) |
| `GRADE_YEARS` | `career-config.json` | 학년 목록 (초4 ~ 고2, id, label, fullLabel, order) |
| `STAR_FILTERS` | `career-config.json` | 왕국(별) 필터 옵션 |
| `ROUTES` | `career-config.json` | 탭별 URL 경로 |

### JSON 파일 역할

| 파일 | 역할 |
|------|------|
| `career-content.json` | 페이지·탭·탐색·빌더·타임라인·커뮤니티·공유설정·반응·신고 등 UI 라벨 |
| `career-config.json` | colors, itemTypes, gradeYears, starFilters, routes |
| `career-maker.json` | 빌더 Step1·2용 왕국·직업·careerItems 데이터 |
| `portfolio-items.json` | 왕국별 포트폴리오 추천 항목 (AddItemSheet 추천 목록) |
| `career-path-templates.json` | 탐색 탭 커리어 패스 템플릿 목록 |
| `share-community.json` | schools, groups, sharedPlans + meta.ui 라벨 |
| `goal-templates.json` | 목표 템플릿 목록 (GoalTemplateSelector) |

---

## 16. localStorage 키 목록

| 키 | 값 타입 | 설명 |
|----|---------|------|
| `career_plans_v3` | `CareerPlan[]` | 내 커리어 패스 목록 |
| `community_reactions_v1` | `UserReactionState` | 공유 패스 하트·즐겨찾기 상태 |
| `template_bookmarks_v1` | `string[]` | 템플릿 ID 즐겨찾기 목록 |

> **탐색 탭과 커뮤니티 탭은 `community_reactions_v1`을 공유**하므로 두 탭 간 반응 상태가 자동으로 동기화됩니다.

---

## 17. 추후 백엔드 연동 포인트

| 기능 | 현재 (프론트 전용) | 백엔드 연동 시 |
|------|-------------------|---------------|
| 커리어 패스 저장 | `localStorage career_plans_v3` | `POST /api/career-plans` |
| 공유 패스 목록 | `share-community.json` | `GET /api/community/plans?schoolId=` |
| 하트 토글 | localStorage 카운트 | `POST /api/community/plans/:id/like` |
| 즐겨찾기 토글 | localStorage 카운트 | `POST /api/community/plans/:id/bookmark` |
| 코멘트 작성 | 로컬 상태 stub | `POST /api/community/plans/:id/comments` |
| 학교 참여 | 코드 매칭 (JSON) | `POST /api/schools/join` |
| 그룹 생성 | 로컬 상태 | `POST /api/groups` |
| 템플릿 목록 | `career-path-templates.json` | `GET /api/career-templates` |
| 추천 항목 | `career-maker.json`, `portfolio-items.json` | `GET /api/career-items?starId=` |

---

*최종 업데이트: 2026-03-07*
