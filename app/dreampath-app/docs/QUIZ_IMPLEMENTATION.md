# 적성 퀴즈 구현 가이드

## 개요

온보딩 완료 후 바로 진행되는 RIASEC 기반 적성 검사 기능입니다.

## 파일 구조

### 데이터 파일 (JSON)
- `src/data/quiz-intro.json` - 퀴즈 소개 화면 콘텐츠
- `src/data/quiz-config.json` - 퀴즈 설정 및 라벨
- `src/data/quiz-questions.json` - 30개 퀴즈 문항 데이터

### 화면 컴포넌트
- `src/screens/QuizIntroScreen.tsx` - 퀴즈 소개 및 안내 화면
- `src/screens/QuizScreen.tsx` - 메인 퀴즈 진행 화면
- `src/screens/QuizResultsScreen.tsx` - 퀴즈 결과 화면

### UI 컴포넌트
- `src/components/quiz/ModeSelectScreen.tsx` - 퀴즈 모드 선택 (빠른/정밀)

### 유틸리티
- `src/lib/riasec.ts` - RIASEC 점수 계산 및 결과 생성

## 플로우

```
Onboarding → QuizIntro → ModeSelect → Quiz → QuizResults → Main
```

1. **온보딩 완료** → 자동으로 QuizIntro로 이동
2. **QuizIntro** → 퀴즈 설명, 통계, 보상, 팁 표시
3. **ModeSelect** → 빠른 검사(10문항) vs 정밀 검사(30문항) 선택
4. **Quiz** → 문항별 답변 선택, 실시간 피드백
5. **QuizResults** → RIASEC 결과, +100 XP 보상
6. **Main** → 홈 화면으로 이동

## 주요 기능

### 1. 퀴즈 소개 화면
- 검사 정보 (30문항, 5-7분, RIASEC, TOP 5)
- 완료 보상 안내 (+100 XP)
- 퀴즈 팁 3가지

### 2. 모드 선택
- **빠른 검사**: 10문항, 3-5분
- **정밀 검사**: 30문항, 10-15분 (추천)

### 3. 퀴즈 진행
- 진행률 표시
- 5개 영역별 문항 (성격, 흥미, 강점, 가치관, 학습)
- 4지선다 선택
- 답변 후 즉시 피드백
- +5 XP 팝업 애니메이션

### 4. 결과 화면
- TOP 2 적성 유형 표시
- 전체 RIASEC 점수 차트
- +100 XP 보상
- 추천 직업 안내

## 데이터 구조

### QuizQuestion
```typescript
{
  id: number;
  zone: string;           // "성격", "흥미", "강점", "가치관", "학습"
  zoneIcon: string;       // 이모지
  situation: string;      // 상황 제목
  description: string;    // 질문 내용
  feedbackMap: {          // 선택지별 피드백
    "0": string,
    "1": string,
    ...
  };
  choices: [              // 4개 선택지
    {
      id: string;
      text: string;
      riasecScores: {     // RIASEC 점수
        "R": number,
        "I": number,
        ...
      }
    }
  ]
}
```

### RIASECResult
```typescript
{
  scores: {
    R: number,  // 현실형
    I: number,  // 탐구형
    A: number,  // 예술형
    S: number,  // 사회형
    E: number,  // 기업형
    C: number   // 관습형
  },
  topTypes: [RIASECType, RIASECType],
  keywords: string[],
  completedAt: string
}
```

## 스타일링

### 색상 테마
- 성격 (🧠): `#6C5CE7` (보라)
- 흥미 (❤️): `#E74C3C` (빨강)
- 강점 (💪): `#27AE60` (초록)
- 가치관 (🌈): `#F39C12` (주황)
- 학습 (📚): `#3498DB` (파랑)

### 애니메이션
- 페이드인 효과
- XP 팝업 (900ms)
- 피드백 오버레이
- 진행률 바

## 저장소 연동

### AsyncStorage 키
- `dreampath_riasec_result` - RIASEC 결과
- `dreampath_xp_log` - XP 로그 (+100 XP 추가)

### XP 보상
- 문항당: +5 XP (표시만, 실제 저장 안함)
- 완료 시: +100 XP (실제 저장)

## 확장 가능성

### 추후 추가 가능 기능
1. 퀴즈 중단 및 재개
2. 답변 수정 기능
3. 상세 리포트 PDF 다운로드
4. 소셜 공유 기능
5. 재검사 기능 (홈 화면에서)

## 참조 파일

- Frontend 웹 버전: `/frontend/app/quiz/`
- 문항 데이터: `/frontend/data/quiz-questions.json`
- RIASEC 로직: `/frontend/lib/riasec.ts`

## 개발 노트

- 모든 텍스트는 JSON 파일로 관리
- 컴포넌트는 400줄 이하 유지
- TypeScript 타입 안정성 확보
- 클린 코드 원칙 준수
- 재사용 가능한 컴포넌트 구조
