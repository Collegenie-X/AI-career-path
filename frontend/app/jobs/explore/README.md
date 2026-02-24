# Jobs Explore Page - 리팩토링 완료

## 📁 파일 구조

```
frontend/app/jobs/explore/
├── page.tsx                          # 메인 페이지 (리팩토링됨)
├── page.tsx.backup                   # 백업 파일 (원본)
├── types.ts                          # TypeScript 타입 정의
├── config.ts                         # 설정 및 라벨
├── README.md                         # 이 문서
│
├── components/                       # 컴포넌트 폴더
│   ├── index.ts                     # Export 파일
│   ├── StarField.tsx                # 배경 별 효과
│   ├── StarCard.tsx                 # 별 카드
│   ├── JobCard.tsx                  # 직업 카드
│   ├── PhaseIllustration.tsx        # 단계 일러스트
│   ├── IntroBanner.tsx              # 인트로 배너
│   ├── StarInfoBanner.tsx           # 별 정보 배너
│   ├── CTABanner.tsx                # CTA 배너
│   ├── PageHeader.tsx               # 페이지 헤더
│   └── JobDetailModal/              # 직업 상세 모달
│       ├── index.tsx                # 모달 메인
│       ├── ModalHeader.tsx          # 모달 헤더
│       ├── ModalTabs.tsx            # 모달 탭
│       ├── ModalControls.tsx        # 모달 컨트롤
│       ├── ProcessTab.tsx           # 프로세스 탭
│       └── TimelineTab.tsx          # 타임라인 탭
│
└── constants/                        # 상수 폴더
    └── jobIllustrations.tsx         # 직업 일러스트레이션 SVG
```

## ✨ 리팩토링 내용

### 이전 (1253줄)
- 단일 파일에 모든 코드
- SVG 일러스트레이션 500줄+
- 컴포넌트 혼재
- 유지보수 어려움

### 이후 (분할됨)
- **types.ts**: 타입 정의 (50줄)
- **config.ts**: 설정 및 라벨 (70줄)
- **components/**: 9개 컴포넌트 파일
- **constants/**: SVG 일러스트레이션 분리
- **page.tsx**: 메인 로직만 (100줄)

## 🎯 주요 개선사항

### 1. 타입 안정성
```typescript
// types.ts
export type StarData = { ... };
export type Job = { ... };
export type WorkPhase = { ... };
export type Milestone = { ... };
```

### 2. 설정 관리
```typescript
// config.ts
export const LABELS = {
  page_title: 'Job 간접 경험',
  page_subtitle: '8개 별의 직업 세계를 탐험하세요',
  // ...
};

export const PHASE_BG_COLORS = { ... };
export const STAR_FIELD_CONFIG = { ... };
```

### 3. 컴포넌트 분리
```typescript
// 이전
function StarCard() { ... }  // 페이지 내부

// 이후
// components/StarCard.tsx
export function StarCard() { ... }
```

### 4. 모달 구조화
```
JobDetailModal/
├── index.tsx          # 메인 로직
├── ModalHeader.tsx    # 헤더
├── ModalTabs.tsx      # 탭
├── ModalControls.tsx  # 컨트롤
├── ProcessTab.tsx     # 프로세스 탭 내용
└── TimelineTab.tsx    # 타임라인 탭 내용
```

## 📝 사용 방법

### 컴포넌트 import
```typescript
import {
  StarField,
  StarCard,
  JobCard,
  IntroBanner,
  JobDetailModal,
} from './components';
```

### 설정 사용
```typescript
import { LABELS, PHASE_BG_COLORS } from './config';

// 라벨 사용
<h1>{LABELS.page_title}</h1>

// 색상 사용
const bgColor = PHASE_BG_COLORS[phaseId];
```

### 타입 사용
```typescript
import type { StarData, Job } from './types';

const star: StarData = { ... };
const job: Job = { ... };
```

## 🔧 수정 가이드

### 라벨 수정
```typescript
// config.ts
export const LABELS = {
  page_title: '새 제목',  // 여기서 수정
  // ...
};
```

### 새 컴포넌트 추가
1. `components/` 폴더에 새 파일 생성
2. `components/index.ts`에 export 추가
3. `page.tsx`에서 import 및 사용

### 스타일 수정
각 컴포넌트 파일에서 직접 수정:
```typescript
// components/StarCard.tsx
<div
  style={{
    background: '새 배경색',
    border: '새 테두리',
  }}
>
```

## 📊 파일 크기 비교

| 파일 | 이전 | 이후 |
|------|------|------|
| page.tsx | 1253줄 | ~100줄 |
| types.ts | - | 50줄 |
| config.ts | - | 70줄 |
| components/ | - | ~800줄 (9개 파일) |
| constants/ | - | ~500줄 |

**총 라인 수**: 비슷하지만 **유지보수성 대폭 향상** ✨

## 🎨 컴포넌트 설명

### StarField
배경의 반짝이는 별 효과

### StarCard
8개 별을 표시하는 카드

### JobCard
각 별의 직업 목록 카드

### PhaseIllustration
직무 프로세스 단계 일러스트

### IntroBanner
페이지 상단 소개 배너

### StarInfoBanner
선택된 별의 정보 배너

### CTABanner
커리어 패스 만들기 CTA

### PageHeader
페이지 상단 헤더 (뒤로가기 포함)

### JobDetailModal
직업 상세 정보 모달 (가장 복잡한 컴포넌트)

## 🚀 다음 단계

### 추가 최적화 가능
1. **코드 스플리팅**: 동적 import로 모달 lazy loading
2. **메모이제이션**: React.memo로 불필요한 리렌더링 방지
3. **커스텀 훅**: 로직 재사용을 위한 hooks 분리
4. **Storybook**: 컴포넌트 문서화 및 테스트

### 성능 개선
```typescript
// 예시: 동적 import
const JobDetailModal = dynamic(() => import('./components/JobDetailModal'), {
  loading: () => <div>Loading...</div>,
});
```

## ✅ 체크리스트

- [x] 타입 정의 분리
- [x] 설정 파일 분리
- [x] 컴포넌트 분리 (9개)
- [x] 상수 분리 (SVG)
- [x] 메인 페이지 리팩토링
- [x] README 작성
- [ ] 단위 테스트 작성 (선택)
- [ ] Storybook 추가 (선택)

## 📚 참고

- 원본 파일: `page.tsx.backup`
- 복원 방법: `mv page.tsx.backup page.tsx`
