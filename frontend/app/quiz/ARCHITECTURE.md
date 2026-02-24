# Quiz 섹션 아키텍처

## 📐 컴포넌트 계층 구조

```
QuizPage (page.tsx)
├── ModeSelectScreen (모드 미선택 시)
│   ├── 배경 별 애니메이션
│   ├── 빠른 검사 버튼 (10문항)
│   └── 정밀 검사 버튼 (30문항)
│
└── Quiz Screen (모드 선택 후)
    ├── BackgroundEffects
    │   ├── 그라데이션 오브
    │   └── 떠다니는 파티클
    │
    ├── QuizHeader
    │   ├── 뒤로가기 버튼
    │   ├── Zone 아이콘 & 라벨
    │   ├── 진행 카운터 (Q1/30)
    │   └── 세그먼트 진행 바
    │
    ├── QuestionCard
    │   ├── 상황 배지
    │   └── 질문 텍스트
    │
    ├── XpPopup (답변 시)
    │   └── "+5 XP" 애니메이션
    │
    ├── ChoicesList
    │   ├── Choice A
    │   ├── Choice B
    │   ├── Choice C
    │   └── Choice D
    │
    ├── QuizStatus
    │   ├── XP 획득량
    │   └── 진행률 바
    │
    └── FeedbackOverlay (답변 후)
        ├── Zone 배지
        ├── 피드백 메시지
        └── 다음/결과 버튼
```

## 📊 데이터 흐름

```
quiz-questions.json
        ↓
    page.tsx (allQuestions)
        ↓
    mode 선택 (10 or 30)
        ↓
    questions 필터링
        ↓
    ┌─────────────────┐
    │  currentIndex   │ ← goBack() / handleFeedbackNext()
    └─────────────────┘
        ↓
    questions[currentIndex]
        ↓
    ┌──────────────────────────────┐
    │  QuizHeader, QuestionCard,   │
    │  ChoicesList                  │
    └──────────────────────────────┘
        ↓
    pickAnswer(choiceId, choiceIdx)
        ↓
    ┌─────────────────┐
    │  answers 업데이트 │
    │  XP 팝업 표시     │
    │  피드백 준비      │
    └─────────────────┘
        ↓
    FeedbackOverlay 표시
        ↓
    handleFeedbackNext()
        ↓
    마지막 문제? → finishQuiz() → /quiz/results
                 → 다음 문제 → currentIndex++
```

## 🎯 상태 관리 흐름

```typescript
// 초기 상태
mode: null
currentIndex: 0
answers: {}
pendingFeedback: null

// 모드 선택
setMode('10' | '30')
↓
questions 필터링 완료

// 답변 선택
pickAnswer(choiceId, idx)
↓
setAnimating(true)
setAnswers({ ...answers, [currentIndex]: idx })
setXpPopVisible(true)
↓
setTimeout(() => {
  setPendingFeedback({ text, zone, zoneIcon, isLast })
  setAnimating(false)
}, 400ms)

// 피드백 확인
handleFeedbackNext()
↓
setPendingFeedback(null)
↓
isLast ? finishQuiz() : setCurrentIndex(prev => prev + 1)

// 퀴즈 완료
finishQuiz()
↓
generateRIASECResult()
storage.riasec.set()
storage.user.set()
router.push('/quiz/results')
```

## 🎨 스타일 시스템

### Zone별 색상 매핑
```typescript
getZoneColor(zone: string) → color: string

성격 → #6C5CE7 (보라)
흥미 → #E74C3C (빨강)
강점 → #27AE60 (초록)
가치관 → #F39C12 (주황)
학습 → #3498DB (파랑)
```

### 동적 스타일 적용
```typescript
// 배경 그라데이션
background: `linear-gradient(135deg, ${color}12 0%, rgba(255,255,255,0.03) 100%)`

// 테두리
border: `1px solid ${color}25`

// 그림자
boxShadow: `0 0 24px ${color}20`

// 선택된 선택지
backgroundColor: `${color}18`
border: `2px solid ${color}`
```

## 🔄 애니메이션 타이밍

```
답변 선택
  ↓
  0ms: pickAnswer() 호출
  ↓
  즉시: XP 팝업 표시
  ↓
  400ms: 피드백 준비 완료
  ↓
  즉시: FeedbackOverlay 표시 (slide-up 0.35s)
  ↓
  900ms: XP 팝업 숨김
  ↓
사용자 클릭: handleFeedbackNext()
  ↓
  80ms: 선택지 페이드아웃
  ↓
  즉시: currentIndex++ (또는 결과 페이지)
  ↓
  80ms: 새 선택지 페이드인
```

## 📱 반응형 처리

### 터치 제스처
```typescript
onTouchStart: 시작 X 좌표 저장
onTouchEnd: 
  - dx > 80px → goBack() (스와이프 우측)
  - 피드백 표시 중이면 무시
```

### 모바일 최적화
- 최대 너비: 430px
- 터치 영역: 최소 44px
- 활성 상태: scale(0.97)
- 부드러운 전환: transition-all duration-200

## 🧩 컴포넌트 Props 인터페이스

### QuizHeader
```typescript
{
  question: QuizQuestion
  currentIndex: number
  totalQuestions: number
  questions: QuizQuestion[]
  answers: Record<number, number>
  onBack: () => void
}
```

### ChoicesList
```typescript
{
  question: QuizQuestion
  currentIndex: number
  answers: Record<number, number>
  choicesVisible: boolean
  animating: boolean
  pendingFeedback: boolean
  onPickAnswer: (choiceId: string, choiceIdx: number) => void
}
```

### FeedbackOverlay
```typescript
{
  feedback: string
  zone: string
  zoneIcon: string
  onNext: () => void
  isLast: boolean
}
```

## 🔧 설정 관리

### config.ts 구조
```typescript
// 색상
ZONE_COLORS: Record<string, string>
getZoneColor(zone: string): string

// 아이콘
ICON_MAP: Record<string, LucideIcon>

// 라벨 (i18n 대비)
LABELS: Record<string, string>

// 퀴즈 설정
QUIZ_CONFIG: {
  xpPerQuestion: 5
  quickModeQuestions: 10
  detailedModeQuestions: 30
  quickModeFilter: (index) => index % 3 === 0
}

// 애니메이션
ANIMATION_CONFIG: {
  choiceEnterDelay: 70
  choiceEnterStagger: 70
  feedbackDelay: 400
  xpPopDuration: 900
}

// 라우트
ROUTES: {
  quizResults: '/quiz/results'
  home: '/home'
}
```

## 📦 의존성

### 외부 라이브러리
- `next/navigation`: useRouter
- `lucide-react`: 아이콘 컴포넌트
- `@/lib/storage`: 로컬 스토리지 관리
- `@/lib/riasec`: RIASEC 결과 생성

### 내부 모듈
- `./components`: UI 컴포넌트
- `./config`: 설정 및 상수
- `./types`: TypeScript 타입
- `@/data/quiz-questions.json`: 질문 데이터

## 🚀 성능 최적화

### 메모이제이션
```typescript
const finishQuiz = useCallback((finalAnswers) => {
  // 퀴즈 완료 로직
}, [questions, router]);
```

### 조건부 렌더링
```typescript
if (!mode) return <ModeSelectScreen />
if (!q) return null
{pendingFeedback && <FeedbackOverlay />}
{xpPopVisible && <XpPopup />}
```

### 애니메이션 최적화
- CSS 애니메이션 사용 (JS 대신)
- transform 사용 (reflow 방지)
- will-change 속성 (필요시)

## 🔐 타입 안전성

```typescript
// types.ts
export type QuizMode = '10' | '30'

export interface QuizQuestion {
  id: number
  zone: string
  zoneIcon: string
  situation: string
  description: string
  feedbackMap: Record<string, string>
  choices: QuizChoice[]
}

export interface FeedbackData {
  text: string
  zone: string
  zoneIcon: string
  isLast: boolean
}
```

## 📈 확장 가능성

### 새 Zone 추가
1. `ZONE_COLORS`에 색상 추가
2. JSON에 새 zone 질문 추가
3. 자동으로 UI 반영

### 새 모드 추가
1. `QuizMode` 타입 확장
2. `ModeSelectScreen`에 버튼 추가
3. 필터 로직 추가

### 다국어 지원
1. `LABELS`를 i18n 시스템으로 교체
2. JSON에 다국어 질문 추가
3. 언어 선택 UI 추가
