# 별자리 탐험 (Explore) — 기능 문서

> 경로: `frontend/app/explore/`
> 성격: 왕국(별) 목록 → 왕국별 직업 목록 2단계 탐색 모듈

## 개요

`/explore`는 8개 왕국(별)을 카드 그리드로 보여주고, 왕국을 선택하면 해당 왕국의 직업 목록을 확인할 수 있는 탐색 화면입니다.

`/jobs/explore`가 별 선택 → 직업 목록 → 직업 상세 모달까지 단일 페이지 안에서 처리하는 것과 달리, `/explore`는 **라우트 분리 방식**을 사용합니다.

| 라우트 | 역할 |
|--------|------|
| `/explore` | 8개 왕국 카드 그리드 |
| `/explore/[kingdomId]` | 선택한 왕국의 직업 목록 |

직업 카드를 클릭하면 `/jobs/[jobId]`로 이동합니다.

## 라우트 구조

```text
frontend/app/explore/
├── page.tsx              # 왕국 목록 (별자리 지도)
└── [kingdomId]/
    └── page.tsx          # 왕국 상세 (직업 목록)
```

## 데이터 소스

| 파일 | 역할 | 사용 위치 |
|------|------|-----------|
| `frontend/data/kingdoms.json` | 8개 왕국 메타데이터 | 두 페이지 모두 |
| `frontend/data/jobs.json` | 직업 목록 (`kingdomId` 기준 필터) | `[kingdomId]/page.tsx` |

### Kingdom 타입 (`lib/types.ts`)

```typescript
interface Kingdom {
  id: KingdomId;           // 'explore' | 'create' | 'tech' | 'nature' | 'connect' | 'order' | 'communicate' | 'challenge'
  name: string;            // '탐구의 별', '기술의 별' 등
  icon: string;            // Lucide 아이콘 이름 (예: 'Microscope')
  color: string;           // 카드 테마 색상 hex
  bgColor: string;         // 카드 배경 색상 hex
  description: string;
  riasecTypes: RIASECType[]; // ['I'], ['R', 'I'] 등
  jobCount: number;
}
```

### Job 타입 (`lib/types.ts`) — 목록 표시에 사용하는 필드

```typescript
interface Job {
  id: string;
  name: string;
  nameEn: string;
  kingdomId: KingdomId;
  icon: string;
  rarity: 'normal' | 'rare' | 'epic' | 'legend';
  shortDescription: string;
  difficulty?: string;
  avgSalary?: string;
  // ...L1~L5 상세 데이터 (목록에서는 미사용)
}
```

## 8개 왕국 목록

| id | 이름 | RIASEC | 설명 |
|----|------|--------|------|
| `explore` | 탐구의 별 | I | 분석과 연구 |
| `create` | 창작의 별 | A | 창의적 표현 |
| `tech` | 기술의 별 | R, I | 기술 실행 |
| `nature` | 자연의 별 | I, R | 생명과 자연 |
| `connect` | 연결의 별 | S | 사람을 돕고 가르침 |
| `order` | 질서의 별 | C, E | 규칙과 정의 |
| `communicate` | 소통의 별 | A, E | 미디어와 이야기 |
| `challenge` | 도전의 별 | E | 진취적 창업 |

## 왕국 목록 페이지 (`/explore`)

**파일**: `page.tsx`

### 화면 구성

```text
ExplorePage
├── 배경 (fixed)
│   ├── 방사형 그라데이션 (보라/파랑)
│   └── 반짝이는 별 25개 (twinkle 애니메이션)
├── 헤더 (sticky)
│   ├── 페이지 제목: "별자리 탐험"
│   ├── 부제목: "8개의 직업 별을 발견하세요"
│   └── XPBar (현재 XP / 레벨 진행률)
└── 본문
    ├── 별자리 지도 타이틀 섹션
    ├── StarCard × 8 (2열 그리드)
    │   └── onClick → router.push('/explore/{kingdom.id}')
    └── 별 안내 범례 (RIASEC 유형 설명)
```

### StarCard 컴포넌트

- `kingdom.bgColor`로 카드 배경 그라데이션
- `kingdom.color`로 테두리, 뱃지, 글로우 색상
- `index * 0.1`초 딜레이로 순차 slide-up 애니메이션
- hover 시 `conic-gradient` 오비탈 링 회전 + 카드 위로 이동
- 카드 내부 별 아이콘에 궤도 도트 2개 회전 애니메이션 (`animate-orbit`, `animate-orbit-reverse`)
- RIASEC 타입 뱃지 표시 (`kingdom.riasecTypes?.join('·')`)
- 왕국별 직업 수 표시 (`kingdom.jobCount || 25`)

### XPBar

- `storage.xp.get()`으로 총 XP 로드
- `getXPProgress(totalXP)`로 현재 레벨 진행률 계산
- 1초 주기로 폴링하여 실시간 갱신

## 왕국 상세 페이지 (`/explore/[kingdomId]`)

**파일**: `[kingdomId]/page.tsx`

### 데이터 로드

```typescript
useEffect(() => {
  const k = (kingdomsData as Kingdom[]).find(k => k.id === kingdomId);
  setKingdom(k || null);

  const filteredJobs = (jobsData as Job[]).filter(j => j.kingdomId === kingdomId);
  setJobs(filteredJobs);
}, [kingdomId]);
```

- `kingdoms.json`에서 `id === kingdomId`인 왕국 1개 조회
- `jobs.json`에서 `kingdomId === kingdomId`인 직업 목록 필터링

### 화면 구성

```text
KingdomDetailPage
├── 배경 (fixed)
│   ├── kingdom.color 기반 방사형 그라데이션
│   └── 파티클 20개 (particle-rise 애니메이션)
├── 히어로 헤더 (h-264)
│   ├── 뒤로가기 버튼 → router.back()
│   ├── RIASEC 타입 뱃지
│   ├── 왕국 아이콘 (Star, animate-float + animate-pulse-glow)
│   ├── 왕국 이름
│   └── 왕국 설명
├── 직업 목록 영역 (z-10, -mt-4)
│   ├── 직업 수 표시 바
│   └── JobCard × N
│       └── onClick → router.push('/jobs/{job.id}')
└── [직업 없음] 준비 중 안내 UI
```

### JobCard 컴포넌트

- `storage.simulations.getAll()`로 시뮬레이션 완료 직업 확인
- `isExplored = simLogs.some(log => log.jobId === job.id)`
- 탐험 완료 직업에는 초록색 Sparkles 뱃지 표시
- 직업 아이콘, 이름, 짧은 설명, 난이도, 평균 연봉, 희귀도 표시
- hover 시 `kingdom.color` 기반 글로우 그림자
- 클릭 시 `/jobs/[job.id]`로 이동

## 사용자 흐름

```text
1. /explore 진입
2. 8개 왕국 카드 확인
3. 관심 왕국 카드 클릭 → /explore/[kingdomId] 이동
4. 왕국 히어로 헤더 확인 (이름, 설명, RIASEC 타입)
5. 직업 목록 스크롤
6. 직업 카드 클릭 → /jobs/[jobId] 이동 (직업 상세 페이지)
```

## 탐험 완료 표시 로직

`[kingdomId]/page.tsx`의 `JobCard`는 `storage.simulations`를 참조하여 이미 시뮬레이션을 완료한 직업에 뱃지를 표시합니다.

```typescript
const simLogs = storage.simulations.getAll();
const isExplored = simLogs.some(log => log.jobId === job.id);
```

시뮬레이션 로그는 `/simulation/[jobId]` 완료 시 `storage.simulations.add()`로 기록됩니다.

## 관련 라우트와의 관계

| 라우트 | 관계 |
|--------|------|
| `/jobs/explore` | 동일한 왕국/직업 탐색이지만 단일 페이지 구조, 직업 상세 모달 포함 |
| `/jobs/[jobId]` | `/explore/[kingdomId]`에서 직업 클릭 시 이동하는 직업 상세 페이지 |
| `/simulation/[jobId]` | 직업 상세에서 시뮬레이션 시작 시 이동 |
| `/career` | 커리어 패스 연동 |

## 공통 컴포넌트 의존

| 컴포넌트 | 역할 |
|----------|------|
| `TabBar` | 하단 탭 바 (`/explore` 페이지에만 표시) |
| `XPBar` | XP 진행률 바 (`/explore` 페이지 헤더) |

## 백엔드 연동 시 포인트

| 기능 | 현재 | 이후 API 예시 |
|------|------|---------------|
| 왕국 목록 | `kingdoms.json` | `GET /api/kingdoms` |
| 직업 목록 | `jobs.json` 필터 | `GET /api/kingdoms/:id/jobs` |
| 탐험 완료 여부 | `localStorage` simulations | `GET /api/user/simulations` |
| XP 진행률 | `localStorage` xp | `GET /api/user/xp` |

---

최종 업데이트: `2026-03-09`
