# Quiz 섹션 리팩토링 가이드

## 🎯 리팩토링 목표

1. ✅ JSON 파일로 컨텐츠 관리
2. ✅ config.ts로 라벨 및 설정 관리
3. ✅ 함수 컴포넌트로 섹션별 분리
4. ✅ 파일 분할로 유지보수성 향상

## 📊 Before & After

### Before (단일 파일 구조)
```
quiz/
├── page.tsx (520+ 줄)
│   ├── FeedbackOverlay 컴포넌트
│   ├── ModeSelectScreen 컴포넌트
│   ├── 메인 QuizPage 컴포넌트
│   ├── 하드코딩된 색상
│   ├── 하드코딩된 라벨
│   └── 복잡한 로직
├── intro/page.tsx (190+ 줄)
└── results/page.tsx
```

**문제점:**
- 단일 파일에 모든 로직과 UI 집중
- 하드코딩된 값들 (색상, 라벨, 설정)
- 재사용 불가능한 컴포넌트
- 유지보수 어려움
- 테스트 어려움

### After (모듈화된 구조)
```
quiz/
├── page.tsx (130 줄) ✨
├── config.ts (새로 생성) ✨
├── types.ts (새로 생성) ✨
├── README.md (새로 생성) 📚
├── ARCHITECTURE.md (새로 생성) 📚
├── components/
│   ├── index.ts ✨
│   ├── ModeSelectScreen.tsx (90 줄) ✨
│   ├── FeedbackOverlay.tsx (60 줄) ✨
│   ├── QuizHeader.tsx (60 줄) ✨
│   ├── QuestionCard.tsx (40 줄) ✨
│   ├── ChoicesList.tsx (70 줄) ✨
│   ├── XpPopup.tsx (20 줄) ✨
│   ├── QuizStatus.tsx (50 줄) ✨
│   └── BackgroundEffects.tsx (30 줄) ✨
├── intro/
│   ├── page.tsx (80 줄) ✨
│   ├── config.ts (새로 생성) ✨
│   └── components/
│       ├── index.ts ✨
│       ├── HeroIcon.tsx ✨
│       ├── StatsGrid.tsx ✨
│       ├── RewardPreview.tsx ✨
│       ├── TipsList.tsx ✨
│       └── BackgroundParticles.tsx ✨
└── results/page.tsx

data/
└── quiz-questions.json (기존 유지)
```

**개선점:**
- 명확한 책임 분리
- 재사용 가능한 컴포넌트
- 중앙화된 설정 관리
- 쉬운 테스트
- 향상된 가독성

## 🔄 주요 변경 사항

### 1. 설정 파일 분리 (config.ts)

**Before:**
```typescript
// page.tsx 내부에 하드코딩
const ZONE_COLORS: Record<string, string> = {
  '성격': '#6C5CE7',
  '흥미': '#E74C3C',
  // ...
};

function getZoneColor(zone: string) {
  return ZONE_COLORS[zone] ?? '#6C5CE7';
}
```

**After:**
```typescript
// config.ts
export const ZONE_COLORS: Record<string, string> = {
  '성격': '#6C5CE7',
  '흥미': '#E74C3C',
  '강점': '#27AE60',
  '가치관': '#F39C12',
  '학습': '#3498DB',
};

export function getZoneColor(zone: string): string {
  return ZONE_COLORS[zone] ?? '#6C5CE7';
}

export const LABELS: Record<string, string> = {
  mode_select_title: '직업 적성 검사',
  mode_select_subtitle: '나에게 맞는 직업 유형을 발견해보세요',
  // ... 모든 라벨 중앙 관리
};

export const QUIZ_CONFIG = {
  xpPerQuestion: 5,
  quickModeQuestions: 10,
  detailedModeQuestions: 30,
} as const;
```

### 2. 타입 정의 분리 (types.ts)

**Before:**
```typescript
// page.tsx 내부
type QuizMode = '10' | '30';
// 인터페이스 없음, any 타입 사용
```

**After:**
```typescript
// types.ts
export type QuizMode = '10' | '30';

export interface QuizQuestion {
  id: number;
  zone: string;
  zoneIcon: string;
  situation: string;
  description: string;
  feedbackMap: Record<string, string>;
  choices: QuizChoice[];
}

export interface QuizChoice {
  id: string;
  text: string;
  riasecScores: Record<string, number>;
}

export interface FeedbackData {
  text: string;
  zone: string;
  zoneIcon: string;
  isLast: boolean;
}
```

### 3. 컴포넌트 분리

**Before:**
```typescript
// page.tsx 내부에 모든 컴포넌트
function FeedbackOverlay({ ... }) { /* 100줄 */ }
function ModeSelectScreen({ ... }) { /* 100줄 */ }
export default function QuizPage() { /* 300줄 */ }
```

**After:**
```typescript
// components/FeedbackOverlay.tsx
export function FeedbackOverlay({ ... }) { /* 60줄 */ }

// components/ModeSelectScreen.tsx
export function ModeSelectScreen({ ... }) { /* 90줄 */ }

// components/index.ts
export { ModeSelectScreen } from './ModeSelectScreen';
export { FeedbackOverlay } from './FeedbackOverlay';
// ...

// page.tsx
import {
  ModeSelectScreen,
  FeedbackOverlay,
  QuizHeader,
  // ...
} from './components';

export default function QuizPage() { /* 130줄 */ }
```

### 4. Props 인터페이스 명확화

**Before:**
```typescript
function FeedbackOverlay({
  feedback,
  zone,
  zoneIcon,
  onNext,
  isLast,
}: {
  feedback: string;
  zone: string;
  zoneIcon: string;
  onNext: () => void;
  isLast: boolean;
}) { ... }
```

**After:**
```typescript
interface FeedbackOverlayProps {
  feedback: string;
  zone: string;
  zoneIcon: string;
  onNext: () => void;
  isLast: boolean;
}

export function FeedbackOverlay({
  feedback,
  zone,
  zoneIcon,
  onNext,
  isLast,
}: FeedbackOverlayProps) { ... }
```

## 📈 코드 메트릭 비교

| 항목 | Before | After | 개선 |
|------|--------|-------|------|
| 메인 파일 줄 수 | 520 | 130 | -75% |
| 컴포넌트 파일 수 | 1 | 9 | +800% |
| 평균 파일 크기 | 520 | 58 | -89% |
| 재사용 가능 컴포넌트 | 0 | 8 | ∞ |
| 하드코딩된 문자열 | 50+ | 0 | -100% |
| 타입 안전성 | 부분적 | 완전 | ✅ |

## 🎨 설정 관리 개선

### 색상 관리

**Before:**
```typescript
// 여러 곳에 중복
style={{ backgroundColor: '#6C5CE7' }}
style={{ color: '#E74C3C' }}
```

**After:**
```typescript
// config.ts에서 import
import { getZoneColor } from '../config';

const color = getZoneColor(question.zone);
style={{ backgroundColor: color }}
```

### 라벨 관리

**Before:**
```typescript
<h1>직업 적성 검사</h1>
<button>다음 문제로</button>
<span>분석 완료</span>
```

**After:**
```typescript
import { LABELS } from '../config';

<h1>{LABELS.mode_select_title}</h1>
<button>{LABELS.feedback_next}</button>
<span>{LABELS.feedback_zone_complete}</span>
```

### 설정값 관리

**Before:**
```typescript
const xp = answeredCount * 5;
if (mode === '10') { /* ... */ }
```

**After:**
```typescript
import { QUIZ_CONFIG } from '../config';

const xp = answeredCount * QUIZ_CONFIG.xpPerQuestion;
if (mode === '10') { /* ... */ }
```

## 🔧 유지보수성 향상

### 1. 새 기능 추가가 쉬워짐

**Before:**
```typescript
// 520줄 파일에서 관련 코드 찾기
// 여러 곳에 흩어진 로직 수정
```

**After:**
```typescript
// 해당 컴포넌트 파일만 수정
// components/NewFeature.tsx 추가
// components/index.ts에 export 추가
```

### 2. 버그 수정이 명확해짐

**Before:**
```typescript
// 어디서 문제가 발생했는지 찾기 어려움
// 520줄 전체를 읽어야 함
```

**After:**
```typescript
// 컴포넌트별로 명확히 분리됨
// 해당 컴포넌트 파일만 확인
```

### 3. 테스트 작성이 용이해짐

**Before:**
```typescript
// 전체 페이지를 테스트해야 함
// 의존성이 많아 모킹 어려움
```

**After:**
```typescript
// 개별 컴포넌트 단위 테스트
import { QuizHeader } from './components/QuizHeader';

describe('QuizHeader', () => {
  it('should display current question number', () => {
    // ...
  });
});
```

## 📚 문서화 개선

### 새로 추가된 문서

1. **README.md**: 전체 구조 및 사용법
2. **ARCHITECTURE.md**: 아키텍처 및 데이터 흐름
3. **REFACTORING.md**: 리팩토링 가이드 (현재 문서)

### 코드 내 문서화

```typescript
// config.ts
/**
 * 각 Zone별 색상을 반환합니다.
 * @param zone - Zone 이름 (성격, 흥미, 강점, 가치관, 학습)
 * @returns 해당 Zone의 색상 코드
 */
export function getZoneColor(zone: string): string {
  return ZONE_COLORS[zone] ?? '#6C5CE7';
}
```

## 🚀 마이그레이션 가이드

### 기존 코드를 새 구조로 변경하는 방법

1. **설정 분리**
   ```typescript
   // 하드코딩된 값 찾기
   const color = '#6C5CE7';
   
   // config.ts로 이동
   export const ZONE_COLORS = { ... };
   
   // import하여 사용
   import { getZoneColor } from './config';
   ```

2. **컴포넌트 추출**
   ```typescript
   // 큰 컴포넌트에서 독립적인 부분 찾기
   function BigComponent() {
     return (
       <div>
         <Header />  // ← 이 부분을 별도 파일로
         <Content /> // ← 이 부분을 별도 파일로
       </div>
     );
   }
   
   // 별도 파일로 분리
   // components/Header.tsx
   export function Header() { ... }
   ```

3. **타입 정의**
   ```typescript
   // 인라인 타입
   function Component({ data }: { data: any }) { ... }
   
   // types.ts로 이동
   export interface ComponentProps {
     data: DataType;
   }
   
   // 사용
   function Component({ data }: ComponentProps) { ... }
   ```

## ✅ 체크리스트

리팩토링 완료 확인:

- [x] 모든 하드코딩된 문자열을 config.ts로 이동
- [x] 색상 값을 ZONE_COLORS로 중앙화
- [x] 설정값을 QUIZ_CONFIG로 관리
- [x] 큰 컴포넌트를 작은 컴포넌트로 분리
- [x] 각 컴포넌트를 별도 파일로 분리
- [x] Props 인터페이스 정의
- [x] 타입 정의를 types.ts로 분리
- [x] components/index.ts에서 export
- [x] 문서화 (README, ARCHITECTURE)
- [x] 린터 에러 없음

## 🎯 다음 단계

1. **테스트 작성**
   - 각 컴포넌트에 대한 단위 테스트
   - 통합 테스트
   - E2E 테스트

2. **접근성 개선**
   - ARIA 라벨 추가
   - 키보드 네비게이션
   - 스크린 리더 지원

3. **성능 최적화**
   - React.memo 적용
   - useMemo, useCallback 최적화
   - 코드 스플리팅

4. **다국어 지원**
   - i18n 라이브러리 통합
   - 번역 파일 작성
   - 언어 선택 UI

## 💡 베스트 프랙티스

1. **단일 책임 원칙**: 각 컴포넌트는 하나의 책임만
2. **DRY (Don't Repeat Yourself)**: 중복 코드 제거
3. **명확한 네이밍**: 의도가 명확한 이름 사용
4. **타입 안전성**: TypeScript 활용
5. **문서화**: 코드와 함께 문서 유지
6. **일관성**: 코딩 스타일 통일

## 📖 참고 자료

- [React 컴포넌트 설계 패턴](https://react.dev/learn/thinking-in-react)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Clean Code 원칙](https://github.com/ryanmcdermott/clean-code-javascript)
