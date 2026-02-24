# Jobs Page - 커스터마이징 가이드

## 🎨 컨텐츠 수정하기

### 1. 히어로 섹션 수정

```json
// frontend/data/jobs-content.json
{
  "hero": {
    "title": "새로운 제목",           // 메인 제목
    "subtitle": "새로운 부제목",      // 부제목
    "description": "새로운 설명...",  // 상세 설명
    "backgroundEmoji": "🚀"          // 배경 이모지
  }
}
```

### 2. 기능 카드 추가/수정

```json
// frontend/data/jobs-content.json
{
  "features": [
    {
      "id": "new-feature",           // 고유 ID
      "icon": "🎯",                  // 아이콘 이모지
      "title": "새 기능",            // 제목
      "description": "기능 설명...", // 설명
      "link": {
        "text": "시작하기",          // 버튼 텍스트
        "href": "/new-page"          // 링크 경로
      }
    }
  ]
}
```

### 3. 통계 수정

```json
// frontend/data/jobs-content.json
{
  "stats": {
    "title": "통계 제목",
    "items": [
      {
        "icon": "💼",              // 아이콘
        "value": "200+",           // 값
        "label": "개 직업",        // 라벨
        "color": "#6C5CE7"         // 색상 (HEX)
      }
    ]
  }
}
```

### 4. CTA 섹션 수정

```json
// frontend/data/jobs-content.json
{
  "cta": {
    "title": "CTA 제목",
    "description": "CTA 설명",
    "primaryButton": {
      "text": "주요 버튼",
      "href": "/primary-link"
    },
    "secondaryButton": {
      "text": "보조 버튼",
      "href": "/secondary-link"
    }
  }
}
```

## ⚙️ 설정 수정하기

### 1. 색상 변경

```typescript
// frontend/app/jobs/config.ts
export const COLORS = {
  primary: '#새색상',      // 주요 색상
  secondary: '#새색상',    // 보조 색상
  accent: '#새색상',       // 강조 색상
  success: '#새색상',      // 성공 색상
  danger: '#새색상',       // 위험 색상
  info: '#새색상',         // 정보 색상
} as const;
```

### 2. 라벨 변경

```typescript
// frontend/app/jobs/config.ts
export const LABELS = {
  page_title: '새 페이지 제목',
  page_subtitle: '새 부제목',
  // ... 더 많은 라벨
} as const;
```

### 3. 애니메이션 속도 조정

```typescript
// frontend/app/jobs/config.ts
export const ANIMATION_CONFIG = {
  cardEnterDelay: 100,      // 카드 등장 딜레이 (ms)
  cardEnterStagger: 80,     // 카드 간 간격 (ms)
  fadeInDuration: 300,      // 페이드인 시간 (ms)
  slideInDuration: 400,     // 슬라이드인 시간 (ms)
} as const;
```

### 4. 레이아웃 조정

```typescript
// frontend/app/jobs/config.ts
export const LAYOUT = {
  maxWidth: '430px',           // 최대 너비
  padding: '16px',             // 패딩
  cardBorderRadius: '24px',    // 카드 모서리
  buttonBorderRadius: '16px',  // 버튼 모서리
} as const;
```

## 🧩 새 섹션 추가하기

### 1. 타입 정의

```typescript
// frontend/app/jobs/types.ts
export interface NewSection {
  title: string;
  items: NewItem[];
}

export interface NewItem {
  id: string;
  name: string;
  // ... 더 많은 필드
}
```

### 2. 데이터 추가

```json
// frontend/data/jobs-content.json
{
  "newSection": {
    "title": "새 섹션",
    "items": [
      {
        "id": "item-1",
        "name": "아이템 1"
      }
    ]
  }
}
```

### 3. 컴포넌트 생성

```tsx
// frontend/app/jobs/components/NewSection.tsx
'use client';

import { motion } from 'framer-motion';
import type { NewSection as NewSectionType } from '../types';

interface NewSectionProps {
  data: NewSectionType;
}

export function NewSection({ data }: NewSectionProps) {
  return (
    <motion.section
      className="mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-xl font-bold mb-4">{data.title}</h2>
      
      <div className="space-y-3">
        {data.items.map((item, index) => (
          <div key={item.id} className="p-4 rounded-2xl bg-white/5">
            {item.name}
          </div>
        ))}
      </div>
    </motion.section>
  );
}
```

### 4. Export 추가

```typescript
// frontend/app/jobs/components/index.ts
export { NewSection } from './NewSection';
```

### 5. 페이지에 추가

```tsx
// frontend/app/jobs/page.tsx
import { NewSection } from './components';

export default function JobsPage() {
  return (
    <div>
      {/* 기존 섹션들... */}
      
      <NewSection data={jobsContent.newSection} />
    </div>
  );
}
```

## 🎨 스타일 커스터마이징

### 1. 카드 스타일 변경

```tsx
// 컴포넌트 내부
<div
  className="rounded-2xl p-5"
  style={{
    background: 'rgba(255,255,255,0.04)',  // 배경 투명도
    border: '1px solid rgba(255,255,255,0.08)',  // 테두리
    backdropFilter: 'blur(10px)',  // 블러 효과
  }}
>
```

### 2. 그라데이션 변경

```tsx
// 컴포넌트 내부
<div
  style={{
    background: 'linear-gradient(135deg, #시작색 0%, #끝색 100%)',
  }}
>
```

### 3. 호버 효과 조정

```tsx
// Framer Motion 사용
<motion.div
  whileHover={{ 
    scale: 1.05,           // 확대 비율
    boxShadow: '0 0 20px rgba(108,92,231,0.5)',  // 그림자
  }}
  transition={{ duration: 0.2 }}  // 트랜지션 시간
>
```

## 🔧 고급 커스터마이징

### 1. 배경 효과 수정

```tsx
// frontend/app/jobs/components/BackgroundEffects.tsx

// 별 개수 변경
Array.from({ length: 50 }, ...)  // 30 → 50

// 오브 색상 변경
style={{
  background: 'radial-gradient(circle, rgba(새색상) 0%, transparent 70%)',
}}

// 오브 크기 변경
className="w-96 h-96"  // 크기 조정
```

### 2. 애니메이션 커스터마이징

```tsx
// 등장 애니메이션
initial={{ opacity: 0, y: 20, scale: 0.9 }}
animate={{ opacity: 1, y: 0, scale: 1 }}
transition={{ 
  duration: 0.5,
  ease: [0.6, -0.05, 0.01, 0.99],  // 커스텀 easing
}}

// 호버 애니메이션
whileHover={{ 
  scale: 1.05,
  rotate: 2,  // 회전 추가
  transition: { duration: 0.2 }
}}

// 탭 애니메이션
whileTap={{ scale: 0.95 }}
```

### 3. 반응형 조정

```tsx
// Tailwind CSS 사용
<div className="
  grid 
  grid-cols-1        // 모바일: 1열
  md:grid-cols-2     // 태블릿: 2열
  lg:grid-cols-3     // 데스크톱: 3열
  gap-4
">
```

### 4. 다크/라이트 모드 지원

```tsx
// Tailwind CSS 다크 모드
<div className="
  bg-white dark:bg-gray-900
  text-gray-900 dark:text-white
  border-gray-200 dark:border-gray-700
">
```

## 📱 모바일 최적화

### 1. Safe Area 지원

```tsx
<div
  style={{
    paddingTop: 'max(16px, env(safe-area-inset-top, 16px))',
    paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))',
  }}
>
```

### 2. 터치 최적화

```tsx
// 터치 영역 확대
<button className="min-h-[44px] min-w-[44px]">

// 터치 피드백
<motion.button
  whileTap={{ scale: 0.95 }}
  className="active:opacity-80"
>
```

### 3. 스크롤 최적화

```tsx
// 부드러운 스크롤
<div className="overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
```

## 🎯 성능 최적화

### 1. 이미지 최적화

```tsx
import Image from 'next/image';

<Image
  src="/path/to/image.jpg"
  alt="설명"
  width={400}
  height={300}
  loading="lazy"
  placeholder="blur"
/>
```

### 2. 코드 스플리팅

```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>로딩 중...</div>,
  ssr: false,  // 클라이언트 사이드만
});
```

### 3. 메모이제이션

```tsx
import { memo } from 'react';

export const FeatureCard = memo(({ feature, index }: FeatureCardProps) => {
  // ...
});
```

## 🐛 디버깅 팁

### 1. 애니메이션 디버깅

```tsx
// 애니메이션 비활성화 (개발 중)
<motion.div
  animate={{ opacity: 1 }}
  transition={{ duration: 0 }}  // 즉시 완료
>
```

### 2. 데이터 검증

```tsx
// 타입 체크
const jobsContent = jobsContentData as JobsPageData;

// 런타임 검증
if (!jobsContent.hero) {
  console.error('Hero data is missing');
  return null;
}
```

### 3. 스타일 디버깅

```tsx
// 임시 테두리 추가
<div className="border-2 border-red-500">
  {/* 레이아웃 확인 */}
</div>
```

## 📚 참고 자료

- [Framer Motion 문서](https://www.framer.com/motion/)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [Next.js 문서](https://nextjs.org/docs)
- [TypeScript 문서](https://www.typescriptlang.org/docs)

## 💡 베스트 프랙티스

1. **컴포넌트 분리**: 각 섹션을 독립적인 컴포넌트로 유지
2. **타입 안정성**: 모든 데이터에 TypeScript 타입 정의
3. **재사용성**: 공통 스타일은 config.ts에 정의
4. **접근성**: ARIA 라벨 및 키보드 네비게이션 지원
5. **성능**: 불필요한 리렌더링 방지 (memo, useMemo)
6. **반응형**: 모바일 우선 디자인
7. **일관성**: 디자인 시스템 준수
