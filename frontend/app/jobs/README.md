# Jobs Page

직업 탐색 메인 페이지입니다. 사용자가 다양한 직업을 탐색하고, 매칭하고, 체험할 수 있는 진입점 역할을 합니다.

## 📁 파일 구조

```
frontend/app/jobs/
├── page.tsx                    # 메인 페이지 (모든 섹션 조합)
├── types.ts                    # TypeScript 타입 정의
├── config.ts                   # 라벨, 색상, 아이콘 등 설정
├── components/                 # 섹션별 컴포넌트
│   ├── index.ts               # 컴포넌트 export
│   ├── HeroSection.tsx        # 히어로 섹션
│   ├── FeatureCard.tsx        # 기능 카드
│   ├── StatsSection.tsx       # 통계 섹션
│   ├── CTASection.tsx         # CTA 섹션
│   └── BackgroundEffects.tsx  # 배경 효과
├── explore/                    # 직업 탐색 페이지
├── swipe/                      # 스와이프 매칭 페이지
└── [jobId]/                    # 직업 상세 페이지

frontend/data/
└── jobs-content.json          # 페이지 컨텐츠 데이터
```

## 🎨 디자인 원칙

- **함수 컴포넌트**: 모든 컴포넌트는 함수형으로 작성
- **섹션별 분리**: 각 섹션은 독립적인 컴포넌트로 분리
- **데이터 분리**: JSON 파일로 컨텐츠 관리
- **설정 분리**: config.ts로 라벨, 색상 등 관리

## 📝 데이터 구조

### jobs-content.json

```json
{
  "hero": {
    "title": "페이지 제목",
    "subtitle": "부제목",
    "description": "설명",
    "backgroundEmoji": "🌟"
  },
  "features": [
    {
      "id": "unique-id",
      "icon": "🔭",
      "title": "기능 제목",
      "description": "기능 설명",
      "link": {
        "text": "버튼 텍스트",
        "href": "/링크"
      }
    }
  ],
  "stats": {
    "title": "통계 섹션 제목",
    "items": [
      {
        "icon": "💼",
        "value": "100+",
        "label": "개 직업",
        "color": "#6C5CE7"
      }
    ]
  },
  "cta": {
    "title": "CTA 제목",
    "description": "CTA 설명",
    "primaryButton": {
      "text": "버튼 텍스트",
      "href": "/링크"
    },
    "secondaryButton": {
      "text": "버튼 텍스트",
      "href": "/링크"
    }
  }
}
```

## 🔧 설정 (config.ts)

### 색상

```typescript
export const COLORS = {
  primary: '#6C5CE7',
  secondary: '#A78BFA',
  accent: '#F59E0B',
  // ...
};
```

### 라벨

```typescript
export const LABELS = {
  page_title: '직업 탐색',
  page_subtitle: '나에게 맞는 직업을 찾아보세요',
  // ...
};
```

### 라우트

```typescript
export const ROUTES = {
  explore: '/jobs/explore',
  swipe: '/jobs/swipe',
  detail: (id: string) => `/jobs/${id}`,
  // ...
};
```

## 🎯 주요 기능

1. **히어로 섹션**: 페이지 소개 및 주요 메시지
2. **기능 카드**: 4가지 주요 기능 (탐색, 스와이프, 시뮬레이션, 커리어 패스)
3. **통계 섹션**: 직업 수, 왕국 수, 사용자 수 등
4. **CTA 섹션**: 행동 유도 버튼

## 🚀 사용 방법

### 컨텐츠 수정

1. `frontend/data/jobs-content.json` 파일 수정
2. 페이지가 자동으로 업데이트됨

### 라벨 수정

1. `config.ts`의 `LABELS` 객체 수정
2. 컴포넌트에서 `LABELS.key` 형태로 사용

### 새 섹션 추가

1. `components/` 폴더에 새 컴포넌트 생성
2. `components/index.ts`에 export 추가
3. `page.tsx`에서 import 및 사용

## 📱 반응형

- 모바일 우선 디자인
- 최대 너비: 430px (모바일 기준)
- 데스크톱에서는 중앙 정렬

## 🎨 애니메이션

- Framer Motion 사용
- 각 섹션별 순차적 등장 애니메이션
- 호버 및 탭 인터랙션

## 🔗 관련 페이지

- `/jobs/explore` - 직업 탐색 (8개 별 선택)
- `/jobs/swipe` - 스와이프 매칭
- `/jobs/[jobId]` - 직업 상세 정보
