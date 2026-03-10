# 직업 탐색 (Jobs) — 기능 문서

> 경로: `frontend/app/jobs/`
> 프레임워크: Next.js 15 App Router · TypeScript · Tailwind CSS · Framer Motion

---

## 목차

1. [개요](#1-개요)
2. [전체 라우트 구조](#2-전체-라우트-구조)
3. [전체 파일 구조](#3-전체-파일-구조)
4. [데이터 소스](#4-데이터-소스)
5. [메인 랜딩 페이지 (`/jobs`)](#5-메인-랜딩-페이지-jobs)
6. [탐색 페이지 (`/jobs/explore`)](#6-탐색-페이지-jobsexplore)
7. [직업탐색 탭 — 별 선택 & 직업 목록](#7-직업탐색-탭--별-선택--직업-목록)
8. [직업 상세 모달 (`JobDetailModal`)](#8-직업-상세-모달-jobdetailmodal)
9. [고입 탐색 탭 (`HighSchoolAdmissionTab`)](#9-고입-탐색-탭-highschooladmissiontab)
10. [스와이프 페이지 (`/jobs/swipe`)](#10-스와이프-페이지-jobsswipe)
11. [직업 상세 페이지 (`/jobs/[jobId]`)](#11-직업-상세-페이지-jobsjobid)
12. [공통 컴포넌트](#12-공통-컴포넌트)
13. [TypeScript 타입 구조](#13-typescript-타입-구조)
14. [설정 파일 (`config.ts`)](#14-설정-파일-configts)
15. [유저 시나리오](#15-유저-시나리오)
16. [백엔드 연동 포인트](#16-백엔드-연동-포인트)

---

## 1. 개요

직업 탐색 기능은 학생이 **8개 왕국(별)**의 다양한 직업을 탐색하고, 스와이프 매칭·하루 시뮬레이션·커리어 패스와 연동하여 진로를 탐색할 수 있는 핵심 기능입니다.

**주요 기능 요약**

| 기능 | 설명 | 진입 경로 |
|------|------|-----------|
| 직업 탐색 | 8개 별(왕국)별 직업 목록 탐색 | `/jobs/explore` → 직업탐색 탭 |
| 직업 상세 모달 | 직무 프로세스·주요 일과·커리어 패스 탭 | explore에서 직업 클릭 |
| 고입 탐색 | 10개 고교 유형 행성 UI, 학교 상세, 적성 체크 | `/jobs/explore` → 고입 탐색 탭 |
| 스와이프 매칭 | RIASEC 기반 추천 직업 스와이프 | `/jobs/swipe` |
| 직업 상세 페이지 | 연봉·역량·레벨별(L1~L5) 상세 | `/jobs/[jobId]` |
| 하루 시뮬레이션 | 직업인의 하루 체험 | `/simulation/[id]` (외부 연동) |
| 커리어 패스 연동 | 직업 선택 후 커리어 패스 만들기 | `/career?star=[starId]` |

---

## 2. 전체 라우트 구조

```text
/jobs
├── /                      # 메인 랜딩 (히어로·기능·통계·CTA)
├── /explore               # 직업탐색 탭 + 고입 탐색 탭
├── /swipe                 # 스와이프 매칭 (RIASEC 기반)
└── /[jobId]               # 직업 상세 페이지 (jobs.json 기반)
```

---

## 3. 전체 파일 구조

```text
frontend/app/jobs/
├── page.tsx                              # 메인 랜딩 페이지
├── config.ts                             # COLORS, LABELS, ROUTES, LAYOUT 등
├── types.ts                              # JobsPageData, HeroSection, FeatureSection 등
├── README.md                             # 이 문서
│
├── components/                           # 메인 랜딩 전용 컴포넌트
│   ├── index.ts
│   ├── HeroSection.tsx                   # 히어로 배너 (Framer Motion)
│   ├── FeatureCard.tsx                   # 기능 카드 (클릭 시 라우트 이동)
│   ├── StatsSection.tsx                  # 통계 그리드 (2×2)
│   ├── CTASection.tsx                    # 하단 CTA
│   └── BackgroundEffects.tsx             # 배경 별 반짝임 효과
│
├── explore/                              # 탐색 페이지
│   ├── page.tsx                          # 탐색 메인 (직업탐색 / 고입 탐색 탭)
│   ├── config.ts                         # LABELS, SCHEDULE_TYPE_COLORS, HIGH_SCHOOL_LABELS, JOB_ROUTE_LABELS 등
│   ├── types.ts                          # StarData, Job, WorkPhase, Milestone, HighSchoolAdmissionV2Data 등
│   │
│   ├── components/
│   │   ├── index.ts
│   │   ├── StarField.tsx                 # 배경 별 반짝임 효과
│   │   ├── StarCard.tsx                  # 별 선택 카드 (2열 그리드)
│   │   ├── JobCard.tsx                   # 직업 목록 카드
│   │   ├── IntroBanner.tsx               # 별 선택 전 소개 배너
│   │   ├── StarInfoBanner.tsx            # 별 선택 후 별 정보 배너
│   │   ├── CTABanner.tsx                 # 커리어 패스 만들기 배너
│   │   ├── PageHeader.tsx                # 상단 헤더
│   │   ├── PhaseIllustration.tsx         # 직무 프로세스 단계 일러스트
│   │   ├── CareerPathStyleDialog.tsx     # 공통 바텀시트 다이얼로그 래퍼
│   │   │
│   │   ├── JobDetailModal/               # 직업 상세 모달 (바텀시트)
│   │   │   ├── index.tsx                 # 모달 루트 (CareerPathStyleDialog 사용)
│   │   │   ├── ModalHeader.tsx           # 직업명·별이름·홀랜드코드·닫기
│   │   │   ├── ModalTabs.tsx             # 탭 바 (직무 프로세스·주요 일과·커리어 패스)
│   │   │   ├── ModalControls.tsx         # 모달 컨트롤 버튼
│   │   │   ├── ProcessTab.tsx            # 직무 프로세스 탭 (단계별 슬라이드)
│   │   │   ├── DailyScheduleTab.tsx      # 주요 일과 탭 (타임라인)
│   │   │   └── TimelineTab.tsx           # 커리어 패스 탭 (마일스톤)
│   │   │
│   │   ├── HighSchoolAdmissionTab/       # 고입 탐색 탭 (신규)
│   │   │   ├── index.tsx                 # 탭 루트 (뷰 상태 관리)
│   │   │   ├── PlanetOrbitView.tsx       # 행성 궤도 애니메이션 UI
│   │   │   ├── SchoolCategoryView.tsx    # 카테고리별 학교 목록
│   │   │   ├── SchoolDetailModal.tsx     # 학교 상세 모달 (3탭)
│   │   │   ├── CategoryTraitDetailDialog.tsx # 카테고리 특성 상세 다이얼로그
│   │   │   ├── SchoolTypeCard.tsx        # 학교 유형 카드
│   │   │   ├── DecisionFlowCard.tsx      # 의사결정 플로우 카드
│   │   │   ├── AptitudeCheckSection.tsx  # 적성 체크 (예/아니오 플로우)
│   │   │   ├── IdentityMentalSection.tsx # 정체성 & 멘탈 섹션
│   │   │   └── category-trait-detail-config.ts # 특성 상세 설정
│   │   │
│   │   └── JobCareerRouteTab/            # 직업 커리어 루트 탭 (컴포넌트)
│   │       ├── index.tsx                 # 루트 탭 (카테고리 탭 + 직업 목록)
│   │       ├── JobRouteCard.tsx          # 직업 루트 카드 (펼치기/접기)
│   │       └── RouteOverviewCard.tsx     # 전체 연결도 카드
│   │
│   └── constants/
│       ├── jobIllustrations.tsx          # 직업별 SVG 일러스트레이션
│       └── jobIllustrations_full.txt     # SVG 원본 텍스트 (참고용)
│
├── swipe/
│   └── page.tsx                          # 스와이프 매칭 페이지
│
└── [jobId]/
    └── page.tsx                          # 직업 상세 페이지 (L1~L5 탭)
```

---

## 4. 데이터 소스

| 파일 | 역할 | 사용 위치 |
|------|------|-----------|
| `data/jobs-content.json` | 메인 랜딩 hero, features, stats, cta | `page.tsx` |
| `data/jobs.json` | 직업 상세·스와이프용 직업 목록 (`lib/types` Job) | `[jobId]/page.tsx`, `swipe/page.tsx` |
| `data/kingdoms.json` | 왕국 메타데이터 | `[jobId]/page.tsx`, `swipe/page.tsx` |
| `data/stars/*.json` | explore용 별·직업 데이터 (8개 파일) | `explore/page.tsx` |
| `data/daily-schedules.json` | 직업별 하루 일과 데이터 | `DailyScheduleTab.tsx` |
| `data/high-school/meta.json` | 고입 탐색 메타·공통 데이터 | `HighSchoolAdmissionTab/index.tsx` |
| `data/high-school/*.json` | 고교 카테고리별 데이터 (10개 파일) | `HighSchoolAdmissionTab/index.tsx` |
| `data/job-career-routes.json` | 직업 커리어 루트 (고입→대입→취업) | `JobCareerRouteTab/index.tsx` |

### 고교 카테고리 데이터 파일 (10개)

| 파일 | 고교 유형 |
|------|-----------|
| `science_high.json` | 과학고 |
| `foreign_language.json` | 외국어고 |
| `international.json` | 국제고 |
| `ib.json` | IB 인증 학교 |
| `autonomous_public.json` | 자율형 공립고 |
| `autonomous_private.json` | 자율형 사립고 |
| `arts_sports.json` | 예술·체육고 |
| `meister.json` | 마이스터고 |
| `business.json` | 상업고 |
| `general_elite.json` | 일반고 명문 |

> **중요**: `explore`는 `stars/*.json` 기반, `[jobId]`·`swipe`는 `jobs.json`·`kingdoms.json` 기반으로 **서로 다른 데이터 소스**를 사용합니다.

---

## 5. 메인 랜딩 페이지 (`/jobs`)

**파일**: `page.tsx`

### 화면 구성

```text
JobsPage
├── BackgroundEffects          # fixed, pointer-events-none (30개 별, 황금각 분포)
├── Header (sticky)            # LABELS.page_title, LABELS.page_subtitle
└── main content (px-4, py-6)
    ├── HeroSection            # jobs-content.json → hero (Framer Motion 등장)
    ├── section "주요 기능"
    │   └── FeatureCard × N    # jobs-content.json → features[]
    ├── StatsSection           # jobs-content.json → stats (2×2 그리드)
    └── CTASection             # jobs-content.json → cta
```

### 컴포넌트 동작

| 컴포넌트 | 동작 |
|----------|------|
| `BackgroundEffects` | 30개 별, 황금각 분포 `x=(i*137.5)%100`, CSS `twinkle` 애니메이션 |
| `HeroSection` | Framer Motion `initial→animate` 순차 등장 (delay 0.2→0.5) |
| `FeatureCard` | `index*0.1`s 딜레이 순차 등장, 클릭 시 `router.push(feature.link.href)` |
| `StatsSection` | `item.color`로 카드별 강조색, `radial-gradient` 글로우 |
| `CTASection` | 주요 버튼 → `/jobs/explore`, 보조 버튼 → `/jobs/swipe` |

---

## 6. 탐색 페이지 (`/jobs/explore`)

**파일**: `explore/page.tsx`

### 상태 관리

```typescript
const [activeTab, setActiveTab] = useState<ExploreTabId>('star');
const [selectedStar, setSelectedStar] = useState<StarData | null>(null);
const [selectedJob, setSelectedJob] = useState<Job | null>(null);
const [showStarProfile, setShowStarProfile] = useState(false);
```

| 상태 | 초기값 | 역할 |
|------|--------|------|
| `activeTab` | `'star'` | 상단 탭 (`'star'` \| `'admission'`) |
| `selectedStar` | `null` | 선택된 별. null이면 별 그리드, 값이면 직업 목록 |
| `selectedJob` | `null` | 선택된 직업. 값이면 JobDetailModal 표시 |
| `showStarProfile` | `false` | 별 프로필 패널 표시 여부 |

### 상단 탭 구조

```text
[직업탐색 ⭐]  [고입 탐색 🎓]
```

- `activeTab === 'star'` → 별 선택 & 직업 목록 화면
- `activeTab === 'admission'` → `HighSchoolAdmissionTab` 렌더
- 탭 전환 시 `selectedStar`, `selectedJob` 초기화

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

- 외부에서 `?starId=tech&jobId=developer`로 직접 진입 시 모달 자동 오픈

### 화면 전환 로직

```text
activeTab === 'star'
  selectedStar === null  → IntroBanner + StarCard × 8
  selectedStar !== null  → StarInfoBanner + JobCard × N + CTABanner

activeTab === 'admission' → HighSchoolAdmissionTab

selectedJob !== null → JobDetailModal (바텀시트 오버레이)
TabBar: selectedJob === null 일 때만 표시
```

---

## 7. 직업탐색 탭 — 별 선택 & 직업 목록

### 별 데이터 로드

```typescript
const stars = [
  exploreStar, createStar, techStar, connectStar,
  natureStar, orderStar, communicateStar, challengeStar,
] as StarData[];
```

- 8개 별 JSON을 정적 import (`data/stars/*.json`)
- `stars.length < 8`이면 나머지를 "준비 중" 플레이스홀더로 채움

### `StarCard` 컴포넌트

- `star.bgColor`로 카드 배경 그라데이션
- `star.color`로 테두리·뱃지·글로우 색상
- `index * 0.08`s 딜레이로 순차 slide-up 애니메이션
- hover 시 `radial-gradient` 글로우 오버레이

### `JobCard` 컴포넌트

- `JOB_ILLUSTRATIONS[job.id]` SVG가 있으면 일러스트, 없으면 `job.icon` 이모지
- 홀랜드 코드 뱃지, 연봉 범위, 미래 성장성 별점(1~5) 표시

### `StarInfoBanner` 컴포넌트

- 별 이름·설명·직업 수 표시
- `starProfile` 있으면 "상세 보기" 버튼 → `StarProfilePanel` 오픈

### `CTABanner` 컴포넌트

- "커리어 패스 만들기" 버튼 → `router.push('/career?star={star.id}')`

---

## 8. 직업 상세 모달 (`JobDetailModal`)

**파일**: `explore/components/JobDetailModal/index.tsx`

### 구조

`CareerPathStyleDialog` 래퍼 안에 렌더됩니다.

```text
CareerPathStyleDialog (portal, fixed inset-0, z-9999)
└── JobDetailModal (maxHeight: calc(100vh - 56px))
    ├── ModalHeader          # 직업명·별이름·홀랜드코드·닫기
    ├── ModalTabs            # 탭 바 (3개 탭)
    └── 스크롤 영역 (flex-1 overflow-y-auto)
        ├── [process] ProcessTab
        ├── [daily]   DailyScheduleTab
        └── [timeline] TimelineTab
```

### 탭 목록

| 탭 id | 라벨 | 내용 |
|-------|------|------|
| `process` | 직무 프로세스 | 단계별 슬라이드 (화살표/스와이프 제스처) |
| `daily` | 주요 일과 | 하루 타임라인 |
| `timeline` | 커리어 패스 | 중학교~대학교 마일스톤 |

### `ProcessTab` 동작

- 단계 슬라이드: 좌우 화살표 버튼 + 터치 스와이프 (`|dx| > 50px` 판정)
- 점 인디케이터: 활성 24px pill, 비활성 8px 원형
- 마지막 단계에서 직업 종합 정보 표시 (연봉·AI 대체 위험·미래 성장성)

### `DailyScheduleTab` 데이터 우선순위

```typescript
// 1순위: job 객체 내 dailySchedule (stars/*.json 직접 포함)
// 2순위: daily-schedules.json에서 job.id로 조회
const schedule = job.dailySchedule ?? schedules[job.id];
// 둘 다 없으면 "준비 중" 표시
```

### `TimelineTab` 마일스톤 노드 색상

| 조건 | 색상 |
|------|------|
| `awards`에 '합격' 포함 | 황금색 `#FBBF24` |
| `period.startsWith('고')` | `star.color` 그라데이션 |
| `period.startsWith('중')` | 보라색 `#8B5CF6` |
| 그 외 | 초록색 `#10B981` |

---

## 9. 고입 탐색 탭 (`HighSchoolAdmissionTab`)

**파일**: `explore/components/HighSchoolAdmissionTab/index.tsx`

### 뷰 상태 구조

```typescript
type AdmissionViewState =
  | { view: 'planet' }                        // 행성 궤도 메인 화면
  | { view: 'category'; category: HighSchoolCategory } // 카테고리별 학교 목록
  | { view: 'aptitude' }                      // 적성 체크
  | { view: 'identity' };                     // 정체성 & 멘탈
```

### 화면 전환 흐름

```text
[planet 뷰] ─ 행성 클릭 ──→ [category 뷰] ─ 학교 클릭 ──→ SchoolDetailModal
              ↓                              ↑
         적성 체크 버튼                   뒤로가기
              ↓
         [aptitude 뷰]
              ↓
         정체성 & 멘탈 버튼
              ↓
         [identity 뷰]
```

### `PlanetOrbitView` 컴포넌트

- 320×320 SVG 캔버스에 행성 궤도 애니메이션
- `requestAnimationFrame` 기반 실시간 각도 업데이트
- 각 행성: `category.planet.orbitRadius * 0.75` 반지름, `360 / orbitSpeed` 각속도
- 중심 별(⭐) + 점선 궤도 원 + 행성 버튼 + 하단 범례 그리드

### `SchoolCategoryView` 컴포넌트

- 카테고리 특성 3개 미리보기 + "상세 보기 + 적성 검사" 버튼
- `CategoryTraitDetailDialog` 오픈 시 나머지 특성 + 적성 검사 표시
- 학교 목록: `SchoolListCard` × N (난이도 별점, IB인증/기숙사 뱃지, 하이라이트 스탯)

### `SchoolDetailModal` 컴포넌트

`CareerPathStyleDialog` 래퍼 사용, 3개 탭 구조:

| 탭 id | 라벨 | 내용 |
|-------|------|------|
| `intro` | 학교·입시 | 학교 소개, 입학 전형, 합격 전략 |
| `roadmap` | 로드맵·팁 | 중1~중3 커리어 패스 상세, 생존 팁 |
| `reallife` | 솔직 후기 | 하루 일과, 실제 후기 (`realTalk`) |

### `AptitudeCheckSection` 컴포넌트

- 예/아니오 질문 플로우 (`data.questions` 순회)
- `question.yes / question.no` → 다음 질문 id 또는 카테고리 id
- 결과: 추천 카테고리 → `onSelectCategory(category)` 호출
- 리셋 버튼으로 처음부터 재시작

### `IdentityMentalSection` 컴포넌트

- `data.identityAndMentalStrength.tips` 목록 렌더
- 뒤로가기 → `planet` 뷰로 복귀

---

## 10. 스와이프 페이지 (`/jobs/swipe`)

**파일**: `swipe/page.tsx`

### 진입 조건

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

### 스와이프 처리

```typescript
handleSwipe(liked: boolean):
  1. setDirection(liked ? 'right' : 'left')
  2. setTimeout(300ms):
     - liked → storage.savedJobs.add(currentJob.id)
     - currentIndex < jobs.length - 1 → 다음 카드
     - else → router.push('/home')
```

| direction | CSS 클래스 |
|-----------|-----------|
| `'left'` | `-translate-x-[200%] rotate-[-20deg] opacity-0` |
| `'right'` | `translate-x-[200%] rotate-[20deg] opacity-0` |
| `null` | `translate-x-0 rotate-0 opacity-100` |

### 화면 구성

```text
JobSwipePage
├── Header (sticky)           # 현재 인덱스 / 전체 수
├── 카드 영역 (flex-1)
│   └── Card (직업 아이콘·이름·설명·연봉·학력·전망)
└── 액션 버튼 (sticky bottom)
    ├── X 버튼 → handleSwipe(false)
    ├── ℹ️ 버튼 → router.push('/jobs/{id}')
    └── ❤️ 버튼 → handleSwipe(true)
```

---

## 11. 직업 상세 페이지 (`/jobs/[jobId]`)

**파일**: `[jobId]/page.tsx`

### 데이터 로드

```typescript
useEffect(() => {
  const foundJob = (jobsData as Job[]).find(j => j.id === jobId);
  setJob(foundJob || null);
  if (foundJob) {
    const k = (kingdomsData as Kingdom[]).find(k => k.id === foundJob.kingdomId);
    setKingdom(k || null);
    setIsSaved(storage.savedJobs.getAll().includes(foundJob.id));
  }
}, [jobId]);
```

### 저장 토글

```typescript
toggleSave():
  isSaved → storage.savedJobs.remove(job.id) → setIsSaved(false)
  !isSaved → storage.savedJobs.add(job.id) → setIsSaved(true)
```

### 화면 구성

```text
JobDetailPage
├── 헤더 이미지 영역 (h-72)
│   ├── 직업 아이콘 (text-9xl)
│   ├── 뒤로가기 버튼 (absolute top-4 left-4)
│   └── 북마크 버튼 (absolute top-4 right-4)
├── 본문 (p-4)
│   ├── 왕국 배지 + 난이도 배지
│   ├── 직업 제목 + 짧은 설명
│   ├── CTA "하루 시뮬레이션 시작" → /simulation/[id]
│   ├── 통계 그리드 (2×2): 평균 연봉·학력·성장 전망·직업 인구
│   └── Tabs (개요 / L1 / L2 / L3 / L4)
│       ├── 개요: 직업 설명 + 필요 역량 + 관련 자격증
│       └── L1~L4: LevelContent (레벨 제목·설명·주요 업무·역량)
```

---

## 12. 공통 컴포넌트

### `CareerPathStyleDialog`

**파일**: `explore/components/CareerPathStyleDialog.tsx`

- `createPortal`로 `document.body`에 렌더
- 하단에서 올라오는 바텀시트 형태 (`rounded-t-3xl`)
- `max-w-[430px]`, `maxHeight: calc(100vh - 56px)`, 다크 테마 (`#0d0d24`)
- 배경 클릭 시 `onClose()` 호출, 내부 클릭은 `stopPropagation`
- `JobDetailModal`, `SchoolDetailModal`, `CategoryTraitDetailDialog`에서 공통 사용

---

## 13. TypeScript 타입 구조

### 메인 랜딩 (`types.ts`)

```typescript
interface JobsPageData {
  hero: HeroSection;
  features: FeatureSection[];
  stats: StatsSection;
  cta: CTASection;
}
```

### Explore 핵심 타입 (`explore/types.ts`)

```typescript
type StarData = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  bgColor: string;
  jobCount: number;
  jobs: Job[];
  starProfile?: StarProfile;  // StarProfileTree | StarProfileLegacy
};

type Job = {
  id: string;
  name: string;
  icon: string;
  shortDesc: string;
  holland: string;          // 'R', 'I+A', 'E+S' 등
  salaryRange: string;
  futureGrowth: number;     // 1~5
  aiRisk: string;
  workProcess: { phases: WorkPhase[] };
  careerTimeline: { milestones: Milestone[]; keySuccess: string[]; ... };
  dailySchedule?: DailySchedule;
};
```

### 고입 탐색 타입 (`explore/types.ts`)

```typescript
type HighSchoolCategory = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
  planet: SchoolPlanetConfig;   // size, orbitRadius, orbitSpeed, glowColor
  categoryTraits: SchoolCategoryTraits;
  schools: HighSchoolDetail[];
};

type HighSchoolDetail = {
  id: string;
  name: string;
  difficulty: number;           // 1~5
  annualAdmission: number;
  ibCertified: boolean;
  dormitory: boolean;
  admissionProcess: SchoolAdmissionStep[];
  careerPath: SchoolCareerPath;
  careerPathDetails?: SchoolCareerPathDetail[];
  highlightStats?: SchoolHighlightStat[];
  realTalk?: SchoolRealTalkItem[];
  dailySchedule?: SchoolDailyScheduleItem[];
  survivalTips?: SchoolSurvivalTip[];
  // ...
};
```

### 직업 커리어 루트 타입 (`explore/types.ts`)

```typescript
type JobCareerRoute = {
  id: string;
  name: string;
  company: string;
  salaryRange: string;
  difficulty: number;
  recommendedHighSchool: string[];
  recommendedUniversities: RecommendedUniversity[];
  careerPath: CareerStage[];
  keyPreparation: string[];
  futureOutlook: string;
};
```

---

## 14. 설정 파일 (`config.ts`)

### `jobs/config.ts` (루트)

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
| `LABELS` | explore 전용 한글 라벨 (직업탐색·고입 탐색 탭 포함) |
| `HIGH_SCHOOL_LABELS` | 고입 탐색 전용 라벨 |
| `JOB_ROUTE_LABELS` | 직업 커리어 루트 전용 라벨 |

---

## 15. 유저 시나리오

### 시나리오 A: 직업 탐색 → 커리어 패스 연동

```text
1. 하단 탭바 "직업 체험" 탭 클릭 → /jobs/explore
2. 상단 탭 "직업탐색" 선택 (기본값)
3. 8개 별 그리드 확인
4. "기술 별" 클릭 → 직업 목록 표시
5. "소프트웨어 개발자" 클릭 → JobDetailModal 오픈
6. "직무 프로세스" 탭 확인 (기본)
   - 화살표 클릭 또는 좌우 스와이프로 단계 이동
7. "주요 일과" 탭 → 하루 타임라인 확인
8. "커리어 패스" 탭 → 마일스톤 확인
9. X 버튼으로 모달 닫기
10. "커리어 패스 만들기" CTABanner 클릭 → /career?star=tech
```

### 시나리오 B: 고입 탐색 → 학교 상세 확인

```text
1. /jobs/explore 진입
2. 상단 탭 "고입 탐색" 클릭
3. 행성 궤도 UI 확인 (10개 행성 회전)
4. 원하는 행성 클릭 → 카테고리 학교 목록
5. 학교 카드 클릭 → SchoolDetailModal 오픈
6. "학교·입시" 탭 → 입학 전형·합격 전략 확인
7. "로드맵·팁" 탭 → 중1~중3 커리어 패스 확인
8. "솔직 후기" 탭 → 실제 학교 생활 후기 확인
9. 모달 닫기 → 목록 복귀
```

### 시나리오 C: 적성 체크로 고교 추천

```text
1. /jobs/explore → 고입 탐색 탭
2. "적성 체크" 버튼 클릭
3. 예/아니오 질문 플로우 진행
4. 결과: 추천 고교 카테고리 표시
5. "자세히 보기" → 해당 카테고리 학교 목록 이동
```

### 시나리오 D: 스와이프로 직업 저장

```text
1. /jobs 랜딩 → "스와이프 매칭" 클릭 → /jobs/swipe
2. RIASEC 없으면 /quiz 리다이렉트
3. 직업 카드 확인
4. ❤️ → 저장, X → 패스, ℹ️ → /jobs/[id] 상세
5. 모든 직업 완료 → /home
```

### 시나리오 E: URL 딥링크 (커리어 패스 연동)

```text
1. 커리어 패스 타임라인에서 직업 클릭
2. /jobs/explore?starId=tech&jobId=developer 이동
3. useEffect에서 쿼리 파라미터 감지
   → selectedStar = techStar, selectedJob = developer
4. 별 목록 건너뛰고 바로 JobDetailModal 오픈
```

---

## 16. 백엔드 연동 포인트

| 기능 | 현재 (프론트 전용) | 백엔드 연동 시 |
|------|-------------------|---------------|
| 직업 목록 | `jobs.json`, `stars/*.json` | `GET /api/jobs`, `GET /api/stars` |
| 고교 데이터 | `data/high-school/*.json` | `GET /api/high-schools/categories` |
| 직업 커리어 루트 | `data/job-career-routes.json` | `GET /api/job-career-routes` |
| 저장된 직업 | `storage.savedJobs` (localStorage) | `GET /api/user/saved-jobs` |
| 저장 토글 | localStorage 직접 조작 | `POST /api/user/saved-jobs/:id` |
| RIASEC 기반 추천 | 클라이언트 전체 목록 | `GET /api/jobs/recommended?riasec=...` |
| 하루 일과 데이터 | `daily-schedules.json` | `GET /api/jobs/:id/daily-schedule` |
| 하루 시뮬레이션 | `/simulation/[id]` 라우트 | 시뮬레이션 API 연동 |

---

최종 업데이트: `2026-03-09`
