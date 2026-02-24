# Jobs Page Architecture

## 📐 구조 다이어그램

```
┌─────────────────────────────────────────────────────────┐
│                     Jobs Page (/)                        │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │              Header (Sticky)                       │ │
│  │  • 페이지 제목                                      │ │
│  │  • 부제목                                          │ │
│  │  • 아이콘                                          │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │           HeroSection Component                    │ │
│  │  • 메인 타이틀                                      │ │
│  │  • 설명                                            │ │
│  │  • 배경 이모지                                      │ │
│  │  • 그라데이션 배경                                  │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Features Section (4개 카드)                │ │
│  │                                                    │ │
│  │  ┌──────────────┐  ┌──────────────┐              │ │
│  │  │ 직업 탐색     │  │ 스와이프     │              │ │
│  │  │ 🔭           │  │ 💫           │              │ │
│  │  └──────────────┘  └──────────────┘              │ │
│  │                                                    │ │
│  │  ┌──────────────┐  ┌──────────────┐              │ │
│  │  │ 시뮬레이션    │  │ 커리어 패스   │              │ │
│  │  │ 🎮           │  │ 🚀           │              │ │
│  │  └──────────────┘  └──────────────┘              │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │          StatsSection Component                    │ │
│  │                                                    │ │
│  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐         │ │
│  │  │100+  │  │  8   │  │1,234 │  │ 4.8  │         │ │
│  │  │직업  │  │왕국  │  │사용자│  │만족도│         │ │
│  │  └──────┘  └──────┘  └──────┘  └──────┘         │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │           CTASection Component                     │ │
│  │  • CTA 타이틀                                       │ │
│  │  • 설명                                            │ │
│  │  • Primary Button                                  │ │
│  │  • Secondary Button                                │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │              TabBar (Fixed Bottom)                 │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 🔄 데이터 흐름

```
jobs-content.json
       │
       ├─→ page.tsx (메인)
       │      │
       │      ├─→ HeroSection
       │      │      └─→ hero 데이터
       │      │
       │      ├─→ FeatureCard (x4)
       │      │      └─→ features 배열
       │      │
       │      ├─→ StatsSection
       │      │      └─→ stats 데이터
       │      │
       │      └─→ CTASection
       │             └─→ cta 데이터
       │
config.ts
       │
       ├─→ LABELS (텍스트)
       ├─→ COLORS (색상)
       ├─→ ROUTES (경로)
       └─→ ANIMATION_CONFIG (애니메이션)
```

## 🎨 컴포넌트 계층

```
JobsPage
├── BackgroundEffects
│   ├── Gradient Orbs (3개)
│   └── Animated Stars (30개)
│
├── Header (Sticky)
│   ├── Title
│   ├── Subtitle
│   └── Icon
│
├── HeroSection
│   ├── Badge (NEW)
│   ├── Title
│   ├── Subtitle
│   ├── Description
│   └── Background Decorations
│
├── Features Section
│   └── FeatureCard (x4)
│       ├── Icon
│       ├── Title
│       ├── Description
│       ├── Link
│       └── Hover Effects
│
├── StatsSection
│   └── StatCard (x4)
│       ├── Icon
│       ├── Value
│       ├── Label
│       └── Background Glow
│
├── CTASection
│   ├── Badge
│   ├── Title
│   ├── Description
│   ├── Primary Button
│   ├── Secondary Button
│   └── Background Decorations
│
└── TabBar (Fixed)
```

## 🎯 상태 관리

현재 페이지는 **상태 없음** (Stateless)
- 모든 데이터는 JSON에서 로드
- 인터랙션은 라우팅으로 처리
- 애니메이션은 Framer Motion으로 처리

## 🔗 네비게이션 플로우

```
Jobs Page (/)
    │
    ├─→ 직업 탐색 → /jobs/explore
    │                    │
    │                    ├─→ 별 선택 → 직업 목록
    │                    │              │
    │                    │              └─→ /jobs/[jobId]
    │                    │
    │                    └─→ 직업 상세 → 시뮬레이션
    │
    ├─→ 스와이프 → /jobs/swipe
    │                 │
    │                 └─→ 좋아요/싫어요 → 저장 또는 다음
    │
    ├─→ 시뮬레이션 → /jobs/explore → /jobs/[jobId]
    │
    └─→ 커리어 패스 → /jobs/explore → /jobs/[jobId]
```

## 📱 반응형 레이아웃

```
Mobile (< 430px)
┌─────────────┐
│   Header    │
├─────────────┤
│    Hero     │
├─────────────┤
│  Feature 1  │
│  Feature 2  │
│  Feature 3  │
│  Feature 4  │
├─────────────┤
│ Stats (2x2) │
├─────────────┤
│     CTA     │
├─────────────┤
│   TabBar    │
└─────────────┘

Desktop (> 430px)
┌───────────────────────┐
│                       │
│   ┌─────────────┐     │
│   │   Header    │     │
│   ├─────────────┤     │
│   │    Hero     │     │
│   ├─────────────┤     │
│   │  Feature 1  │     │
│   │  Feature 2  │     │
│   │  Feature 3  │     │
│   │  Feature 4  │     │
│   ├─────────────┤     │
│   │ Stats (2x2) │     │
│   ├─────────────┤     │
│   │     CTA     │     │
│   ├─────────────┤     │
│   │   TabBar    │     │
│   └─────────────┘     │
│                       │
└───────────────────────┘
```

## 🎨 애니메이션 타임라인

```
0ms    ─→ BackgroundEffects (항상 표시)
       ─→ Header (즉시 표시)

0ms    ─→ HeroSection 시작
200ms  ─→ Badge 등장
300ms  ─→ Title 등장
400ms  ─→ Subtitle 등장
500ms  ─→ Description 등장

0ms    ─→ Feature 1
100ms  ─→ Feature 2
200ms  ─→ Feature 3
300ms  ─→ Feature 4

0ms    ─→ Stat 1
100ms  ─→ Stat 2
200ms  ─→ Stat 3
300ms  ─→ Stat 4

600ms  ─→ CTA Section
700ms  ─→ CTA Badge
800ms  ─→ CTA Title
900ms  ─→ CTA Description
1000ms ─→ CTA Buttons
```

## 🔧 확장 가능성

### 새 섹션 추가

1. `components/` 폴더에 새 컴포넌트 생성
2. `types.ts`에 타입 추가
3. `jobs-content.json`에 데이터 추가
4. `page.tsx`에서 import 및 렌더링

### 새 기능 카드 추가

1. `jobs-content.json`의 `features` 배열에 추가
2. 자동으로 렌더링됨

### 스타일 커스터마이징

1. `config.ts`의 `COLORS` 수정
2. 컴포넌트에서 자동으로 적용됨
