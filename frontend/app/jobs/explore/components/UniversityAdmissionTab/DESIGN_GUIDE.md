# 대입 전략 허브 디자인 가이드

## 🎨 디자인 철학

게임 UI의 직관성과 교육 콘텐츠의 명확성을 결합하여, 학생들이 복잡한 대입 전략을 쉽고 재미있게 탐색할 수 있도록 설계했습니다.

## 🎮 게임 요소

### 1. 레벨 시스템
```
고1 🌱 (새싹) → 고2 🌿 (성장) → 고3 🌳 (완성)
```
- 학년을 게임의 레벨처럼 표현
- 시각적으로 성장 단계를 직관적으로 이해

### 2. 미션 카드
각 실행 카드를 게임의 퀘스트/미션처럼 디자인:
- 📌 미션 번호 배지
- 🎯 목표 설명
- ⏰ 권장 타이밍
- ✅ 실행 단계 체크리스트

### 3. 스킬 트리
4개의 전략 탭을 스킬 트리처럼 배치:
- ⚡ 2028 대입 전략 (기본 스킬)
- 🚀 AI 프로젝트 학습 (기술 스킬)
- 🧪 논문·메이커 활동 (연구 스킬)
- 📅 학년별 종합 로드맵 (마스터 플랜)

## 🎯 UI 컴포넌트 구조

### 메인 허브 카드
```
┌─────────────────────────────────────┐
│ 🎯 대입 전략 허브     [핵심 4탭]    │
├─────────────────────────────────────┤
│ [⚡2028전략] [🚀AI] [🧪논문] [📅로드맵] │
├─────────────────────────────────────┤
│ [🌱 고1] [🌿 고2] [🌳 고3]           │
├─────────────────────────────────────┤
│ ┌─ 선택된 전략 정보 ─────────────┐ │
│ │ 🎯 지금 학년 우선 목표          │ │
│ │ ⚡ 빠른 실행 예시               │ │
│ └─────────────────────────────────┘ │
│ [📖 상세 가이드 열기]               │
└─────────────────────────────────────┘
```

### 상세 다이얼로그
```
┌─────────────────────────────────────┐
│ 📖 상세 실행 가이드            [X]  │
├─────────────────────────────────────┤
│ [전략 탭들]                         │
│ [학년 선택]                         │
│ [🎯핵심] [✅실행] [💡Q&A]           │
├─────────────────────────────────────┤
│ 컨텐츠 영역                         │
│ - 정보 블록 (아이콘 + 넘버링)       │
│ - 실행 카드 (미션 스타일)           │
│ - Q&A (아코디언)                    │
└─────────────────────────────────────┘
```

## 🌈 색상 시스템

### 주요 색상
- **인디고/퍼플**: 메인 액션 (99,102,241 → 139,92,246)
- **에메랄드/그린**: 학년 선택 (34,197,94 → 16,185,129)
- **앰버**: 필요성 정보 (251,191,36)
- **핑크**: 유리 포인트 (236,72,153)
- **스카이**: 증빙 위치 (14,165,233)
- **블루**: 체크리스트 (59,130,246)
- **퍼플**: Q&A (139,92,246)

### 그라데이션 패턴
```css
/* 활성 버튼 */
linear-gradient(135deg, 
  rgba(99,102,241,0.35) 0%, 
  rgba(139,92,246,0.35) 100%
)

/* 학년 선택 */
linear-gradient(135deg, 
  rgba(34,197,94,0.3) 0%, 
  rgba(16,185,129,0.3) 100%
)

/* 배경 */
linear-gradient(135deg, 
  rgba(15,23,42,0.95) 0%, 
  rgba(30,41,59,0.9) 100%
)
```

## ✨ 인터랙션 효과

### 버튼 상태
```
기본 → 호버 (1.05배 확대) → 클릭 (0.95배 축소)
```

### 카드 상태
```
기본 → 호버 (1.01배 확대 + 위로 2px 이동)
```

### 글로우 효과
```
활성 상태: box-shadow: 0 4px 12px rgba(99,102,241,0.4)
```

### 쉬머 효과
```
좌에서 우로 빛나는 효과 (0.7초 duration)
```

## 📐 간격 시스템

### 패딩
- 메인 컨테이너: `p-4` (16px)
- 카드: `p-3` (12px)
- 작은 요소: `p-2` (8px)

### Gap
- 버튼 그룹: `gap-2` (8px)
- 카드 리스트: `space-y-3` (12px)
- 정보 블록: `space-y-2` (8px)

### 테두리
- 메인: `border-2` (2px)
- 서브: `border` (1px)
- 액센트 바: `w-1` 또는 `w-1.5`

## 🎨 아이콘 사용 가이드

### Lucide React 아이콘
```typescript
import { 
  Zap,           // 번개 - 빠른 전략
  Rocket,        // 로켓 - 프로젝트
  FlaskConical,  // 플라스크 - 실험/연구
  Calendar,      // 달력 - 일정/로드맵
  Target,        // 타겟 - 목표
  CheckCircle2,  // 체크 - 완료/실행
  Lightbulb,     // 전구 - 아이디어/Q&A
  ExternalLink,  // 외부링크 - 상세보기
  ChevronDown,   // 펼치기
  X,             // 닫기
} from 'lucide-react';
```

### 이모지 아이콘
```typescript
🎯 - 목표/타겟
⚡ - 빠른 실행
💡 - 필요성/아이디어
✨ - 유리 포인트
📝 - 증빙/기록
✅ - 체크리스트
🌱 - 고1 (새싹)
🌿 - 고2 (성장)
🌳 - 고3 (완성)
⏰ - 타이밍
```

## 📱 반응형 디자인

### 모바일 (< 768px)
- 버튼 텍스트: `text-xs`
- 패딩: `p-3`
- 다이얼로그: `h-[94dvh]` (거의 전체 화면)

### 데스크톱 (≥ 768px)
- 버튼 텍스트: `text-sm`
- 패딩: `p-4`
- 다이얼로그: `max-h-[92vh]` (적절한 높이)

## 🔧 컴포넌트 재사용성

### 분리된 컴포넌트
1. **TopStrategyHubCard**: 실행 카드
2. **TopStrategyHubInfoBlock**: 정보 블록
3. **TopStrategyHubQAItem**: Q&A 아이템

### 설정 파일
1. **topStrategyHubConfig.ts**: 텍스트 레이블
2. **topStrategyHubUIConfig.ts**: UI 설정
3. **topStrategyHubAnimations.ts**: 애니메이션 설정

## 🎪 특별 효과

### 1. 배경 글로우
```tsx
<div className="absolute top-0 right-0 w-32 h-32 
  bg-gradient-to-br from-indigo-500/20 to-transparent 
  rounded-full blur-3xl" />
```

### 2. 쉬머 효과
```tsx
<div className="absolute inset-0 
  bg-gradient-to-r from-transparent via-white/10 to-transparent 
  -translate-x-full group-hover:translate-x-full 
  transition-transform duration-700" />
```

### 3. 액센트 바
```tsx
<div className="absolute top-0 left-0 w-1 h-full 
  bg-gradient-to-b from-indigo-400 to-purple-500" />
```

### 4. 아이콘 배지
```tsx
<div className="w-8 h-8 rounded-lg 
  bg-gradient-to-br from-indigo-500 to-purple-600 
  flex items-center justify-center shadow-lg">
  <span className="text-lg">🎯</span>
</div>
```

## 📊 성능 최적화

### 메모이제이션
```typescript
const activeSection = useMemo(
  () => sections.find((section) => section.id === activeId),
  [activeId, sections]
);
```

### 조건부 렌더링
- 필요한 컴포넌트만 렌더링
- Portal을 사용한 다이얼로그 최적화

### 스크롤 최적화
- `scrollbar-hide` 클래스로 깔끔한 UI
- `overflow-x-auto`로 가로 스크롤 지원

## 🎓 교육적 가치

### 정보 계층
1. **개요**: 전략 선택 (4개 탭)
2. **학년**: 단계별 목표 (고1/고2/고3)
3. **상세**: 핵심 가이드 / 실행 카드 / Q&A
4. **실행**: 구체적인 액션 스텝

### 학습 경로
```
탐색 → 선택 → 이해 → 실행 → 점검
```

## 🚀 향후 확장 가능성

### Phase 1 (현재)
- ✅ 아이콘 시스템
- ✅ 게임스러운 디자인
- ✅ 컴포넌트 분리
- ✅ 반응형 레이아웃

### Phase 2 (향후)
- 🔄 진행률 추적 시스템
- 🏆 완료 배지 시스템
- 📊 학습 통계 대시보드
- 🎵 사운드 효과 (선택적)
- ✨ 고급 애니메이션 (Framer Motion)

### Phase 3 (미래)
- 🤝 소셜 기능 (친구와 비교)
- 🎁 리워드 시스템
- 📅 캘린더 연동
- 📱 푸시 알림

## 💻 코드 품질

### TypeScript 활용
- 모든 Props에 타입 정의
- 설정 객체에 `as const` 사용
- 타입 안정성 보장

### 클린 코드 원칙
- 단일 책임 원칙 (각 컴포넌트는 하나의 역할)
- DRY 원칙 (설정 파일로 중복 제거)
- 명확한 네이밍 (기능이 이름에 드러남)

### 파일 크기 관리
- 각 파일 400줄 이하 유지
- 컴포넌트 분리로 유지보수성 향상
- 설정 파일로 데이터 분리

## 🎨 디자인 토큰

### 그림자
```typescript
const shadows = {
  small: '0 2px 8px rgba(0,0,0,0.2)',
  medium: '0 4px 16px rgba(0,0,0,0.2)',
  large: '0 8px 32px rgba(0,0,0,0.3)',
  glow: '0 4px 12px rgba(99,102,241,0.4)',
};
```

### 테두리 반경
```typescript
const borderRadius = {
  small: '0.5rem',   // 8px
  medium: '0.75rem', // 12px
  large: '1rem',     // 16px
  xlarge: '1.5rem',  // 24px
};
```

### 투명도
```typescript
const opacity = {
  low: 0.05,
  medium: 0.15,
  high: 0.3,
  solid: 0.9,
};
```

## 📝 사용 예시

### 새로운 전략 섹션 추가
1. JSON 데이터 파일 생성
2. `topStrategyHubUIConfig.ts`에 아이콘 매핑 추가
3. 자동으로 UI에 반영됨

### 색상 변경
`topStrategyHubUIConfig.ts`의 `colors` 객체 수정

### 애니메이션 조정
`topStrategyHubAnimations.ts`의 설정 수정

## 🎯 접근성

### ARIA 라벨
- 모든 버튼에 명확한 라벨
- 상태 변화 알림

### 키보드 네비게이션
- Tab으로 이동 가능
- Enter/Space로 활성화

### 색상 대비
- WCAG AA 기준 충족
- 텍스트 가독성 보장

## 🔍 디버깅 가이드

### 스타일 이슈
1. 브라우저 개발자 도구로 요소 검사
2. `style` 속성의 인라인 스타일 확인
3. Tailwind 클래스 충돌 확인

### 컴포넌트 이슈
1. React DevTools로 Props 확인
2. Console에서 에러 메시지 확인
3. TypeScript 타입 에러 해결

### 성능 이슈
1. React Profiler로 렌더링 측정
2. useMemo/useCallback 활용
3. 불필요한 리렌더링 방지

## 📚 참고 자료

### 디자인 영감
- 게임 UI: Genshin Impact, League of Legends
- 교육 앱: Duolingo, Khan Academy
- 대시보드: Linear, Notion

### 기술 스택
- [Lucide Icons](https://lucide.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
