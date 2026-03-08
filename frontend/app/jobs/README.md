# 직업 탐색 (Jobs) — 기능 문서

> **경로**: `frontend/app/jobs/`  
> **프레임워크**: Next.js 14 App Router · TypeScript · Tailwind CSS · Framer Motion

---

## 목차

1. [개요](#1-개요)
2. [전체 라우트 구조](#2-전체-라우트-구조)
3. [전체 파일 구조](#3-전체-파일-구조)
4. [데이터 구조 (TypeScript 타입)](#4-데이터-구조-typescript-타입)
5. [메인 랜딩 페이지 (`/jobs`)](#5-메인-랜딩-페이지-jobs)
6. [탐색 페이지 (`/jobs/explore`)](#6-탐색-페이지-jobsexplore)
7. [직업 상세 모달 (`JobDetailModal`)](#7-직업-상세-모달-jobdetailmodal)
8. [스와이프 페이지 (`/jobs/swipe`)](#8-스와이프-페이지-jobsswipe)
9. [직업 상세 페이지 (`/jobs/[jobId]`)](#9-직업-상세-페이지-jobsjobid)
10. [유저 시나리오](#10-유저-시나리오)
11. [순서도 (플로우차트)](#11-순서도-플로우차트)
12. [컴포넌트 Props 명세](#12-컴포넌트-props-명세)
13. [설정 파일 & JSON 데이터](#13-설정-파일--json-데이터)
14. [추후 백엔드 연동 포인트](#14-추후-백엔드-연동-포인트)

---

## 1. 개요

직업 탐색 기능은 학생이 **8개 왕국(별)**의 다양한 직업을 탐색하고, 스와이프 매칭·하루 시뮬레이션·커리어 패스와 연동하여 진로를 탐색할 수 있는 핵심 기능입니다.

**주요 기능 요약**

| 기능 | 설명 | 진입 경로 |
|------|------|-----------|
| 직업 탐색 | 8개 별(왕국)별 직업 목록 탐색 | `/jobs/explore` |
| 직업 상세 모달 | 직무 프로세스·주요 일과·커리어 패스 탭 | explore에서 직업 클릭 |
| 스와이프 매칭 | RIASEC 기반 추천 직업 스와이프 | `/jobs/swipe` |
| 직업 상세 페이지 | 연봉·역량·레벨별(L1~L4) 상세 | `/jobs/[jobId]` |
| 하루 시뮬레이션 | 직업인의 하루 체험 | `/simulation/[id]` (외부 연동) |
| 커리어 패스 연동 | 직업 선택 후 커리어 패스 만들기 | `/career?star=[starId]` |

---

## 2. 전체 라우트 구조

```
/jobs
├── /                      # 메인 랜딩 (히어로·기능·통계·CTA)
├── /explore               # 별 그리드 → 직업 목록 → 직업 상세 모달
├── /swipe                 # 스와이프 매칭 (RIASEC 기반)
└── /[jobId]               # 직업 상세 페이지 (jobs.json 기반)
```

---

## 3. 전체 파일 구조

```
frontend/app/jobs/
├── page.tsx                          # 메인 랜딩 페이지
├── config.ts                         # LABELS, COLORS, ROUTES, LAYOUT, ICON_MAP 등
├── types.ts                          # JobsPageData, HeroSection, FeatureSection 등
├── README.md                         # 이 문서
│
├── components/                       # 메인 랜딩 전용 컴포넌트
│   ├── index.ts                      # 모든 컴포넌트 re-export
│   ├── HeroSection.tsx               # 히어로 배너 (Framer Motion 애니메이션)
│   ├── FeatureCard.tsx               # 기능 카드 (클릭 시 라우트 이동)
│   ├── StatsSection.tsx              # 통계 그리드 (2×2)
│   ├── CTASection.tsx                # 하단 CTA (주요/보조 버튼)
│   └── BackgroundEffects.tsx         # 배경 그라데이션 오브 + 별 반짝임 효과
│
├── explore/                          # 탐색 페이지
│   ├── page.tsx                      # 탐색 메인 (별 선택 ↔ 직업 목록 토글)
│   ├── config.ts                     # explore 전용 LABELS, PHASE_BG_COLORS 등
│   ├── types.ts                      # StarData, Job, WorkPhase, Milestone 등
│   ├── README.md                     # explore 리팩토링 문서
│   │
│   ├── components/
│   │   ├── index.ts
│   │   ├── StarField.tsx             # 배경 별 반짝임 효과
│   │   ├── StarCard.tsx              # 별 선택 카드 (2열 그리드)
│   │   ├── JobCard.tsx               # 직업 목록 카드 (일러스트·연봉·성장성)
│   │   ├── IntroBanner.tsx           # 별 선택 전 소개 배너
│   │   ├── StarInfoBanner.tsx        # 별 선택 후 별 정보 배너
│   │   ├── CTABanner.tsx             # 커리어 패스 만들기 배너
│   │   ├── PageHeader.tsx            # 상단 헤더 (뒤로가기 + 별 이름 표시)
│   │   └── JobDetailModal/           # 직업 상세 모달 (풀스크린)
│   │       ├── index.tsx             # 모달 루트 (탭 상태, 스와이프 제스처)
│   │       ├── ModalHeader.tsx       # 모달 상단 헤더 (직업명·닫기)
│   │       ├── ModalTabs.tsx         # 탭 바 (직무 프로세스·주요 일과·커리어 패스)
│   │       ├── ProcessTab.tsx        # 직무 프로세스 탭 (단계별 슬라이드)
│   │       ├── DailyScheduleTab.tsx  # 주요 일과 탭 (타임라인)
│   │       └── TimelineTab.tsx       # 커리어 패스 탭 (마일스톤 타임라인)
│   │
│   └── constants/
│       ├── jobIllustrations.tsx      # 직업별 SVG 일러스트레이션
│       └── jobIllustrations_full.txt # SVG 원본 텍스트 (참고용)
│
├── swipe/
│   └── page.tsx                      # 스와이프 매칭 페이지
│
└── [jobId]/
    └── page.tsx                      # 직업 상세 페이지 (L1~L4 탭)
```

**데이터 파일** (`frontend/data/`)

| 파일 | 용도 | 사용 위치 |
|------|------|-----------|
| `jobs-content.json` | 메인 랜딩 hero, features, stats, cta | `page.tsx` |
| `jobs.json` | 직업 상세·스와이프용 직업 목록 | `[jobId]/page.tsx`, `swipe/page.tsx` |
| `kingdoms.json` | 왕국 메타데이터 | `[jobId]/page.tsx`, `swipe/page.tsx` |
| `stars/*.json` | explore용 별·직업 데이터 | `explore/page.tsx` |
| `daily-schedules.json` | 직업별 하루 일과 데이터 | `DailyScheduleTab.tsx` |

> **중요**: `explore`는 `stars/*.json` 기반, `[jobId]`·`swipe`는 `jobs.json`·`kingdoms.json` 기반으로 **서로 다른 데이터 소스**를 사용합니다.

---

## 4. 데이터 구조 (TypeScript 타입)

### 4-1. JobsPageData — 메인 랜딩 (`types.ts`)

```typescript
interface JobsPageData {
  hero: HeroSection;         // 히어로 배너
  features: FeatureSection[]; // 기능 카드 목록
  stats: StatsSection;        // 통계 섹션
  cta: CTASection;            // CTA 섹션
}

interface HeroSection {
  title: string;
  subtitle: string;
  description: string;
  backgroundEmoji: string;
}

interface FeatureSection {
  id: string;
  icon: string;
  title: string;
  description: string;
  link: { text: string; href: string };
}

interface StatItem {
  icon: string;
  value: string;
  label: string;
  color: string;  // hex 색상 (통계 카드 강조색)
}
```

### 4-2. StarData & Job — Explore (`explore/types.ts`)

```typescript
type StarData = {
  id: string;         // 'tech', 'create', 'explore' 등
  name: string;       // '기술 별', '창작 별' 등
  emoji: string;      // '⚙️', '🎨' 등
  description: string;
  color: string;      // hex (카드 테마 색상)
  bgColor: string;    // hex (카드 배경 색상)
  jobCount: number;
  jobs: Job[];
  starProfile?: unknown;
};

type Job = {
  id: string;
  name: string;
  icon: string;
  shortDesc: string;
  description?: string;
  holland: string;              // 'R', 'I+A', 'E+S' 등 홀랜드 코드
  salaryRange: string;          // '3,000~5,000만원'
  futureGrowth: number;         // 1~5 (별점)
  aiRisk: string;               // '낮음', '보통', '높음'
  workProcess: { phases: WorkPhase[] };
  careerTimeline: {
    title: string;
    totalYears: string;
    totalCost: string;
    milestones: Milestone[];
    keySuccess: string[];
  };
  dailySchedule?: DailySchedule;
};

type WorkPhase = {
  id: number;
  phase: string;       // 'STEP 1' 등
  icon: string;
  title: string;
  description: string;
  duration: string;    // '2~4주'
  example?: string;    // 실제 예시 텍스트
  tools: string[];     // ['Figma', 'Notion'] 등
  skills: string[];    // ['기획력', '소통'] 등
};

type Milestone = {
  period: string;      // '중1', '고2' 등
  semester: string;    // '1학기', '2학기'
  icon: string;
  title: string;
  activities: string[];
  awards?: string[];   // 수상 목록
  setak?: string;      // 세특 포인트
  achievement: string; // 달성 목표
  cost?: string;       // 예상 비용
};

type DailyScheduleItem = {
  time: string;
  activity: string;
  detail?: string;
  icon: string;
  type: 'morning' | 'meeting' | 'work' | 'lunch' | 'review' | 'admin' | 'evening' | 'field';
};
```

### 4-3. Job & Kingdom — 상세·스와이프 (`lib/types.ts`)

```typescript
interface Job {
  id: string;
  title: string;
  kingdomId: string;
  icon: string;
  shortDescription: string;
  detailedDescription: string;
  avgSalary: string;
  educationRequired: string;
  requiredSkills: string[];
  certifications: string[];
  levels: { L1: JobLevel; L2: JobLevel; L3: JobLevel; L4: JobLevel };
  growthOutlook?: string;
  employmentCount?: string;
}

interface Kingdom {
  id: KingdomId;   // 'explore' | 'create' | 'tech' | ...
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
  riasecTypes: RIASECType[];
  jobCount: number;
}
```

---

## 5. 메인 랜딩 페이지 (`/jobs`)

**파일**: `page.tsx`

### 컴포넌트 구성

```
JobsPage
├── BackgroundEffects          # fixed, pointer-events-none
├── Header (sticky)            # LABELS.page_title, LABELS.page_subtitle
└── main content (px-4, py-6)
    ├── HeroSection            # jobs-content.json → hero
    ├── section "주요 기능"
    │   └── FeatureCard × N    # jobs-content.json → features[]
    ├── StatsSection           # jobs-content.json → stats
    └── CTASection             # jobs-content.json → cta
```

### 각 컴포넌트 알고리즘

#### `BackgroundEffects`
- `Array.from({ length: 30 })` 으로 30개 별 생성
- 황금각 분포: `x = (i * 137.5) % 100`, `y = (i * 97.3) % 100`
- `size = (i % 3) + 1` (1~3px), `delay = (i * 0.4) % 4`
- CSS `twinkle` 애니메이션으로 반짝임 효과

#### `HeroSection`
- Framer Motion `initial → animate` 순차 등장 (delay 0.2 → 0.5)
- `jobs-content.json`의 `hero` 데이터를 props로 수신

#### `FeatureCard`
- `index * 0.1` 딜레이로 카드 순차 등장
- 클릭 시 `router.push(feature.link.href)` 라우트 이동
- hover 시 `whileHover: { scale: 1.02 }`, tap 시 `whileTap: { scale: 0.98 }`

#### `StatsSection`
- 2×2 그리드, `item.color`로 카드별 강조색 적용
- `radial-gradient`로 카드 배경 글로우 효과

#### `CTASection`
- 주요 버튼: `data.primaryButton.href` → `/jobs/explore`
- 보조 버튼: `data.secondaryButton.href` → `/jobs/swipe`

---

## 6. 탐색 페이지 (`/jobs/explore`)

**파일**: `explore/page.tsx`

### 상태 관리

```typescript
const [selectedStar, setSelectedStar] = useState<StarData | null>(null);
const [selectedJob, setSelectedJob] = useState<Job | null>(null);
const [showStarProfile, setShowStarProfile] = useState(false);
```

| 상태 | 초기값 | 역할 |
|------|--------|------|
| `selectedStar` | `null` | 선택된 별. null이면 별 그리드, 값이면 직업 목록 표시 |
| `selectedJob` | `null` | 선택된 직업. null이면 TabBar 표시, 값이면 모달 표시 |
| `showStarProfile` | `false` | 별 프로필 패널 표시 여부 |

### URL 쿼리 파라미터 처리

```typescript
useEffect(() => {
  const starId = searchParams.get('starId');
  const jobId = searchParams.get('jobId');
  if (starId && jobId) {
    const star = stars.find(s => s.id === starId);
    if (star) {
      setSelectedStar(star);
      const job = star.jobs.find(j => j.id === jobId);
      if (job) setSelectedJob(job);
    }
  }
}, [searchParams]);
```

- 외부(커리어 패스 등)에서 `?starId=tech&jobId=developer`로 직접 진입 가능
- 별 → 직업 순서로 탐색하여 모달까지 자동 오픈

### 별 데이터 로드 알고리즘

```typescript
const stars = [
  exploreStar, createStar, techStar, connectStar,
  natureStar, orderStar, communicateStar, challengeStar,
] as StarData[];
```

- 8개 별 JSON을 정적 import
- `stars.length < 8`이면 나머지를 "준비 중" 플레이스홀더로 채움

### 화면 전환 로직

```
selectedStar === null
  → IntroBanner + 별 그리드 (StarCard × 8)

selectedStar !== null
  → StarInfoBanner + (StarProfileSummary) + 직업 목록 (JobCard × N) + CTABanner

selectedJob !== null
  → JobDetailModal (풀스크린 오버레이)
  → TabBar 숨김 (selectedJob이 있으면 <TabBar /> 미렌더)
```

### 컴포넌트 구성

```
JobsExplorePage (Suspense wrapper)
└── JobsExploreContent
    ├── StarField                    # 배경 별 효과 (fixed)
    ├── PageHeader                   # sticky 헤더
    │   ├── [selectedStar=null]  → "Job 간접 경험" 제목
    │   └── [selectedStar≠null]  → "{emoji} {별이름}" + 뒤로가기 버튼
    │
    ├── [selectedStar=null]
    │   ├── IntroBanner
    │   └── StarCard × 8 (2열 그리드)
    │       └── onClick → setSelectedStar(star)
    │
    ├── [selectedStar≠null]
    │   ├── StarInfoBanner
    │   ├── StarProfileSummary (starProfile 있을 때만)
    │   ├── JobCard × N
    │   │   └── onClick → setSelectedJob(job)
    │   └── CTABanner
    │       └── onClick → router.push('/career?star={star.id}')
    │
    ├── [selectedJob=null] → <TabBar />
    │
    ├── [selectedJob≠null] → JobDetailModal
    │   └── onClose → setSelectedJob(null)
    │
    └── [showStarProfile=true] → StarProfilePanel
        └── onClose → setShowStarProfile(false)
```

### `StarCard` 컴포넌트

- `star.bgColor`로 카드 배경 그라데이션
- `star.color`로 테두리·뱃지·글로우 색상
- `index * 0.08`초 딜레이로 순차 slide-up 애니메이션
- hover 시 `radial-gradient` 글로우 오버레이

### `JobCard` 컴포넌트

- `JOB_ILLUSTRATIONS[job.id]` SVG가 있으면 일러스트, 없으면 `job.icon` 이모지
- 홀랜드 코드 뱃지, 연봉 범위, 미래 성장성 별점(1~5) 표시
- 오른쪽 Play 버튼: `star.color` 그라데이션 원형 버튼

---

## 7. 직업 상세 모달 (`JobDetailModal`)

**파일**: `explore/components/JobDetailModal/index.tsx`

### 상태 관리

```typescript
const [activeTab, setActiveTab] = useState<ModalTab>('process');
const [processStep, setProcessStep] = useState(0);
const touchStartX = useRef<number | null>(null);
const touchStartY = useRef<number | null>(null);
```

| 상태 | 역할 |
|------|------|
| `activeTab` | 현재 활성 탭 (`'process'` \| `'daily'` \| `'timeline'`) |
| `processStep` | ProcessTab의 현재 단계 인덱스 |
| `touchStartX/Y` | 스와이프 제스처 시작 좌표 |

### 탭 전환 알고리즘

```typescript
// 탭 변경 시 processStep도 초기화
onTabChange={(tab) => { setActiveTab(tab); setProcessStep(0); }}
```

### 스와이프 제스처 알고리즘 (ProcessTab 전용)

```typescript
handleTouchEnd:
  dx = endX - startX
  dy = endY - startY

  조건: |dx| > |dy| AND |dx| > 50px  (수평 스와이프 판정)
    → dx < 0 (왼쪽): 다음 단계 (isLastPhase가 아닐 때)
    → dx > 0 (오른쪽): 이전 단계 (processStep > 0일 때)
```

### 모달 레이아웃 구조

```
JobDetailModal (fixed inset-0, z-50)
├── 배경: rgba(0,0,0,0.75) + backdrop-blur(8px)
└── 내용 패널 (max-w-[430px], height: 100dvh)
    ├── ModalHeader          # 직업명·별이름·홀랜드코드·닫기 버튼
    ├── ModalTabs            # 탭 바 (3개 탭)
    └── 스크롤 영역 (flex-1 overflow-y-auto)
        ├── [process] ProcessTab
        ├── [daily]   DailyScheduleTab
        └── [timeline] TimelineTab
```

### `ModalHeader` 컴포넌트

- `JOB_ILLUSTRATIONS[job.id]` SVG 있으면 일러스트, 없으면 `job.icon`
- `safe-area-inset-top` 처리 (노치 대응)
- X 버튼 → `onClose()` 호출

### `ModalTabs` 컴포넌트

- 탭 배열을 `map`으로 렌더링 (early return 없이 선언형)
- 활성 탭: `star.color` 그라데이션 배경
- 비활성 탭: `rgba(255,255,255,0.05)` 배경

### `ProcessTab` 컴포넌트

**단계 슬라이드 구조**

```
ProcessTab
├── PhaseIllustration          # 단계별 SVG 일러스트
│   ├── 좌측 화살표 버튼       # processStep > 0 일 때만 표시
│   └── 우측 화살표 버튼       # isLastPhase가 아닐 때만 표시
├── 점 인디케이터 (dot)        # 현재 단계 강조 (active: 24px 너비, inactive: 8px)
├── 단계 제목 + 설명
├── 소요 시간 배지
├── 실제 예시 카드             # example 있을 때만 표시
├── 사용 도구 태그 목록
├── 필요 스킬 태그 목록
└── [isLastPhase] 직업 종합 정보  # 연봉·AI 대체 위험·미래 성장성
```

**점 인디케이터 알고리즘**

```typescript
// 활성 점: 너비 24px (pill 형태), 비활성: 8px (원형)
width: i === processStep ? 24 : 8
backgroundColor: i === processStep ? star.color : 'rgba(255,255,255,0.18)'
```

### `DailyScheduleTab` 컴포넌트

**데이터 우선순위**

```typescript
// 1순위: job 객체 내 dailySchedule (stars/*.json 직접 포함)
// 2순위: daily-schedules.json에서 job.id로 조회
const schedule = job.dailySchedule ?? schedules[job.id];

// 둘 다 없으면 "준비 중" 메시지 표시
if (!schedule) return <준비중 UI />;
```

**타임라인 렌더링**

- 세로선: `left-[38px]` 위치에 `star.color` 그라데이션 선
- 각 항목: 시간 컬럼(58px) + 노드(원형) + 내용 카드
- `SCHEDULE_TYPE_COLORS[item.type]`로 노드·뱃지 색상 결정

### `TimelineTab` 컴포넌트

**마일스톤 노드 색상 알고리즘**

```typescript
const isHighSchool = m.period.startsWith('고');
const isMiddle = m.period.startsWith('중');
const isGrad = m.awards?.some(a => a.includes('합격'));

// 노드 색상 결정
isGrad      → 황금색 (#FBBF24)
isHighSchool → star.color 그라데이션
isMiddle    → 보라색 (#8B5CF6)
그 외       → 초록색 (#10B981)
```

**마일스톤 카드 구성**

```
Milestone 카드
├── 기간 뱃지 (period + semester)
├── 비용 (cost, 있을 때만)
├── 제목
├── 활동 목록 (activities.join(' · '))
├── 수상 목록 (awards, Trophy 아이콘)
├── 세특 포인트 (setak, 있을 때만)
└── 달성 목표 (achievement)
```

---

## 8. 스와이프 페이지 (`/jobs/swipe`)

**파일**: `swipe/page.tsx`

### 상태 관리

```typescript
const [jobs, setJobs] = useState<Job[]>([]);
const [currentIndex, setCurrentIndex] = useState(0);
const [direction, setDirection] = useState<'left' | 'right' | null>(null);
```

### 진입 조건 알고리즘

```typescript
useEffect(() => {
  const userData = storage.user.get();
  if (!userData?.riasecScores) {
    router.push('/quiz');  // RIASEC 없으면 퀴즈로 리다이렉트
    return;
  }
  setJobs(jobsData as Job[]);
}, [router]);
```

### 스와이프 처리 알고리즘

```typescript
handleSwipe(liked: boolean):
  1. setDirection(liked ? 'right' : 'left')  // 카드 이탈 애니메이션
  2. setTimeout(300ms):
     - liked → storage.savedJobs.add(currentJob.id)
     - currentIndex < jobs.length - 1 → 다음 카드
     - else → router.push('/home')  // 모든 직업 완료
```

**카드 이탈 CSS 클래스**

| direction | CSS |
|-----------|-----|
| `'left'`  | `-translate-x-[200%] rotate-[-20deg] opacity-0` |
| `'right'` | `translate-x-[200%] rotate-[20deg] opacity-0` |
| `null`    | `translate-x-0 rotate-0 opacity-100` |

### 화면 구성

```
JobSwipePage
├── Header (sticky)           # 현재 인덱스 / 전체 수
├── 카드 영역 (flex-1)
│   └── Card (직업 아이콘·이름·설명·연봉·학력·전망)
└── 액션 버튼 (sticky bottom)
    ├── X 버튼 → handleSwipe(false)
    └── ❤️ 버튼 → handleSwipe(true)
```

---

## 9. 직업 상세 페이지 (`/jobs/[jobId]`)

**파일**: `[jobId]/page.tsx`

### 데이터 로드 알고리즘

```typescript
useEffect(() => {
  const foundJob = (jobsData as Job[]).find(j => j.id === jobId);
  setJob(foundJob || null);
  if (foundJob) {
    const k = (kingdomsData as Kingdom[]).find(k => k.id === foundJob.kingdomId);
    setKingdom(k || null);
    const savedJobs = storage.savedJobs.getAll();
    setIsSaved(savedJobs.includes(foundJob.id));
  }
}, [jobId]);
```

### 저장 토글 알고리즘

```typescript
toggleSave():
  isSaved → storage.savedJobs.remove(job.id) → setIsSaved(false)
  !isSaved → storage.savedJobs.add(job.id) → setIsSaved(true)
```

### 화면 구성

```
JobDetailPage
├── 헤더 이미지 영역 (h-72)
│   ├── 직업 아이콘 (text-9xl)
│   ├── 뒤로가기 버튼 (absolute top-4 left-4)
│   └── 북마크 버튼 (absolute top-4 right-4)
│
├── 본문 (p-4)
│   ├── 왕국 배지 + 난이도 배지
│   ├── 직업 제목 + 짧은 설명
│   ├── CTA 버튼 "하루 시뮬레이션 시작" → /simulation/[id]
│   ├── 통계 그리드 (2×2)
│   │   ├── StatCard: 평균 연봉
│   │   ├── StatCard: 학력 요구
│   │   ├── StatCard: 성장 전망
│   │   └── StatCard: 직업 인구
│   └── Tabs (개요 / L1 / L2 / L3 / L4)
│       ├── 개요: 직업 설명 + 필요 역량 + 관련 자격증
│       └── L1~L4: LevelContent (레벨 제목·설명·주요 업무·역량)
```

---

## 10. 유저 시나리오

### 시나리오 A: 처음 직업 탐색하는 학생

```
1. 홈 화면 → 하단 탭바 "직업" 탭 클릭
2. /jobs 랜딩 페이지 진입
   - 히어로 배너: "직업 세계 탐험" 확인
   - 기능 카드 4개 (탐색·스와이프·시뮬레이션·커리어패스) 확인
3. "직업 탐색 시작" CTA 버튼 클릭 → /jobs/explore 이동
4. 8개 별 그리드 확인
5. "기술 별 ⚙️" 카드 클릭 → 기술 별 직업 목록 표시
6. "소프트웨어 개발자" JobCard 클릭 → JobDetailModal 오픈
7. "직무 프로세스" 탭 확인 (기본 탭)
   - 단계 1 확인 → 오른쪽 화살표 클릭 → 단계 2 이동
   - 좌우 스와이프로 단계 이동
8. "주요 일과" 탭 클릭 → 하루 타임라인 확인
9. "커리어 패스" 탭 클릭 → 중학교~대학교 마일스톤 확인
10. X 버튼으로 모달 닫기 → 직업 목록으로 복귀
11. "커리어 패스 만들기" CTABanner 클릭 → /career?star=tech 이동
```

### 시나리오 B: 스와이프로 빠르게 직업 탐색

```
1. /jobs 랜딩 → "스와이프 매칭" 기능 카드 클릭 → /jobs/swipe
2. RIASEC 점수 없으면 → /quiz 리다이렉트 (퀴즈 완료 후 복귀)
3. 첫 번째 직업 카드 표시
   - 직업 아이콘·이름·설명·연봉·학력·전망 확인
4. ❤️ 버튼 클릭 → 카드 오른쪽으로 이탈 + 저장됨
5. X 버튼 클릭 → 카드 왼쪽으로 이탈 + 저장 안 됨
6. 모든 직업 완료 → /home으로 이동
```

### 시나리오 C: URL로 직접 직업 진입 (커리어 패스 연동)

```
1. 커리어 패스 타임라인에서 직업 이름 클릭
2. /jobs/explore?starId=tech&jobId=developer 로 이동
3. useEffect에서 쿼리 파라미터 감지
   → selectedStar = techStar
   → selectedJob = developer
4. 별 목록 건너뛰고 바로 JobDetailModal 오픈
```

---

## 11. 순서도 (플로우차트)

### 11-1. 탐색 페이지 전체 흐름

```
/jobs/explore 진입
        │
        ▼
URL 쿼리 파라미터 확인
  starId & jobId 있음? ──Yes──→ selectedStar, selectedJob 세팅
        │ No                           │
        ▼                             ▼
selectedStar = null              JobDetailModal 오픈
        │
        ▼
[별 그리드 화면]
IntroBanner + StarCard × 8
        │
        ▼ (StarCard 클릭)
setSelectedStar(star)
        │
        ▼
[직업 목록 화면]
StarInfoBanner + JobCard × N + CTABanner
        │                    │
        │ (JobCard 클릭)     │ (CTABanner 클릭)
        ▼                    ▼
setSelectedJob(job)     router.push('/career?star={id}')
        │
        ▼
[JobDetailModal 오픈]
activeTab = 'process', processStep = 0
        │
        ├── 탭 전환 (process / daily / timeline)
        │       └── setActiveTab + setProcessStep(0)
        │
        ├── [process 탭] 좌우 화살표 / 스와이프 제스처
        │       └── goToStep(processStep ± 1)
        │
        └── X 버튼 클릭
                └── setSelectedJob(null) → 직업 목록 복귀
```

### 11-2. 스와이프 페이지 흐름

```
/jobs/swipe 진입
        │
        ▼
storage.user.get()?.riasecScores 확인
  없음 ──→ router.push('/quiz')
  있음 ──→ setJobs(jobsData)
        │
        ▼
currentJob = jobs[currentIndex] 표시
        │
        ├── ❤️ 버튼 클릭
        │       ├── setDirection('right')
        │       ├── [300ms 후] storage.savedJobs.add(id)
        │       └── currentIndex++ 또는 router.push('/home')
        │
        ├── X 버튼 클릭
        │       ├── setDirection('left')
        │       └── [300ms 후] currentIndex++ 또는 router.push('/home')
        │
        └── ℹ️ 버튼 클릭
                └── router.push('/jobs/{currentJob.id}')
```

### 11-3. JobDetailModal 탭 전환 흐름

```
JobDetailModal 오픈 (activeTab='process', processStep=0)
        │
        ├── [직무 프로세스 탭]
        │       ├── 화살표 버튼 / 스와이프 제스처
        │       │       └── goToStep(step)
        │       │               └── 0 ≤ step < phases.length 검증
        │       └── 점 인디케이터 클릭 → goToStep(i)
        │
        ├── [주요 일과 탭]
        │       ├── job.dailySchedule 있음 → 직접 사용
        │       ├── daily-schedules.json[job.id] 있음 → 사용
        │       └── 둘 다 없음 → "준비 중" 표시
        │
        └── [커리어 패스 탭]
                └── job.careerTimeline.milestones 순회
                        └── period 기반 노드 색상 결정
                                (중학교 → 보라, 고등학교 → star.color, 합격 → 황금)
```

---

## 12. 컴포넌트 Props 명세

### 메인 랜딩 컴포넌트

| 컴포넌트 | Props | 타입 |
|----------|-------|------|
| `HeroSection` | `data` | `HeroSection` |
| `FeatureCard` | `feature`, `index` | `FeatureSection`, `number` |
| `StatsSection` | `data` | `StatsSection` |
| `CTASection` | `data` | `CTASection` |
| `BackgroundEffects` | 없음 | — |

### Explore 컴포넌트

| 컴포넌트 | Props | 타입 |
|----------|-------|------|
| `StarCard` | `star`, `index`, `onClick` | `StarData`, `number`, `() => void` |
| `JobCard` | `job`, `color`, `onClick` | `Job`, `string`, `() => void` |
| `StarInfoBanner` | `star` | `StarData` |
| `CTABanner` | `star` | `StarData` |
| `PageHeader` | `selectedStar`, `onBack` | `StarData \| null`, `() => void` |
| `IntroBanner` | 없음 | — |
| `StarField` | 없음 | — |

### JobDetailModal 컴포넌트

| 컴포넌트 | Props | 타입 |
|----------|-------|------|
| `JobDetailModal` | `job`, `star`, `onClose` | `Job`, `StarData`, `() => void` |
| `ModalHeader` | `job`, `star`, `onClose` | `Job`, `StarData`, `() => void` |
| `ModalTabs` | `activeTab`, `star`, `onTabChange` | `ModalTab`, `StarData`, `(tab: ModalTab) => void` |
| `ProcessTab` | `job`, `star`, `currentPhase`, `processStep`, `phases`, `isLastPhase`, `onStepChange` | 각 타입 참조 |
| `DailyScheduleTab` | `job`, `star` | `Job`, `StarData` |
| `TimelineTab` | `job`, `star` | `Job`, `StarData` |

---

## 13. 설정 파일 & JSON 데이터

### `config.ts` (루트)

| export | 설명 |
|--------|------|
| `COLORS` | primary `#6C5CE7`, secondary, accent, success, danger, info |
| `GRADIENT_COLORS` | purple, blue, green, orange 그라데이션 |
| `ICON_MAP` | Sparkles, Zap, Star 등 Lucide 아이콘 매핑 |
| `LABELS` | 페이지·탭·버튼·통계·CTA 한글 라벨 |
| `ANIMATION_CONFIG` | cardEnterDelay: 100ms, stagger: 80ms, fadeIn: 300ms |
| `ROUTES` | explore, swipe, saved, `detail(id)`, `simulation(id)`, home |
| `LAYOUT` | maxWidth: 430px, padding: 16px, borderRadius 등 |

### `explore/config.ts`

| export | 설명 |
|--------|------|
| `SCHEDULE_TYPE_COLORS` | morning: `#F59E0B`, meeting: `#8B5CF6`, work: `#10B981` 등 |
| `SCHEDULE_TYPE_LABELS` | 아침, 미팅, 작업, 점심, 검토, 행정, 저녁, 현장 |
| `HOLLAND_CODE_LABELS` | R: 현실형, I: 탐구형, A: 예술형, S: 사회형, E: 기업형, C: 관습형 |
| `PHASE_BG_COLORS` | 단계 1~5 배경 그라데이션 |
| `STAR_FIELD_CONFIG` | starCount: 40, 황금각 분포 설정 |
| `LABELS` | explore 전용 한글 라벨 |

### JSON 파일 역할

| 파일 | 역할 |
|------|------|
| `jobs-content.json` | 메인 랜딩 hero, features, stats, cta |
| `jobs.json` | 직업 상세·스와이프용 직업 목록 (`lib/types` Job) |
| `kingdoms.json` | 왕국 메타데이터 (`lib/types` Kingdom) |
| `stars/*.json` | explore용 별·직업 데이터 (직무 프로세스, 커리어 타임라인 등) |
| `daily-schedules.json` | 직업별 하루 일과 (`DailyScheduleTab` 2순위 데이터) |

---

## 14. 추후 백엔드 연동 포인트

| 기능 | 현재 (프론트 전용) | 백엔드 연동 시 |
|------|-------------------|---------------|
| 직업 목록 | `jobs.json`, `stars/*.json` | `GET /api/jobs`, `GET /api/stars` |
| 저장된 직업 | `storage.savedJobs` (localStorage) | `GET /api/user/saved-jobs` |
| 저장 토글 | localStorage 직접 조작 | `POST /api/user/saved-jobs/:id` |
| RIASEC 기반 추천 | 클라이언트 전체 목록 | `GET /api/jobs/recommended?riasec=...` |
| 하루 일과 데이터 | `daily-schedules.json` | `GET /api/jobs/:id/daily-schedule` |
| 하루 시뮬레이션 | `/simulation/[id]` 라우트 | 시뮬레이션 API 연동 |
| 커리어 패스 연동 | URL 쿼리 파라미터 | 동일 (라우트 유지) |

---

*최종 업데이트: 2026-03-07*
