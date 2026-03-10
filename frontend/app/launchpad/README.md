# 런치패드 (Launchpad) — 기능 문서

> 경로: `frontend/app/launchpad/`
> 성격: 커리어 실행 모임 생성·참여 + 커뮤니티(학교 동아리·그룹) 관리 단일 페이지 모듈

---

## 1. 개요

`/launchpad`는 학생들이 진로 탐색, 커리어 설계, 공모전 도전, 자격증 준비 등의 **모임(세션)을 열거나 참여**하고, **학교 동아리·그룹 커뮤니티**를 통해 지속적으로 함께 성장하는 공간입니다.

### 핵심 특징

- **단일 라우트 구조**: `/launchpad` 하나의 경로에서 탐색·커뮤니티·내 런치패드 3개 탭으로 모든 기능 처리
- **세션 CRUD**: 모임 생성(빠른 생성 / 상세 폼), 편집, 삭제, 참여/취소
- **커뮤니티 접근 제한**: 초대 코드 또는 가입 요청 승인 후 커뮤니티 탭 이용 가능
- **학교 동아리 & 그룹 가입 시스템**: 미가입 시 `JoinRequestDialog` 표시
- **댓글/답글**: 세션 상세에서 댓글 및 답글 작성 가능
- **localStorage 영속성**: 세션 목록, 참여/소유 상태, 커뮤니티 가입 상태 모두 로컬 저장

---

## 2. 디렉토리 구조

```
frontend/app/launchpad/
├── page.tsx                          # 메인 페이지 (상태 관리, CRUD 핸들러)
├── config.ts                         # 탭/필터/타입/라벨 상수 정의
├── types.ts                          # TypeScript 타입 정의
└── components/
    ├── ExploreTab.tsx                 # 탐색 탭 (모임 목록 + 필터)
    ├── MyLaunchpadTab.tsx             # 내 런치패드 탭 (참여 중 / 내가 만든 것)
    ├── SessionCard.tsx                # 모임 카드 컴포넌트
    ├── SessionDetail.tsx              # 모임 상세 바텀시트
    ├── SessionForm.tsx                # 모임 생성/편집 폼 (상세)
    ├── QuickCreator.tsx               # 빠른 생성 바텀시트
    ├── CommentSection.tsx             # 댓글/답글 섹션
    └── community/
        ├── index.ts                   # CommunityTab re-export
        ├── CommunityTab.tsx           # 커뮤니티 탭 루트 (서브탭 관리)
        ├── SchoolClubView.tsx         # 학교 동아리 목록 + 가입 시스템
        ├── GroupListView.tsx          # 그룹 목록 + 가입 시스템 + 그룹 생성
        ├── CreateGroupDialog.tsx      # 그룹 생성 다이얼로그
        ├── CommunityAccessGate.tsx    # 커뮤니티 접근 제한 게이트
        ├── CommunityAdminPanel.tsx    # 가입 요청 관리 패널 (운영자용)
        └── communityRequests.ts      # 가입 요청 localStorage 유틸리티
```

---

## 3. 데이터 소스

| 파일 | 설명 |
|------|------|
| `frontend/data/launchpad.json` | 초기 세션 시드 데이터 (335줄) |
| `frontend/data/launchpad-community.json` | 학교 동아리 · 그룹 시드 데이터 (163줄) |

- 세션 데이터는 최초 로드 시 `launchpad.json`을 사용하고, 이후 변경 사항은 `localStorage`에 저장
- 커뮤니티 데이터(`launchpad-community.json`)는 읽기 전용 시드이며, 사용자가 생성한 커스텀 그룹은 `launchpad_custom_groups` 키에 별도 저장

---

## 4. page.tsx 상태 관리

```typescript
// 기본 상태
const [mounted, setMounted]           = useState(false);
const [sessions, setSessions]         = useState<LaunchpadSession[]>([]);
const [joined, setJoined]             = useState<Set<string>>(new Set());
const [owned, setOwned]               = useState<Set<string>>(new Set());

// 탭 및 필터
const [activeTab, setActiveTab]       = useState<LaunchpadTabId>('explore');
const [typeFilter, setTypeFilter]     = useState<TypeTabKey>('all');
const [modeFilter, setModeFilter]     = useState<ModeFilterKey>('online');

// 모달 제어
const [showForm, setShowForm]         = useState(false);
const [showQuick, setShowQuick]       = useState(false);
const [editTarget, setEditTarget]     = useState<LaunchpadSession | null>(null);
const [detailSession, setDetail]      = useState<LaunchpadSession | null>(null);
const [createForGroupId, setCreateForGroupId] = useState<string | undefined>(undefined);
```

| 상태 | 역할 |
|------|------|
| `sessions` | 전체 세션 배열 (시드 + 사용자 생성) |
| `joined` | 참여 중인 세션 ID Set |
| `owned` | 내가 만든 세션 ID Set |
| `activeTab` | 현재 상위 탭 (`'explore'` \| `'community'` \| `'my'`) |
| `typeFilter` | 탐색 탭 세션 유형 필터 |
| `modeFilter` | 탐색 탭 진행 방식 필터 |
| `showForm` | 상세 생성/편집 폼 표시 여부 |
| `showQuick` | 빠른 생성 시트 표시 여부 |
| `editTarget` | 편집 중인 세션 (null이면 신규 생성) |
| `detailSession` | 상세 보기 중인 세션 |
| `createForGroupId` | 그룹 전용 세션 생성 시 연결할 groupId |

---

## 5. 핸들러 함수

| 함수 | 설명 |
|------|------|
| `handleJoin(id)` | 세션 참여 (currentParticipants +1, joined Set에 추가) |
| `handleCancel(id)` | 참여 취소 (currentParticipants -1, joined Set에서 제거) |
| `handleCreate(data)` | 신규 세션 생성 (id, createdAt 자동 부여, owned Set에 추가) |
| `handleUpdate(data)` | 기존 세션 수정 (editTarget 기준으로 덮어씀) |
| `handleDelete(id)` | 세션 삭제 (sessions 배열 및 owned Set에서 제거) |

---

## 6. 상위 탭 구조

```typescript
export type LaunchpadTabId = 'explore' | 'community' | 'my';

export const LAUNCHPAD_TABS = [
  { id: 'explore',   label: '탐색',       emoji: '🔍' },
  { id: 'community', label: '커뮤니티',   emoji: '👥' },
  { id: 'my',        label: '내 런치패드', emoji: '🚀' },
];
```

---

## 7. 탐색 탭 (`ExploreTab`)

**파일**: `components/ExploreTab.tsx`

독립 세션(`groupId`가 없는 세션)만 표시하며, 유형 필터와 모드 필터를 조합하여 목록을 렌더링합니다.

### 세션 유형 필터 (`TypeTabKey`)

| 키 | 라벨 | 색상 |
|----|------|------|
| `all` | 전체 | `#6C5CE7` |
| `career_explore` | 진로 탐색 | `#3B82F6` |
| `career_design` | 커리어 설계 | `#6C5CE7` |
| `challenge` | 실행·도전 | `#FBBF24` |
| `certification` | 자격·수상 | `#22C55E` |

### 모드 필터 (`ModeFilterKey`)

| 키 | 라벨 | 설명 |
|----|------|------|
| `all` | 전체 | 모든 방식 |
| `online` | Zoom | `mode === 'online'` |
| `offline` | 오프라인 | `mode === 'offline' \| 'hybrid'` |
| `teacher` | 진로교사 | `isTeacherCreated === true` |

### 필터링 로직

```typescript
const filtered = independentSessions.filter(s => {
  const typeOk = typeFilter === 'all' || s.type === typeFilter;
  const modeOk = modeFilter === 'all'
    ? true
    : modeFilter === 'online'  ? s.mode === 'online'
    : modeFilter === 'offline' ? (s.mode === 'offline' || s.mode === 'hybrid')
    : s.isTeacherCreated === true;
  return typeOk && modeOk;
});
```

### 내부 컴포넌트

| 컴포넌트 | 역할 |
|----------|------|
| `HeroBanner` | 탐색 탭 상단 히어로 배너 (빠른 생성 / 직접 만들기 버튼 포함) |
| `TypeTabs` | 5개 유형 필터 탭 (grid-cols-5, 카운트 배지 포함) |
| `ModeFilterTabs` | 4개 모드 필터 탭 |
| `EmptyState` | 필터 결과 없을 때 빈 상태 UI |

---

## 8. 내 런치패드 탭 (`MyLaunchpadTab`)

**파일**: `components/MyLaunchpadTab.tsx`

### 서브탭

| 키 | 라벨 | 내용 |
|----|------|------|
| `joined` | 참여 중 | `joined` Set에 포함된 세션 목록 |
| `owned` | 내가 만든 것 | `owned` Set에 포함된 세션 목록 |

- 각 탭에 카운트 배지 표시
- 빈 상태 시 새 모임 열기 버튼 제공

---

## 9. 세션 카드 (`SessionCard`)

**파일**: `components/SessionCard.tsx`

| 표시 요소 | 설명 |
|-----------|------|
| 상단 컬러 바 | 세션 유형 색상으로 강조 |
| 온라인/동아리 배너 | `mode === 'online'` → Zoom 배너, `mode === 'offline'` → 학교 동아리 배너 |
| 진로교사 배지 | `isTeacherCreated === true` 시 표시 |
| 참여율 프로그레스 바 | `currentParticipants / maxParticipants` 비율 시각화 |
| 마감 배지 | `currentParticipants >= maxParticipants` 시 표시 |
| 참여/취소 버튼 | 소유자는 편집 버튼, 일반 참여자는 참여/취소 버튼 |

---

## 10. 세션 상세 (`SessionDetail`)

**파일**: `components/SessionDetail.tsx`

바텀시트 형태의 모달로, 세션의 전체 정보를 표시합니다.

| 섹션 | 내용 |
|------|------|
| 헤더 | 세션 유형 아이콘, 제목, 진행 방식 배지 |
| 일정 정보 | 날짜, 시간, 장소 |
| Zoom 링크 | `mode === 'online'` 시 Zoom 입장 버튼 표시 |
| 학교/동아리 정보 | `schoolName`, `clubName`, `teacherName` 표시 |
| 세부 항목 | `agenda` 배열 번호 목록 |
| 목적 태그 | `purposeTags` 배지 목록 |
| 참여자 현황 | 현재/최대 인원 프로그레스 바 |
| 커리어 패스 연결 | `careerPathRef` 있을 시 표시 |
| 액션 버튼 | 참여/취소 또는 (소유자) 편집/삭제 |
| 댓글 섹션 | `CommentSection` 컴포넌트 |

---

## 11. 세션 생성 폼 (`SessionForm`)

**파일**: `components/SessionForm.tsx`

신규 생성과 편집을 모두 처리하는 상세 폼입니다. `initial` prop이 있으면 편집 모드로 동작합니다.

### 입력 필드

| 필드 | 타입 | 설명 |
|------|------|------|
| `title` | `string` | 모임 제목 |
| `type` | `SessionType` | 세션 유형 선택 |
| `mode` | `ModeType` | 진행 방식 선택 |
| `date` / `time` | `string` | 날짜·시간 |
| `location` | `string` | 장소 |
| `zoomLink` | `string?` | Zoom 링크 (온라인 시) |
| `schoolName` | `string?` | 학교명 (오프라인 시 필수) |
| `clubName` | `string?` | 동아리명 |
| `isTeacherCreated` | `boolean` | 진로교사 생성 여부 |
| `teacherName` | `string?` | 교사명 |
| `description` | `string` | 설명 |
| `agenda` | `AgendaItem[]` | 세부 항목 (AgendaEditor 컴포넌트) |
| `purposeTags` | `PurposeTagKey[]` | 목적 태그 (1개 이상 필수) |
| `maxParticipants` | `number` | 최대 참여 인원 |
| `hostName` | `string` | 호스트명 |
| `tags` | `string[]` | 자유 태그 |
| `resources` | `Resource[]` | 참고 자료 링크 |

---

## 12. 빠른 생성 (`QuickCreator`)

**파일**: `components/QuickCreator.tsx`

6개의 사전 정의 템플릿 중 하나를 선택하면 최소 입력(날짜, 시간, 호스트명)만으로 세션을 생성할 수 있는 바텀시트입니다.

### 빠른 생성 템플릿 (`CAREER_PATH_QUICK_TEMPLATES`)

| ID | 라벨 | 유형 | 방식 |
|----|------|------|------|
| `cp-it` | IT/개발 진로 탐색 | `career_explore` | 온라인 |
| `cp-design` | 디자인 커리어 설계 | `career_design` | 온라인 |
| `cp-science` | 이공계 진로 탐색 | `career_explore` | 온라인 |
| `cp-contest` | 공모전 도전 | `challenge` | 온라인 |
| `cp-cert` | 자격증 스터디 | `certification` | 온라인 |
| `cp-club` | 학교 동아리 활동 | `career_design` | 오프라인 |

- 템플릿 선택 → 날짜/시간/호스트명 입력 → 즉시 생성
- "상세 폼으로 전환" 버튼으로 `SessionForm`으로 이동 가능

---

## 13. 댓글 섹션 (`CommentSection`)

**파일**: `components/CommentSection.tsx`

세션 상세 하단에 표시되는 댓글 및 답글 시스템입니다.

- 댓글과 답글은 `launchpad_comments` 키에 `Record<sessionId, Comment[]>` 형태로 저장
- 댓글 삭제 기능 포함
- 답글 토글 (펼치기/숨기기)
- `timeAgo()` 함수로 상대적 시간 표시 (방금 전 / N분 전 / N시간 전 / N일 전)

---

## 14. 커뮤니티 탭 (`CommunityTab`)

**파일**: `components/community/CommunityTab.tsx`

### 접근 제어 흐름

```
커뮤니티 탭 진입
    ↓
hasCommunityAccess() 확인
    ↓ false
CommunityAccessGate 표시
    ↓ 초대코드 입력 또는 가입 요청
접근 허용 (launchpad_community_access = 'true')
    ↓
SchoolClubView / GroupListView 표시
```

### 서브탭

| 키 | 라벨 | 컴포넌트 |
|----|------|----------|
| `school` | 학교 동아리 | `SchoolClubView` |
| `groups` | 그룹 | `GroupListView` |

- 접근 권한이 있을 경우 `CommunityAdminPanel`도 상단에 표시 (가입 요청 관리)

---

## 15. 커뮤니티 접근 게이트 (`CommunityAccessGate`)

**파일**: `components/community/CommunityAccessGate.tsx`

| 단계 | 설명 |
|------|------|
| `choose` | 초대 코드 입력 또는 가입 요청 선택 화면 |
| `form` | 가입 요청 자기소개 작성 화면 |
| `pending` | 승인 대기 중 화면 (데모에서는 즉시 승인) |

- 데모 초대 코드: `DREAM2024` (`COMMUNITY_DEMO_INVITE_CODE`)
- 가입 요청 시 `communityRequests.ts`의 `addJoinRequest()`를 호출하며, 데모에서는 즉시 `status: 'approved'`로 처리하고 `launchpad_community_access = 'true'` 설정

---

## 16. 학교 동아리 뷰 (`SchoolClubView`)

**파일**: `components/community/SchoolClubView.tsx`

### 가입 시스템 흐름

```
동아리 카드 클릭
    ↓
isJoined 확인 (launchpad_joined_clubs)
    ↓ false
JoinRequestDialog 표시
    ↓ 가입 확인
joinClub(clubId) 호출 → localStorage 저장
    ↓
동아리 상세 뷰 진입
```

### 주요 기능

| 기능 | 설명 |
|------|------|
| 동아리 목록 | `launchpad-community.json`의 `clubs` 배열 렌더링 |
| 가입/탈퇴 | `joinClub()` / `leaveClub()` (lib/launchpadCommunity.ts) |
| 더보기 메뉴 | `ClubMoreMenu` 컴포넌트 (탈퇴, 초대 코드 복사) |
| 세션 목록 | 동아리에 연결된 세션(`sessionIds`) 표시 |
| 커뮤니티 접근 제한 | `COMMUNITY_RESTRICTED === true` 시 미접근자에게 `CommunityAccessGate` 표시 |

---

## 17. 그룹 목록 뷰 (`GroupListView`)

**파일**: `components/community/GroupListView.tsx`

### 가입 시스템 흐름

```
그룹 카드 클릭
    ↓
isJoined 확인 (launchpad_joined_groups)
    ↓ false
JoinRequestDialog 표시
    ↓ 가입 확인
joinGroup(groupId) 호출 → localStorage 저장
    ↓
그룹 상세 뷰 진입
```

### 주요 기능

| 기능 | 설명 |
|------|------|
| 그룹 목록 | 시드 그룹 + 사용자 생성 커스텀 그룹 합산 표시 |
| 그룹 생성 | `CreateGroupDialog` 통해 신규 그룹 생성 → `launchpad_custom_groups` 저장 |
| 가입/탈퇴 | `joinGroup()` / `leaveGroup()` |
| 더보기 메뉴 | `GroupMoreMenu` 컴포넌트 (탈퇴, 초대 코드 복사) |
| 세션 목록 | 그룹에 연결된 세션(`sessionIds`) 표시 |
| 그룹 내 세션 생성 | `onCreateSession(groupId)` 호출 → `createForGroupId` 설정 후 `SessionForm` 열기 |

### 그룹 카테고리 (`GroupCategoryKey`)

| 키 | 라벨 | 설명 |
|----|------|------|
| `study` | 스터디 | 함께 학습하고 지식을 나누는 그룹 |
| `project` | 프로젝트팀 | 공모전·프로젝트를 함께 실행하는 팀 |
| `mentoring` | 멘토링 | 선배·현직자에게 조언을 받는 그룹 |
| `school_club` | 동아리 | 학교 내 진로·커리어 동아리 |

---

## 18. 그룹 생성 다이얼로그 (`CreateGroupDialog`)

**파일**: `components/community/CreateGroupDialog.tsx`

| 입력 필드 | 설명 |
|-----------|------|
| `name` | 그룹 이름 (필수) |
| `description` | 그룹 설명 (필수) |
| `category` | 그룹 카테고리 (`study` \| `project` \| `mentoring` \| `school_club`) |
| `mode` | 진행 방식 (`online` \| `offline` \| `hybrid`) |
| `maxMembers` | 최대 멤버 수 (기본 15명) |
| `tags` | 쉼표 구분 태그 |
| `creatorName` | 개설자 이름 |

- 생성 시 자동으로 `emoji`, `color`는 카테고리 설정에서 가져옴
- `inviteCode`는 `GRP-${timestamp}` 형태로 자동 생성

---

## 19. TypeScript 타입 구조

### `LaunchpadSession`

```typescript
type LaunchpadSession = {
  id: string;
  title: string;
  type: SessionType;                  // 'career_explore' | 'career_design' | 'challenge' | 'certification'
  mode: ModeType;                     // 'online' | 'offline' | 'hybrid'
  description: string;
  agenda: AgendaItem[];               // [{ id, text }]
  date: string;                       // ISO 날짜 문자열
  time: string;
  location: string;
  zoomLink?: string;
  schoolName?: string;
  clubName?: string;
  isTeacherCreated?: boolean;
  teacherName?: string;
  careerPathRef?: string;
  purposeTags: PurposeTagKey[];
  groupId?: string;                   // 그룹 소속 세션이면 groupId 존재
  maxParticipants: number;
  currentParticipants: number;
  hostName: string;
  tags: string[];
  resources: Resource[];              // [{ id, title, url }]
  createdAt: string;
};
```

### `SchoolClub`

```typescript
type SchoolClub = {
  id: string;
  code?: string;
  schoolName: string;
  clubName: string;
  description: string;
  teacherName?: string;
  memberCount: number;
  maxMembers: number;
  tags: string[];
  meetingSchedule: string;
  sessionIds: string[];
  createdAt: string;
};
```

### `LaunchpadGroup`

```typescript
type LaunchpadGroup = {
  id: string;
  inviteCode?: string;
  name: string;
  description: string;
  category: GroupCategoryKey;         // 'study' | 'project' | 'mentoring' | 'school_club'
  mode: 'online' | 'offline' | 'hybrid';
  emoji: string;
  color: string;
  creatorName: string;
  memberCount: number;
  maxMembers: number;
  tags: string[];
  isPublic: boolean;
  sessionIds: string[];
  createdAt: string;
};
```

### `Comment` / `Reply`

```typescript
type Reply = {
  id: string;
  text: string;
  author: string;
  createdAt: string;
};

type Comment = {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  replies: Reply[];
};
```

---

## 20. localStorage 키 목록

| 키 | 타입 | 설명 |
|----|------|------|
| `launchpad_sessions` | `LaunchpadSession[]` | 전체 세션 배열 |
| `launchpad_joined` | `string[]` | 참여 중인 세션 ID 배열 |
| `launchpad_owned` | `string[]` | 내가 만든 세션 ID 배열 |
| `launchpad_community_access` | `'true' \| 'false'` | 커뮤니티 탭 접근 권한 |
| `launchpad_community_join_requests` | `CommunityJoinRequest[]` | 가입 요청 목록 |
| `launchpad_community_my_request_id` | `string` | 내 가입 요청 ID |
| `launchpad_joined_clubs` | `string[]` | 가입한 학교 동아리 ID 배열 |
| `launchpad_joined_groups` | `string[]` | 가입한 그룹 ID 배열 |
| `launchpad_custom_groups` | `LaunchpadGroup[]` | 사용자가 생성한 커스텀 그룹 |
| `launchpad_comments` | `Record<sessionId, Comment[]>` | 세션별 댓글 데이터 |

---

## 21. 유틸리티 라이브러리

### `frontend/lib/launchpadCommunity.ts`

런치패드 커뮤니티 가입 상태를 관리하는 localStorage 유틸리티입니다.

| 함수 | 설명 |
|------|------|
| `loadJoinedClubIds()` | 가입한 동아리 ID 배열 로드 |
| `saveJoinedClubIds(ids)` | 가입한 동아리 ID 배열 저장 |
| `joinClub(clubId)` | 동아리 가입 |
| `leaveClub(clubId)` | 동아리 탈퇴 |
| `isJoinedClub(clubId)` | 동아리 가입 여부 확인 |
| `loadJoinedGroupIds()` | 가입한 그룹 ID 배열 로드 |
| `saveJoinedGroupIds(ids)` | 가입한 그룹 ID 배열 저장 |
| `joinGroup(groupId)` | 그룹 가입 |
| `leaveGroup(groupId)` | 그룹 탈퇴 |
| `isJoinedGroup(groupId)` | 그룹 가입 여부 확인 |

### `components/community/communityRequests.ts`

커뮤니티 가입 요청을 관리하는 localStorage 유틸리티입니다.

| 함수 | 설명 |
|------|------|
| `addJoinRequest(message)` | 가입 요청 추가 (데모: 즉시 승인) |
| `loadJoinRequests()` | 전체 가입 요청 목록 로드 |
| `hasPendingRequest()` | 대기 중인 요청 여부 (데모: 항상 false) |
| `getMyRequestId()` | 내 가입 요청 ID 조회 |
| `approveRequest(id)` | 요청 승인 |
| `denyRequest(id)` | 요청 거절 |
| `getPendingRequests()` | 대기 중인 요청 목록 조회 |

---

## 22. 공통 컴포넌트 의존성

| 컴포넌트 | 경로 | 사용처 |
|----------|------|--------|
| `JoinRequestDialog` | `@/components/community/JoinRequestDialog` | `SchoolClubView`, `GroupListView` |
| `TabBar` | `@/components/tab-bar` | `page.tsx` (하단 네비게이션) |

---

## 23. 사용자 시나리오

### 시나리오 1: 모임 탐색 및 참여
1. `/launchpad` 진입 → 탐색 탭 기본 표시
2. 유형 탭 (진로 탐색 / 커리어 설계 / 실행·도전 / 자격·수상) 선택
3. 모드 필터 (Zoom / 오프라인 / 진로교사) 선택
4. 세션 카드 클릭 → `SessionDetail` 바텀시트 표시
5. "참여하기" 버튼 클릭 → `joined` Set에 추가, 인원 +1

### 시나리오 2: 빠른 모임 생성
1. 헤더 "빠른" 버튼 또는 탐색 탭 히어로 배너의 "빠른 생성" 클릭
2. `QuickCreator` 바텀시트에서 템플릿 선택
3. 날짜, 시간, 호스트명 입력
4. "생성하기" 클릭 → 세션 생성, `owned` Set에 추가

### 시나리오 3: 상세 모임 생성
1. 헤더 "열기" 버튼 또는 탐색 탭 히어로 배너의 "직접 만들기" 클릭
2. `SessionForm`에서 전체 필드 입력 (유형, 방식, 날짜, 장소, 세부 항목, 목적 태그 등)
3. "생성하기" 클릭 → 세션 생성

### 시나리오 4: 커뮤니티 접근
1. "커뮤니티" 탭 클릭
2. `CommunityAccessGate` 표시 (미접근 시)
3. **방법 A**: 초대 코드 `DREAM2024` 입력 → 즉시 접근 허용
4. **방법 B**: 가입 요청 → 자기소개 작성 → 즉시 승인 (데모)
5. 학교 동아리 / 그룹 탭 이용 가능

### 시나리오 5: 학교 동아리 가입
1. 커뮤니티 탭 → 학교 동아리 서브탭
2. 동아리 카드 클릭 (미가입 상태)
3. `JoinRequestDialog` 표시
4. 가입 확인 → `joinClub()` 호출 → `launchpad_joined_clubs` 저장
5. 동아리 상세 뷰 진입, 소속 세션 목록 확인

### 시나리오 6: 그룹 생성 및 세션 연결
1. 커뮤니티 탭 → 그룹 서브탭 → "그룹 만들기" 클릭
2. `CreateGroupDialog`에서 그룹 정보 입력
3. 그룹 생성 → `launchpad_custom_groups` 저장
4. 그룹 상세에서 "모임 만들기" 클릭 → `createForGroupId` 설정
5. `SessionForm`에서 세션 생성 → `groupId`가 해당 그룹 ID로 설정됨

---

## 24. 현재 구현 한계 (데모/목업)

| 항목 | 현재 동작 | 백엔드 연동 시 |
|------|-----------|----------------|
| 세션 데이터 | `localStorage` 영속 | API CRUD |
| 커뮤니티 접근 | 초대 코드 `DREAM2024` 또는 즉시 승인 | 서버 검증 및 승인 프로세스 |
| 가입 요청 | `status: 'approved'` 즉시 처리 | 관리자 검토 후 승인 |
| 댓글 | `localStorage` 저장 | 댓글 API |
| 참여 인원 | 클라이언트 카운트 | 서버 동기화 |
| 그룹 생성 | `localStorage` 저장 | 그룹 API |
| 사용자 인증 | 없음 (hostName 텍스트 입력) | JWT/세션 기반 인증 |

---

## 25. 백엔드 연동 포인트

| 기능 | 현재 | 연동 방법 |
|------|------|-----------|
| 세션 목록 조회 | `launchpad.json` 시드 | `GET /api/launchpad/sessions` |
| 세션 생성 | `localStorage` | `POST /api/launchpad/sessions` |
| 세션 수정 | `localStorage` | `PUT /api/launchpad/sessions/:id` |
| 세션 삭제 | `localStorage` | `DELETE /api/launchpad/sessions/:id` |
| 참여/취소 | `localStorage` | `POST /api/launchpad/sessions/:id/join` |
| 커뮤니티 접근 | `localStorage` 플래그 | `GET /api/community/access` |
| 가입 요청 | `communityRequests.ts` | `POST /api/community/join-requests` |
| 동아리 목록 | `launchpad-community.json` | `GET /api/community/clubs` |
| 그룹 목록 | `launchpad-community.json` + `localStorage` | `GET /api/community/groups` |
| 댓글 | `localStorage` | `GET/POST /api/launchpad/sessions/:id/comments` |
