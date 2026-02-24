# Jobs Explore Page - 파일 구조 시각화

## 📂 전체 구조

```
frontend/app/jobs/explore/
│
├── 📄 page.tsx                    (100줄) ← 메인 페이지
├── 📄 types.ts                    (50줄)  ← 타입 정의
├── 📄 config.ts                   (70줄)  ← 설정 & 라벨
│
├── 📁 components/                 (9개 컴포넌트)
│   │
│   ├── 📄 index.ts               ← Export 파일
│   │
│   ├── 📄 StarField.tsx          (30줄)  ← 배경 별 효과
│   ├── 📄 StarCard.tsx           (60줄)  ← 별 카드
│   ├── 📄 JobCard.tsx            (70줄)  ← 직업 카드
│   ├── 📄 PhaseIllustration.tsx  (40줄)  ← 단계 일러스트
│   ├── 📄 IntroBanner.tsx        (30줄)  ← 인트로 배너
│   ├── 📄 StarInfoBanner.tsx     (30줄)  ← 별 정보 배너
│   ├── 📄 CTABanner.tsx          (40줄)  ← CTA 배너
│   ├── 📄 PageHeader.tsx         (40줄)  ← 페이지 헤더
│   │
│   └── 📁 JobDetailModal/        (모달 컴포넌트)
│       ├── 📄 index.tsx          (60줄)  ← 모달 메인
│       ├── 📄 ModalHeader.tsx    (40줄)  ← 모달 헤더
│       ├── 📄 ModalTabs.tsx      (40줄)  ← 탭 전환
│       ├── 📄 ModalControls.tsx  (50줄)  ← 이전/다음 버튼
│       ├── 📄 ProcessTab.tsx     (100줄) ← 프로세스 탭 내용
│       └── 📄 TimelineTab.tsx    (100줄) ← 타임라인 탭 내용
│
├── 📁 constants/
│   └── 📄 jobIllustrations.tsx   (500줄) ← SVG 일러스트
│
├── 📄 README.md                   ← 사용 가이드
├── 📄 REFACTORING_SUMMARY.md      ← 리팩토링 요약
├── 📄 STRUCTURE.md                ← 이 문서
└── 📄 page.tsx.backup             (1253줄) ← 원본 백업
```

## 🔄 컴포넌트 의존성 그래프

```
page.tsx
    │
    ├─→ StarField
    │
    ├─→ PageHeader
    │       └─→ selectedStar (state)
    │
    ├─→ IntroBanner
    │
    ├─→ StarCard (x8)
    │       └─→ onClick → setSelectedStar
    │
    ├─→ StarInfoBanner
    │       └─→ selectedStar
    │
    ├─→ JobCard (xN)
    │       └─→ onClick → setSelectedJob
    │
    ├─→ CTABanner
    │       └─→ selectedStar
    │
    └─→ JobDetailModal
            ├─→ ModalHeader
            ├─→ ModalTabs
            ├─→ ProcessTab
            │       └─→ PhaseIllustration
            ├─→ TimelineTab
            └─→ ModalControls
```

## 📊 파일 크기 분포

```
page.tsx              ████ 100줄
types.ts              ██ 50줄
config.ts             ███ 70줄

components/
  StarField           █ 30줄
  StarCard            ██ 60줄
  JobCard             ███ 70줄
  PhaseIllustration   █ 40줄
  IntroBanner         █ 30줄
  StarInfoBanner      █ 30줄
  CTABanner           █ 40줄
  PageHeader          █ 40줄
  
  JobDetailModal/
    index             ██ 60줄
    ModalHeader       █ 40줄
    ModalTabs         █ 40줄
    ModalControls     ██ 50줄
    ProcessTab        ████ 100줄
    TimelineTab       ████ 100줄

constants/
  jobIllustrations    ██████████ 500줄
```

## 🎯 컴포넌트 크기 비교

| 컴포넌트 | 줄 수 | 복잡도 | 재사용성 |
|---------|-------|--------|---------|
| StarField | 30 | 낮음 | 높음 |
| StarCard | 60 | 중간 | 높음 |
| JobCard | 70 | 중간 | 높음 |
| PhaseIllustration | 40 | 낮음 | 높음 |
| IntroBanner | 30 | 낮음 | 중간 |
| StarInfoBanner | 30 | 낮음 | 중간 |
| CTABanner | 40 | 낮음 | 중간 |
| PageHeader | 40 | 낮음 | 높음 |
| JobDetailModal | 390 | 높음 | 중간 |

## 🔍 각 파일의 역할

### 📄 page.tsx
```typescript
// 역할: 메인 로직 & 상태 관리
- useState로 상태 관리
- 별 데이터 import
- 컴포넌트 조합
- 조건부 렌더링
```

### 📄 types.ts
```typescript
// 역할: 타입 정의
- StarData
- Job
- WorkPhase
- Milestone
```

### 📄 config.ts
```typescript
// 역할: 설정 & 라벨
- LABELS (모든 텍스트)
- PHASE_BG_COLORS (색상)
- STAR_FIELD_CONFIG (별 설정)
```

### 📁 components/
```typescript
// 역할: UI 컴포넌트
- 각 섹션별 독립 컴포넌트
- Props로 데이터 받음
- 재사용 가능
```

### 📁 constants/
```typescript
// 역할: 상수 데이터
- SVG 일러스트레이션
- 변경 빈도 낮음
```

## 🎨 Import 관계

```
page.tsx
    │
    ├── import { StarData, Job } from './types'
    ├── import { LABELS, PHASE_BG_COLORS } from './config'
    ├── import { StarField, StarCard, ... } from './components'
    └── import exploreStar from '@/data/stars/...'

components/StarCard.tsx
    │
    ├── import type { StarData } from '../types'
    └── import { Star, ChevronRight } from 'lucide-react'

components/JobDetailModal/ProcessTab.tsx
    │
    ├── import type { Job, StarData, WorkPhase } from '../../types'
    ├── import { LABELS } from '../../config'
    ├── import { PhaseIllustration } from '../PhaseIllustration'
    └── import { Clock, TrendingUp, ... } from 'lucide-react'
```

## 📦 번들 구조

```
explore/
├── page.tsx                    ← Entry Point
│   ├── components/             ← Lazy loadable
│   │   ├── StarField
│   │   ├── StarCard
│   │   ├── JobCard
│   │   └── JobDetailModal/     ← 큰 컴포넌트 (lazy 추천)
│   │       ├── ProcessTab
│   │       └── TimelineTab
│   └── constants/
│       └── jobIllustrations    ← 큰 SVG (lazy 추천)
```

## 🚀 최적화 기회

### 1. 코드 스플리팅
```typescript
// page.tsx
const JobDetailModal = dynamic(
  () => import('./components/JobDetailModal'),
  { loading: () => <div>Loading...</div> }
);
```

### 2. SVG 최적화
```typescript
// constants/jobIllustrations.tsx를 별도 청크로
const JOB_ILLUSTRATIONS = dynamic(
  () => import('./constants/jobIllustrations')
);
```

### 3. 메모이제이션
```typescript
// components/StarCard.tsx
export const StarCard = memo(({ star, onClick, index }) => {
  // ...
});
```

## 📈 개선 효과

### 개발 경험
- ✅ 파일 찾기 쉬움
- ✅ 수정 범위 명확
- ✅ 코드 리뷰 용이
- ✅ 테스트 작성 쉬움

### 유지보수성
- ✅ 책임 분리 명확
- ✅ 재사용성 높음
- ✅ 확장성 좋음
- ✅ 버그 추적 쉬움

### 성능
- ✅ 번들 크기 동일
- ✅ 런타임 성능 동일
- ✅ 코드 스플리팅 가능
- ✅ Tree shaking 최적화

## ✅ 체크리스트

- [x] 1253줄 파일 분석
- [x] 타입 정의 분리 (types.ts)
- [x] 설정 분리 (config.ts)
- [x] 컴포넌트 분리 (14개 파일)
- [x] 상수 분리 (jobIllustrations.tsx)
- [x] 메인 페이지 리팩토링
- [x] 원본 백업 (page.tsx.backup)
- [x] 린트 에러 없음
- [x] 문서 작성 (3개)

## 🎉 완료!

**1개의 거대한 파일 (1253줄)**
    ↓
**19개의 작고 관리하기 쉬운 파일**

이제 각 컴포넌트를 독립적으로 관리할 수 있습니다! 🚀
