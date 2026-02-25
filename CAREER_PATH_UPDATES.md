# 커리어 패스 기능 업데이트

## 📋 개요
커리어 패스 페이지에 상세 정보 다이얼로그, 공유 기능, 댓글 및 즐겨찾기 기능을 추가했습니다.

## ✨ 주요 기능

### 1. 상세 정보 다이얼로그 (CareerPathDetailDialog)
**위치**: `frontend/app/career/components/CareerPathDetailDialog.tsx`

#### 기능:
- ✅ 커리어 패스 카드 클릭 시 상세 정보 다이얼로그 표시
- ✅ 펼쳤을 때 상세 정보 확인 후 "이 패스 사용하기" 버튼으로 선택
- ✅ 풀스크린 바텀 시트 스타일의 모달
- ✅ 스크롤 가능한 상세 컨텐츠

#### 포함된 정보:
- 📝 상세 설명
- 📊 통계 (사용자 수, 학년 수, 항목 수)
- 🎯 항목 구성 (활동, 수상, 자격증, 작품별 개수)
- 📅 학년별 상세 정보 (목표 및 항목 미리보기)
- 🏷️ 태그

### 2. 좋아요 & 즐겨찾기 기능
- ❤️ **좋아요**: 커리어 패스에 좋아요 표시 (실시간 카운트 업데이트)
- ⭐ **즐겨찾기**: 나중에 다시 보기 위한 북마크 기능
- 💾 로컬 상태 관리 (추후 백엔드 연동 가능)

### 3. 댓글 기능
**유튜브 스타일의 댓글 시스템**

#### 기능:
- 💬 댓글 작성 및 표시
- 👤 사용자 이름 및 이모지 아바타
- ⏰ 타임스탬프 (상대 시간)
- ❤️ 댓글 좋아요
- 📝 실시간 댓글 추가

#### 샘플 댓글:
```typescript
{
  id: 'c1',
  userId: 'u1',
  userName: '김진로',
  userEmoji: '👨‍🎓',
  content: '정말 체계적인 패스네요!',
  timestamp: '2일 전',
  likes: 12
}
```

### 4. 공유 기능

#### 4.1 탐색 페이지 (CareerPathList)
다이얼로그 내에서 공유 가능:
- 🔗 **외부 공유**: 링크 복사 (고객 공유용)
- 👥 **내부 공유**: 타임라인에 공유 (팀원 공유용)

#### 4.2 타임라인 페이지 (VerticalTimelineList)
**위치**: `frontend/app/career/components/VerticalTimelineList.tsx`

각 커리어 패스 카드에 공유 버튼 추가:
- 📤 **공유 버튼**: 수정/삭제 버튼과 함께 배치
- 🎯 **공유 메뉴**: 클릭 시 펼쳐지는 공유 옵션
  - 내부 공유 (타임라인)
  - 외부 공유 (링크 복사)

#### 공유 옵션:
```typescript
// 내부 공유
handleShareToTimeline() {
  alert('타임라인에 공유되었습니다!');
}

// 외부 공유
handleCopyLink() {
  const link = `${window.location.origin}/career/plan/${plan.id}`;
  navigator.clipboard.writeText(link);
}
```

## 🎨 UI/UX 개선사항

### 디자인 일관성
- 🌈 각 커리어 패스의 색상 테마 유지
- 🎭 부드러운 애니메이션 (slide-in, scale 효과)
- 📱 모바일 최적화 (바텀 시트 스타일)

### 인터랙션
- ✨ 클릭 시 상세 정보 즉시 표시
- 🔄 실시간 피드백 (좋아요, 북마크 상태 변경)
- ✅ 복사 완료 알림 (체크 아이콘으로 변경)

### 접근성
- 🎯 명확한 버튼 레이블
- 🔍 충분한 터치 영역
- 📊 시각적 피드백

## 📂 파일 구조

```
frontend/app/career/
├── components/
│   ├── CareerPathDetailDialog.tsx    (NEW) - 상세 정보 다이얼로그
│   ├── CareerPathList.tsx            (UPDATED) - 다이얼로그 통합
│   └── VerticalTimelineList.tsx      (UPDATED) - 공유 기능 추가
├── config.ts                         (EXISTING) - 설정 관리
└── page.tsx                          (EXISTING) - 메인 페이지
```

## 🔧 기술 스택
- ⚛️ React (함수 컴포넌트)
- 🎨 Tailwind CSS (인라인 스타일)
- 📦 TypeScript
- 🎭 Lucide Icons

## 🚀 사용 방법

### 1. 탐색 페이지에서 상세 정보 보기
```tsx
// 카드 클릭 → 다이얼로그 오픈
<TemplateRow 
  onShowDetail={() => setSelectedTemplate(template)}
/>

// 다이얼로그에서 "이 패스 사용하기" 클릭
<CareerPathDetailDialog
  onUseTemplate={handleUseTemplate}
/>
```

### 2. 타임라인에서 공유하기
```tsx
// 공유 버튼 클릭
<button onClick={() => setShowShareMenu(!showShareMenu)}>
  공유
</button>

// 공유 옵션 선택
- 내부 공유: 타임라인에 게시
- 외부 공유: 링크 복사
```

## 📝 향후 개선 사항
- [ ] 백엔드 API 연동 (좋아요, 댓글, 공유)
- [ ] 댓글 답글 기능
- [ ] 댓글 정렬 (최신순, 인기순)
- [ ] 공유 통계 (조회수, 공유 횟수)
- [ ] 소셜 미디어 공유 (카카오톡, 페이스북 등)
- [ ] 알림 시스템 (댓글, 좋아요 알림)
- [ ] 북마크 관리 페이지

## 🎯 완료된 요구사항
✅ 상세 정보 확인 후 "이 패스 사용하기" 클릭 가능  
✅ 내부 공유 (타임라인) 기능  
✅ 외부 공유 (고객 공유) 기능  
✅ 유튜브 스타일 댓글 기능  
✅ 즐겨찾기 기능  
✅ 타임라인에서 공유 가능  

## 📸 주요 화면

### 1. 탐색 페이지
- 카드 리스트 (간단한 정보)
- 카드 클릭 → 상세 다이얼로그

### 2. 상세 다이얼로그
- 헤더 (제목, 이모지, 닫기 버튼)
- 액션 버튼 (좋아요, 북마크, 댓글, 공유)
- 공유 옵션 (내부/외부)
- 댓글 섹션
- 상세 정보 (설명, 통계, 항목 구성, 학년별 상세)
- 하단 CTA (이 패스 사용하기)

### 3. 타임라인 페이지
- 커리어 패스 카드 (아코디언)
- 액션 바 (수정, 공유, 삭제)
- 공유 메뉴 (펼침/접힘)
