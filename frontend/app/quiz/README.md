# Quiz 섹션 구조

이 디렉토리는 직업 적성 검사(Quiz) 기능을 담당합니다.

## 📁 파일 구조

```
quiz/
├── page.tsx                    # 메인 퀴즈 페이지
├── config.ts                   # 설정 및 라벨 관리
├── types.ts                    # TypeScript 타입 정의
├── components/                 # 재사용 가능한 컴포넌트들
│   ├── index.ts               # 컴포넌트 export
│   ├── ModeSelectScreen.tsx   # 모드 선택 화면 (10문항/30문항)
│   ├── FeedbackOverlay.tsx    # 답변 후 피드백 오버레이
│   ├── QuizHeader.tsx         # 퀴즈 헤더 (진행상황, 뒤로가기)
│   ├── QuestionCard.tsx       # 질문 카드
│   ├── ChoicesList.tsx        # 선택지 목록
│   ├── XpPopup.tsx            # XP 획득 팝업
│   ├── QuizStatus.tsx         # 하단 진행 상태 바
│   └── BackgroundEffects.tsx  # 배경 효과 (파티클, 그라데이션)
├── intro/                      # 퀴즈 소개 페이지
│   ├── page.tsx               # 소개 페이지 메인
│   ├── config.ts              # 소개 페이지 설정
│   └── components/            # 소개 페이지 컴포넌트들
│       ├── index.ts
│       ├── HeroIcon.tsx       # 히어로 아이콘
│       ├── StatsGrid.tsx      # 통계 그리드
│       ├── RewardPreview.tsx  # 보상 미리보기
│       ├── TipsList.tsx       # 팁 목록
│       └── BackgroundParticles.tsx  # 배경 파티클
└── results/                    # 결과 페이지
    └── page.tsx               # 결과 표시 페이지

data/
└── quiz-questions.json         # 퀴즈 질문 데이터
```

## 🎯 주요 기능

### 1. 모드 선택
- **빠른 검사 (10문항)**: 3-5분 소요, 핵심 유형 탐색
- **정밀 검사 (30문항)**: 10-15분 소요, 상세 리포트 제공

### 2. 퀴즈 진행
- 5개 존(Zone): 성격, 흥미, 강점, 가치관, 학습
- 각 질문마다 4개의 선택지
- 실시간 진행률 표시
- XP 획득 애니메이션

### 3. 피드백 시스템
- 각 답변 후 즉각적인 피드백 제공
- Zone별 색상 구분
- 부드러운 애니메이션 전환

## 📝 데이터 관리

### config.ts
```typescript
// 색상 팔레트
ZONE_COLORS: 각 존별 색상 정의

// 라벨
LABELS: UI 텍스트 관리 (다국어 지원 대비)

// 퀴즈 설정
QUIZ_CONFIG: XP, 문항 수 등 설정값

// 애니메이션 설정
ANIMATION_CONFIG: 타이밍, 딜레이 등
```

### quiz-questions.json
```json
{
  "id": 문항 ID,
  "zone": "존 이름",
  "zoneIcon": "이모지",
  "situation": "상황 라벨",
  "description": "질문 내용",
  "feedbackMap": {
    "0": "선택지 0 피드백",
    "1": "선택지 1 피드백",
    ...
  },
  "choices": [
    {
      "id": "선택지 ID",
      "text": "선택지 텍스트",
      "riasecScores": { "R": 2, "I": 1 }
    }
  ]
}
```

## 🔧 컴포넌트 설명

### ModeSelectScreen
- 10문항/30문항 모드 선택
- 각 모드의 특징 표시
- 애니메이션 배경 효과

### QuizHeader
- 현재 존(Zone) 표시
- 진행 상황 (Q1/30)
- 세그먼트 진행 바
- 뒤로가기 버튼

### QuestionCard
- 상황 배지
- 질문 텍스트
- Zone별 색상 적용
- 배경 효과

### ChoicesList
- 4개 선택지 (A, B, C, D)
- 선택 시 하이라이트
- 스태거 애니메이션
- 비활성화 상태 관리

### FeedbackOverlay
- 전체 화면 오버레이
- Zone별 피드백 메시지
- 다음 문제/결과 보기 버튼
- 슬라이드 업 애니메이션

### QuizStatus
- XP 획득량 표시
- 진행률 바
- 퍼센트 표시

## 🎨 스타일링

### Zone 색상
- 성격 🧠: `#6C5CE7` (보라)
- 흥미 ❤️: `#E74C3C` (빨강)
- 강점 💪: `#27AE60` (초록)
- 가치관 🌈: `#F39C12` (주황)
- 학습 📚: `#3498DB` (파랑)

### 애니메이션
- `slide-up`: 피드백 오버레이
- `choice-enter`: 선택지 등장
- `xp-pop`: XP 획득 팝업
- `float`: 배경 파티클
- `shimmer`: 반짝임 효과

## 🔄 상태 관리

```typescript
mode: QuizMode | null              // 선택된 모드
currentIndex: number               // 현재 문항 인덱스
answers: Record<number, number>    // 답변 기록
xpPopVisible: boolean              // XP 팝업 표시
animating: boolean                 // 애니메이션 진행 중
choicesVisible: boolean            // 선택지 표시
pendingFeedback: FeedbackData      // 대기 중인 피드백
```

## 📊 결과 생성

퀴즈 완료 시:
1. RIASEC 점수 계산
2. 상위 유형 결정
3. 추천 직업 생성
4. 결과 저장 (localStorage)
5. 결과 페이지로 이동

## 🚀 사용 방법

### 새 질문 추가
1. `quiz-questions.json`에 질문 추가
2. Zone, 아이콘, 피드백 설정
3. RIASEC 점수 매핑

### 라벨 수정
1. `config.ts`의 `LABELS` 객체 수정
2. 컴포넌트에서 자동 반영

### 새 컴포넌트 추가
1. `components/` 폴더에 파일 생성
2. `components/index.ts`에 export 추가
3. `page.tsx`에서 import하여 사용

## 🎯 개선 포인트

- [ ] 다국어 지원 (i18n)
- [ ] 진행 상황 저장 (중단 후 재개)
- [ ] 애니메이션 최적화
- [ ] 접근성 개선 (키보드 네비게이션)
- [ ] 모바일 제스처 지원 강화
