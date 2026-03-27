# 커리어 패스 백엔드 & DB 설계서

> **작성일**: 2026-03-27  
> **목적**: AI CareerPath 커리어 패스 기능의 백엔드 API 및 데이터베이스 설계  
> **분석 대상**: `/frontend/app/career` 및 관련 JSON 데이터

---

## 목차

1. [개요](#1-개요)
2. [시스템 아키텍처](#2-시스템-아키텍처)
3. [도메인 모델 분석](#3-도메인-모델-분석)
4. [데이터베이스 설계](#4-데이터베이스-설계)
5. [API 엔드포인트 설계](#5-api-엔드포인트-설계)
6. [기능별 상세 설계](#6-기능별-상세-설계)
7. [보안 및 권한 관리](#7-보안-및-권한-관리)
8. [성능 최적화 전략](#8-성능-최적화-전략)
9. [배포 및 확장성](#9-배포-및-확장성)

---

## 1. 개요

### 1.1 시스템 목적

AI CareerPath의 **커리어 패스(Career Path)** 기능은 학생들이 자신의 진로 목표를 설정하고, 학년별·월별 활동 계획을 수립하며, 이를 커뮤니티(학교·그룹)와 공유하고 피드백을 받을 수 있는 진로 설계 플랫폼입니다.

### 1.2 핵심 기능 6가지

프론트엔드 분석 결과, 다음 6가지 핵심 기능으로 구성됩니다:

1. **템플릿 커리어 패스**: 직업별 사전 정의된 로드맵 제공
2. **커리어 패스 CRUD**: 개인 커리어 패스 생성·수정·삭제·조회
3. **커뮤니티 (학교·그룹)**: 학교 공간 및 사용자 그룹 관리
4. **댓글 시스템**: 공유된 커리어 패스에 대한 댓글·대댓글
5. **신고 시스템**: 부적절한 콘텐츠·댓글 신고
6. **공유 시스템**: 전체 공유·학교 공유·그룹 공유

### 1.3 기술 스택 권장사항

**백엔드**:
- **언어/프레임워크**: Node.js + Express / NestJS (TypeScript) 또는 Python + FastAPI
- **데이터베이스**: PostgreSQL (관계형 데이터) + Redis (캐싱·세션)
- **ORM**: Prisma (Node.js) / SQLAlchemy (Python)
- **인증**: JWT (Access Token + Refresh Token)
- **파일 스토리지**: AWS S3 / Cloudflare R2 (포트폴리오 파일 업로드)
- **실시간**: WebSocket (Socket.io) - 댓글 알림용 (선택)

**인프라**:
- **컨테이너**: Docker + Docker Compose
- **배포**: AWS ECS / GCP Cloud Run / Vercel (서버리스)
- **모니터링**: Sentry (에러 추적), DataDog / New Relic (APM)

---

## 2. 시스템 아키텍처

### 2.1 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
│  /career?tab=explore | timeline | community                  │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTPS (REST API / GraphQL)
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway / Load Balancer                │
│                    (Nginx / AWS ALB)                          │
└────────────────┬────────────────────────────────────────────┘
                 │
    ┌────────────┼────────────┬────────────────┐
    ▼            ▼            ▼                ▼
┌─────────┐ ┌─────────┐ ┌──────────┐   ┌──────────────┐
│ Auth    │ │ Career  │ │Community │   │ Notification │
│ Service │ │ Service │ │ Service  │   │   Service    │
└────┬────┘ └────┬────┘ └────┬─────┘   └──────┬───────┘
     │           │            │                 │
     └───────────┴────────────┴─────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
     ┌─────────┐  ┌─────────┐  ┌─────────┐
     │PostgreSQL│  │  Redis  │  │   S3    │
     │  (Main)  │  │ (Cache) │  │ (Files) │
     └─────────┘  └─────────┘  └─────────┘
```

### 2.2 마이크로서비스 분리 (선택)

**Phase 1 (모놀리식)**: 초기에는 단일 서버로 시작
**Phase 2 (마이크로서비스)**: 트래픽 증가 시 서비스 분리
- **Auth Service**: 회원가입·로그인·토큰 관리
- **Career Service**: 커리어 패스 CRUD·템플릿·타임라인
- **Community Service**: 학교·그룹·공유·댓글·신고
- **Notification Service**: 알림 발송 (이메일·푸시·인앱)

---

## 3. 도메인 모델 분석

### 3.1 프론트엔드 데이터 구조 분석

#### 3.1.1 CareerPlan (개인 커리어 패스)

```typescript
// frontend/app/career/components/CareerPathBuilder.tsx
interface CareerPlan {
  id: string;                    // UUID
  title: string;                 // 커리어 패스 제목
  jobId: string;                 // 직업 ID (예: "doctor", "app-developer")
  jobName: string;               // 직업 이름
  jobEmoji: string;              // 직업 이모지
  starId: string;                // 별(적성) ID
  starName: string;              // 별 이름
  starEmoji: string;             // 별 이모지
  starColor: string;             // 별 색상 (#3B82F6)
  createdAt: string;             // ISO 8601 날짜
  updatedAt: string;             // ISO 8601 날짜
  years: CareerPlanYear[];       // 학년별 계획
}

interface CareerPlanYear {
  gradeId: string;               // 학년 ID (예: "mid1", "high2")
  gradeLabel: string;            // 학년 라벨 (예: "중1", "고2")
  goalGroups: GoalGroup[];       // 목표-활동 그룹
  goals: string[];               // 하위 호환: 단순 목표 목록
  items: PlanItem[];             // 하위 호환: 단순 활동 목록
}

interface GoalGroup {
  goal: string;                  // 목표 (예: "프로그래밍 기초 완성")
  items: PlanItem[];             // 해당 목표 달성을 위한 활동들
}

interface PlanItem {
  id: string;                    // 활동 ID
  type: 'activity' | 'award' | 'portfolio' | 'certification';
  title: string;                 // 활동 제목
  month: number;                 // 실행 월 (1~12)
  difficulty: number;            // 난이도 (1~5)
  cost?: string;                 // 비용 (예: "무료", "3만원")
  organizer?: string;            // 주최 기관
  url?: string;                  // 관련 URL
  description?: string;          // 상세 설명
  categoryTags?: string[];       // 카테고리 태그
  activitySubtype?: string;      // 활동 세부 유형
  subItems?: SubItem[];          // 하위 실행 항목 (체크리스트)
  links?: Link[];                // 참고 링크 목록
}

interface SubItem {
  id: string;
  title: string;
  done?: boolean;                // 완료 여부
  url?: string;
  description?: string;
}

interface Link {
  title: string;
  url: string;
  kind?: string;                 // 링크 종류 (예: "official", "guide")
}
```

#### 3.1.2 SharedPlan (공유된 커리어 패스)

```typescript
// frontend/app/career/components/community/types.ts
interface SharedPlan {
  id: string;                    // 공유 ID (UUID)
  planId: string;                // 원본 CareerPlan ID
  ownerId: string;               // 소유자 ID
  ownerName: string;
  ownerEmoji: string;
  ownerGrade: string;            // 소유자 학년
  schoolId: string;              // 학교 ID
  shareType: ShareType;          // 'private' | 'public' | 'school' | 'group'
  title: string;
  description?: string;          // 공유 설명
  jobEmoji: string;
  jobName: string;
  starName: string;
  starEmoji: string;
  starColor: string;
  yearCount: number;             // 총 학년 수
  itemCount: number;             // 총 활동 수
  sharedAt: string;              // 공유 일시
  updatedAt?: string;            // 최종 수정 일시
  likes: number;                 // 좋아요 수
  bookmarks: number;             // 북마크 수
  years: SharedPlanYear[];       // 학년별 계획 (CareerPlanYear와 동일)
  operatorComments: OperatorComment[];  // 댓글 목록
  groupIds: string[];            // 공유된 그룹 ID 목록
  tags?: string[];               // 태그 (예: ["SW", "코딩"])
}

type ShareType = 'private' | 'public' | 'school' | 'group';
```

#### 3.1.3 Community (학교·그룹)

```typescript
// School (학교)
interface School {
  id: string;
  name: string;                  // 학교 이름
  code: string;                  // 가입 코드 (예: "FUTURE2024")
  operatorId: string;            // 운영자(선생님) ID
  operatorName: string;
  operatorEmoji: string;
  grades: string[];              // 학년 목록 (예: ["mid1", "mid2", "mid3"])
  memberCount: number;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

// Group (사용자 그룹)
interface CommunityGroup {
  id: string;
  name: string;                  // 그룹 이름
  emoji: string;
  description: string;
  color: string;                 // 그룹 색상
  creatorId: string;             // 생성자 ID
  creatorName: string;
  memberCount: number;
  members: GroupMember[];
  sharedPlanCount: number;
  inviteCode?: string;           // 초대 코드
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
  isOperatorTest?: boolean;      // 운영자 테스트 그룹 여부
}

interface GroupMember {
  id: string;                    // 사용자 ID
  name: string;
  emoji: string;
  grade: string;
  joinedAt: string;
  role?: 'creator' | 'member' | 'operator';
}
```

#### 3.1.4 Comment (댓글)

```typescript
interface OperatorComment {
  id: string;
  parentId?: string;             // 대댓글인 경우 부모 댓글 ID
  authorId: string;
  authorName: string;
  authorEmoji: string;
  authorRole: 'operator' | 'peer';  // 운영자(선생님) vs 동료
  content: string;               // 댓글 내용
  createdAt: string;
}

// 트리 구조 (대댓글 포함)
interface OperatorCommentNode extends OperatorComment {
  replies: OperatorCommentNode[];
}
```

#### 3.1.5 Report (신고)

```typescript
// frontend/app/career/components/ReportModal.tsx
type ReportTarget =
  | { kind: 'content'; id: string; title: string }
  | { kind: 'comment'; id: string; author: string };

interface Report {
  id: string;
  targetKind: 'content' | 'comment';
  targetId: string;              // SharedPlan ID 또는 Comment ID
  reporterId: string;            // 신고자 ID
  reason: string;                // 신고 사유 ID
  reasonLabel: string;           // 신고 사유 라벨
  detail?: string;               // 상세 설명
  status: 'pending' | 'reviewed' | 'resolved' | 'rejected';
  reportedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;           // 검토자 ID
}
```

#### 3.1.6 User Reaction (좋아요·북마크)

```typescript
interface UserReactionState {
  likedPlanIds: string[];
  bookmarkedPlanIds: string[];
}

// 정규화된 구조
interface Reaction {
  id: string;
  userId: string;
  targetType: 'shared_plan';
  targetId: string;              // SharedPlan ID
  reactionType: 'like' | 'bookmark';
  createdAt: string;
}
```

---

## 4. 데이터베이스 설계

### 4.1 ERD (Entity Relationship Diagram)

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│    users     │───┬───│   career_plans   │───┬───│  plan_years  │
└──────────────┘   │   └──────────────────┘   │   └──────────────┘
       │           │            │              │           │
       │           │            │              │           │
       │           │            │              │           ▼
       │           │            │              │   ┌──────────────┐
       │           │            │              └───│ goal_groups  │
       │           │            │                  └──────────────┘
       │           │            │                          │
       │           │            │                          ▼
       │           │            │                  ┌──────────────┐
       │           │            │                  │  plan_items  │
       │           │            │                  └──────────────┘
       │           │            │                          │
       │           │            │                          ▼
       │           │            │                  ┌──────────────┐
       │           │            │                  │   sub_items  │
       │           │            │                  └──────────────┘
       │           │            │
       │           │            ▼
       │           │    ┌──────────────────┐
       │           └────│  shared_plans    │
       │                └──────────────────┘
       │                        │
       │                        ├──────────────┐
       │                        │              │
       │                        ▼              ▼
       │                ┌──────────────┐  ┌──────────────┐
       │                │   comments   │  │  reactions   │
       │                └──────────────┘  └──────────────┘
       │                        │
       │                        ▼
       │                ┌──────────────┐
       │                │   reports    │
       │                └──────────────┘
       │
       ├────────────────┬────────────────┐
       ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   schools    │  │    groups    │  │group_members │
└──────────────┘  └──────────────┘  └──────────────┘
       │                │
       └────────┬───────┘
                ▼
        ┌──────────────┐
        │shared_plan_  │
        │   groups     │
        └──────────────┘
```

### 4.2 테이블 상세 설계

#### 4.2.1 users (사용자)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  emoji VARCHAR(10) DEFAULT '👤',
  grade_id VARCHAR(20),                    -- 현재 학년 (예: "mid2")
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  role VARCHAR(20) DEFAULT 'student',      -- 'student' | 'teacher' | 'admin'
  profile_image_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  is_email_verified BOOLEAN DEFAULT FALSE,
  
  INDEX idx_users_email (email),
  INDEX idx_users_school_id (school_id),
  INDEX idx_users_grade_id (grade_id)
);

-- 트리거: updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

#### 4.2.2 career_plans (개인 커리어 패스)

```sql
CREATE TABLE career_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  job_id VARCHAR(100) NOT NULL,            -- 직업 ID (예: "doctor")
  job_name VARCHAR(100) NOT NULL,
  job_emoji VARCHAR(10),
  star_id VARCHAR(100) NOT NULL,           -- 별(적성) ID (예: "explore")
  star_name VARCHAR(100),
  star_emoji VARCHAR(10),
  star_color VARCHAR(20),
  description TEXT,
  is_template BOOLEAN DEFAULT FALSE,       -- 템플릿 여부
  template_category VARCHAR(50),           -- 템플릿 카테고리
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  INDEX idx_career_plans_user_id (user_id),
  INDEX idx_career_plans_job_id (job_id),
  INDEX idx_career_plans_star_id (star_id),
  INDEX idx_career_plans_is_template (is_template)
);

CREATE TRIGGER update_career_plans_updated_at
BEFORE UPDATE ON career_plans
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

#### 4.2.3 plan_years (학년별 계획)

```sql
CREATE TABLE plan_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  career_plan_id UUID NOT NULL REFERENCES career_plans(id) ON DELETE CASCADE,
  grade_id VARCHAR(20) NOT NULL,           -- 학년 ID (예: "mid1")
  grade_label VARCHAR(50) NOT NULL,        -- 학년 라벨 (예: "중1")
  sort_order INTEGER NOT NULL,             -- 정렬 순서
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE (career_plan_id, grade_id),
  INDEX idx_plan_years_career_plan_id (career_plan_id),
  INDEX idx_plan_years_grade_id (grade_id)
);
```

#### 4.2.4 goal_groups (목표 그룹)

```sql
CREATE TABLE goal_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_year_id UUID NOT NULL REFERENCES plan_years(id) ON DELETE CASCADE,
  goal TEXT NOT NULL,                      -- 목표 (예: "프로그래밍 기초 완성")
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  INDEX idx_goal_groups_plan_year_id (plan_year_id)
);
```

#### 4.2.5 plan_items (활동·수상·작품·자격증)

```sql
CREATE TABLE plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_year_id UUID NOT NULL REFERENCES plan_years(id) ON DELETE CASCADE,
  goal_group_id UUID REFERENCES goal_groups(id) ON DELETE SET NULL,
  type VARCHAR(20) NOT NULL,               -- 'activity' | 'award' | 'portfolio' | 'certification'
  title VARCHAR(300) NOT NULL,
  month INTEGER CHECK (month >= 1 AND month <= 12),
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5),
  cost VARCHAR(100),
  organizer VARCHAR(200),
  url TEXT,
  description TEXT,
  activity_subtype VARCHAR(50),            -- 활동 세부 유형
  category_tags TEXT[],                    -- 카테고리 태그 배열
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  INDEX idx_plan_items_plan_year_id (plan_year_id),
  INDEX idx_plan_items_goal_group_id (goal_group_id),
  INDEX idx_plan_items_type (type),
  INDEX idx_plan_items_month (month)
);

CREATE TRIGGER update_plan_items_updated_at
BEFORE UPDATE ON plan_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

#### 4.2.6 sub_items (활동 하위 체크리스트)

```sql
CREATE TABLE sub_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_item_id UUID NOT NULL REFERENCES plan_items(id) ON DELETE CASCADE,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  url TEXT,
  is_done BOOLEAN DEFAULT FALSE,
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  INDEX idx_sub_items_plan_item_id (plan_item_id)
);

CREATE TRIGGER update_sub_items_updated_at
BEFORE UPDATE ON sub_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

#### 4.2.7 item_links (활동 참고 링크)

```sql
CREATE TABLE item_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_item_id UUID NOT NULL REFERENCES plan_items(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  url TEXT NOT NULL,
  kind VARCHAR(50),                        -- 'official' | 'guide' | 'video' | 'article'
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  INDEX idx_item_links_plan_item_id (plan_item_id)
);
```

#### 4.2.8 shared_plans (공유된 커리어 패스)

```sql
CREATE TABLE shared_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  career_plan_id UUID NOT NULL REFERENCES career_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  share_type VARCHAR(20) NOT NULL,         -- 'public' | 'school' | 'group'
  title VARCHAR(200) NOT NULL,
  description TEXT,
  tags TEXT[],                             -- 태그 배열
  like_count INTEGER DEFAULT 0,
  bookmark_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  shared_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_hidden BOOLEAN DEFAULT FALSE,         -- 신고 등으로 숨김 처리
  
  INDEX idx_shared_plans_career_plan_id (career_plan_id),
  INDEX idx_shared_plans_user_id (user_id),
  INDEX idx_shared_plans_school_id (school_id),
  INDEX idx_shared_plans_share_type (share_type),
  INDEX idx_shared_plans_shared_at (shared_at DESC),
  INDEX idx_shared_plans_like_count (like_count DESC),
  INDEX idx_shared_plans_tags (tags) USING GIN
);

CREATE TRIGGER update_shared_plans_updated_at
BEFORE UPDATE ON shared_plans
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

#### 4.2.9 shared_plan_groups (공유 패스 - 그룹 연결)

```sql
CREATE TABLE shared_plan_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_plan_id UUID NOT NULL REFERENCES shared_plans(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE (shared_plan_id, group_id),
  INDEX idx_shared_plan_groups_shared_plan_id (shared_plan_id),
  INDEX idx_shared_plan_groups_group_id (group_id)
);
```

#### 4.2.10 schools (학교)

```sql
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,        -- 가입 코드 (예: "FUTURE2024")
  operator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  grades TEXT[],                           -- 학년 목록 (예: ["mid1", "mid2", "mid3"])
  member_count INTEGER DEFAULT 0,
  description TEXT,
  region VARCHAR(100),                     -- 지역 (예: "서울특별시 강남구")
  school_type VARCHAR(50),                 -- 'elementary' | 'middle' | 'high'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  INDEX idx_schools_code (code),
  INDEX idx_schools_operator_id (operator_id),
  INDEX idx_schools_region (region)
);

CREATE TRIGGER update_schools_updated_at
BEFORE UPDATE ON schools
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

#### 4.2.11 groups (사용자 그룹)

```sql
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  emoji VARCHAR(10) DEFAULT '👥',
  description TEXT,
  color VARCHAR(20) DEFAULT '#6C5CE7',
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invite_code VARCHAR(50) UNIQUE,          -- 초대 코드 (예: "GRP-IT-001")
  member_count INTEGER DEFAULT 1,
  shared_plan_count INTEGER DEFAULT 0,
  tags TEXT[],
  is_operator_test BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  INDEX idx_groups_creator_id (creator_id),
  INDEX idx_groups_invite_code (invite_code),
  INDEX idx_groups_tags (tags) USING GIN
);

CREATE TRIGGER update_groups_updated_at
BEFORE UPDATE ON groups
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

#### 4.2.12 group_members (그룹 멤버)

```sql
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member',       -- 'creator' | 'operator' | 'member'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE (group_id, user_id),
  INDEX idx_group_members_group_id (group_id),
  INDEX idx_group_members_user_id (user_id)
);
```

#### 4.2.13 comments (댓글)

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_plan_id UUID NOT NULL REFERENCES shared_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_role VARCHAR(20) DEFAULT 'peer',  -- 'operator' | 'peer'
  is_hidden BOOLEAN DEFAULT FALSE,         -- 신고 등으로 숨김 처리
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  INDEX idx_comments_shared_plan_id (shared_plan_id),
  INDEX idx_comments_user_id (user_id),
  INDEX idx_comments_parent_comment_id (parent_comment_id),
  INDEX idx_comments_created_at (created_at DESC)
);

CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

#### 4.2.14 reactions (좋아요·북마크)

```sql
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type VARCHAR(20) NOT NULL,        -- 'shared_plan' (향후 확장: 'comment')
  target_id UUID NOT NULL,                 -- shared_plan_id
  reaction_type VARCHAR(20) NOT NULL,      -- 'like' | 'bookmark'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE (user_id, target_type, target_id, reaction_type),
  INDEX idx_reactions_user_id (user_id),
  INDEX idx_reactions_target (target_type, target_id),
  INDEX idx_reactions_reaction_type (reaction_type)
);
```

#### 4.2.15 reports (신고)

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type VARCHAR(20) NOT NULL,        -- 'shared_plan' | 'comment'
  target_id UUID NOT NULL,
  reason_id VARCHAR(50) NOT NULL,          -- 신고 사유 ID (예: "spam", "inappropriate")
  reason_label VARCHAR(200) NOT NULL,
  detail TEXT,                             -- 상세 설명
  status VARCHAR(20) DEFAULT 'pending',    -- 'pending' | 'reviewed' | 'resolved' | 'rejected'
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  resolution_note TEXT,                    -- 검토 결과 메모
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  
  INDEX idx_reports_reporter_id (reporter_id),
  INDEX idx_reports_target (target_type, target_id),
  INDEX idx_reports_status (status),
  INDEX idx_reports_reported_at (reported_at DESC)
);
```

#### 4.2.16 notifications (알림)

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,               -- 'comment' | 'like' | 'bookmark' | 'mention'
  title VARCHAR(200) NOT NULL,
  message TEXT,
  link_url TEXT,                           -- 알림 클릭 시 이동할 URL
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  INDEX idx_notifications_user_id (user_id),
  INDEX idx_notifications_is_read (is_read),
  INDEX idx_notifications_created_at (created_at DESC)
);
```

---

## 5. API 엔드포인트 설계

### 5.1 API 버전 관리

- **Base URL**: `https://api.aicareerpath.com/v1`
- **인증**: `Authorization: Bearer {access_token}`
- **응답 형식**: JSON

### 5.2 공통 응답 구조

#### 성공 응답

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-03-27T10:00:00Z",
    "version": "1.0.0"
  }
}
```

#### 에러 응답

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-03-27T10:00:00Z",
    "version": "1.0.0"
  }
}
```

### 5.3 인증 (Authentication)

#### POST `/auth/register` - 회원가입

**Request**:
```json
{
  "email": "student@example.com",
  "password": "SecurePass123!",
  "name": "김학생",
  "gradeId": "mid2",
  "emoji": "👨‍🎓"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-1234",
      "email": "student@example.com",
      "name": "김학생",
      "emoji": "👨‍🎓",
      "gradeId": "mid2",
      "role": "student",
      "createdAt": "2026-03-27T10:00:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 3600
    }
  }
}
```

#### POST `/auth/login` - 로그인

**Request**:
```json
{
  "email": "student@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "tokens": { ... }
  }
}
```

#### POST `/auth/refresh` - 토큰 갱신

**Request**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600
  }
}
```

#### POST `/auth/logout` - 로그아웃

**Request**: (Header에 Authorization 필요)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

### 5.4 커리어 패스 (Career Plans)

#### GET `/career-plans` - 내 커리어 패스 목록 조회

**Query Parameters**:
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 20)
- `jobId`: 직업 ID 필터 (선택)
- `starId`: 별(적성) ID 필터 (선택)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "uuid-plan-1",
        "title": "소프트웨어 개발자 로드맵",
        "jobId": "app-developer",
        "jobName": "소프트웨어 개발자",
        "jobEmoji": "💻",
        "starId": "tech",
        "starName": "기술의 별",
        "starEmoji": "💻",
        "starColor": "#3B82F6",
        "yearCount": 3,
        "itemCount": 12,
        "createdAt": "2026-01-15T00:00:00Z",
        "updatedAt": "2026-03-20T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

#### GET `/career-plans/:id` - 커리어 패스 상세 조회

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid-plan-1",
    "title": "소프트웨어 개발자 로드맵",
    "jobId": "app-developer",
    "jobName": "소프트웨어 개발자",
    "jobEmoji": "💻",
    "starId": "tech",
    "starName": "기술의 별",
    "starEmoji": "💻",
    "starColor": "#3B82F6",
    "description": "중학교 시절부터 정보올림피아드, 해커톤, 포트폴리오까지 체계적으로 준비한 SW 개발자 진로 계획.",
    "years": [
      {
        "gradeId": "mid1",
        "gradeLabel": "중1",
        "goalGroups": [
          {
            "goal": "프로그래밍 기초 완성",
            "items": [
              {
                "id": "item-1",
                "type": "activity",
                "title": "스크래치 코딩 동아리 가입",
                "month": 3,
                "difficulty": 1,
                "cost": "무료",
                "organizer": "학교",
                "description": "...",
                "subItems": [
                  {
                    "id": "sub-1",
                    "title": "동아리 지원서 작성",
                    "done": false,
                    "url": "https://school.example/club"
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    "createdAt": "2026-01-15T00:00:00Z",
    "updatedAt": "2026-03-20T10:00:00Z"
  }
}
```

#### POST `/career-plans` - 커리어 패스 생성

**Request**:
```json
{
  "title": "소프트웨어 개발자 로드맵",
  "jobId": "app-developer",
  "jobName": "소프트웨어 개발자",
  "jobEmoji": "💻",
  "starId": "tech",
  "starName": "기술의 별",
  "starEmoji": "💻",
  "starColor": "#3B82F6",
  "description": "...",
  "years": [
    {
      "gradeId": "mid1",
      "gradeLabel": "중1",
      "goalGroups": [
        {
          "goal": "프로그래밍 기초 완성",
          "items": [
            {
              "type": "activity",
              "title": "스크래치 코딩 동아리 가입",
              "month": 3,
              "difficulty": 1,
              "cost": "무료",
              "organizer": "학교"
            }
          ]
        }
      ]
    }
  ]
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "uuid-plan-1",
    "title": "소프트웨어 개발자 로드맵",
    ...
  }
}
```

#### PUT `/career-plans/:id` - 커리어 패스 수정

**Request**: (POST와 동일한 구조)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid-plan-1",
    "title": "소프트웨어 개발자 로드맵 (수정됨)",
    ...
  }
}
```

#### DELETE `/career-plans/:id` - 커리어 패스 삭제

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Career plan deleted successfully",
    "deletedId": "uuid-plan-1"
  }
}
```

#### PATCH `/career-plans/:id/items/:itemId/sub-items/:subItemId` - 하위 항목 완료 토글

**Request**:
```json
{
  "done": true
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "sub-item-1",
    "title": "동아리 지원서 작성",
    "done": true,
    "updatedAt": "2026-03-27T10:00:00Z"
  }
}
```

---

### 5.5 템플릿 커리어 패스 (Templates)

#### GET `/templates` - 템플릿 목록 조회

**Query Parameters**:
- `jobId`: 직업 ID 필터 (선택)
- `starId`: 별(적성) ID 필터 (선택)
- `category`: 카테고리 필터 (선택, 예: "highschool", "admission")

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "template-1",
        "title": "의사 되기 프로젝트",
        "jobId": "doctor",
        "jobName": "의사",
        "jobEmoji": "🏥",
        "starId": "explore",
        "starName": "탐구의 별",
        "starEmoji": "🔬",
        "starColor": "#8B5CF6",
        "category": "highschool",
        "yearCount": 3,
        "itemCount": 15,
        "description": "의과대학 입시를 위한 과학 탐구, 봉사활동, 올림피아드 참가가 담긴 체계적인 의사 진로 계획."
      }
    ]
  }
}
```

#### GET `/templates/:id` - 템플릿 상세 조회

**Response** (200 OK): (커리어 패스 상세 조회와 동일한 구조)

#### POST `/templates/:id/use` - 템플릿으로 커리어 패스 생성

**Request**:
```json
{
  "customTitle": "나만의 의사 로드맵"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "uuid-new-plan",
    "title": "나만의 의사 로드맵",
    ...
  }
}
```

---

### 5.6 공유 패스 (Shared Plans)

#### GET `/shared-plans` - 공유 패스 목록 조회

**Query Parameters**:
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 20)
- `shareType`: 공유 유형 필터 (`public` | `school` | `group`)
- `schoolId`: 학교 ID 필터 (선택)
- `groupId`: 그룹 ID 필터 (선택)
- `jobId`: 직업 ID 필터 (선택)
- `tags`: 태그 필터 (쉼표 구분, 예: "SW,코딩")
- `sortBy`: 정렬 기준 (`recent` | `updated` | `likes` | `bookmarks`)
- `search`: 검색어 (제목·설명·작성자 이름)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "sharedPlans": [
      {
        "id": "shared-1",
        "planId": "plan-1",
        "ownerId": "user-1",
        "ownerName": "민수",
        "ownerEmoji": "🧑‍💻",
        "ownerGrade": "mid2",
        "schoolId": "school-1",
        "shareType": "public",
        "title": "소프트웨어 개발자 로드맵",
        "description": "...",
        "jobEmoji": "💻",
        "jobName": "소프트웨어 개발자",
        "starName": "기술의 별",
        "starEmoji": "💻",
        "starColor": "#3B82F6",
        "yearCount": 3,
        "itemCount": 12,
        "likeCount": 12,
        "bookmarkCount": 5,
        "viewCount": 150,
        "commentCount": 4,
        "sharedAt": "2025-03-15T00:00:00Z",
        "updatedAt": "2026-03-08T02:00:00Z",
        "tags": ["SW", "코딩", "정보올림피아드"],
        "isLiked": false,
        "isBookmarked": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

#### GET `/shared-plans/:id` - 공유 패스 상세 조회

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "shared-1",
    "planId": "plan-1",
    "ownerId": "user-1",
    "ownerName": "민수",
    "ownerEmoji": "🧑‍💻",
    "ownerGrade": "mid2",
    "schoolId": "school-1",
    "shareType": "public",
    "title": "소프트웨어 개발자 로드맵",
    "description": "...",
    "jobEmoji": "💻",
    "jobName": "소프트웨어 개발자",
    "starName": "기술의 별",
    "starEmoji": "💻",
    "starColor": "#3B82F6",
    "years": [ ... ],
    "likeCount": 12,
    "bookmarkCount": 5,
    "viewCount": 150,
    "commentCount": 4,
    "sharedAt": "2025-03-15T00:00:00Z",
    "updatedAt": "2026-03-08T02:00:00Z",
    "tags": ["SW", "코딩", "정보올림피아드"],
    "groupIds": ["group-1"],
    "isLiked": false,
    "isBookmarked": false
  }
}
```

#### POST `/shared-plans` - 커리어 패스 공유

**Request**:
```json
{
  "careerPlanId": "plan-1",
  "shareType": "public",
  "description": "중학교 시절부터 정보올림피아드, 해커톤, 포트폴리오까지 체계적으로 준비한 SW 개발자 진로 계획.",
  "groupIds": ["group-1"],
  "tags": ["SW", "코딩", "정보올림피아드"]
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "shared-1",
    "planId": "plan-1",
    ...
  }
}
```

#### PUT `/shared-plans/:id` - 공유 패스 수정

**Request**:
```json
{
  "shareType": "school",
  "description": "수정된 설명",
  "groupIds": ["group-1", "group-2"],
  "tags": ["SW", "코딩", "정보올림피아드", "해커톤"]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "shared-1",
    ...
  }
}
```

#### DELETE `/shared-plans/:id` - 공유 패스 삭제 (공유 취소)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Shared plan deleted successfully",
    "deletedId": "shared-1"
  }
}
```

---

### 5.7 반응 (Reactions)

#### POST `/shared-plans/:id/like` - 좋아요 토글

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "isLiked": true,
    "likeCount": 13
  }
}
```

#### POST `/shared-plans/:id/bookmark` - 북마크 토글

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "isBookmarked": true,
    "bookmarkCount": 6
  }
}
```

#### GET `/users/me/reactions` - 내 반응 목록 조회

**Query Parameters**:
- `type`: 반응 유형 (`like` | `bookmark`)
- `page`: 페이지 번호
- `limit`: 페이지당 항목 수

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "reactions": [
      {
        "id": "reaction-1",
        "targetType": "shared_plan",
        "targetId": "shared-1",
        "reactionType": "like",
        "createdAt": "2026-03-27T10:00:00Z",
        "sharedPlan": {
          "id": "shared-1",
          "title": "소프트웨어 개발자 로드맵",
          ...
        }
      }
    ],
    "pagination": { ... }
  }
}
```

---

### 5.8 댓글 (Comments)

#### GET `/shared-plans/:id/comments` - 댓글 목록 조회

**Query Parameters**:
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 50)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": "comment-1",
        "sharedPlanId": "shared-1",
        "authorId": "teacher-1",
        "authorName": "김진로 선생님",
        "authorEmoji": "👩‍🏫",
        "authorRole": "operator",
        "content": "민수야, 코딩 대회 참가 계획이 좋아! 정보올림피아드도 한번 알아보면 좋겠어요.",
        "createdAt": "2025-03-16T10:00:00Z",
        "replies": [
          {
            "id": "comment-1-1",
            "parentCommentId": "comment-1",
            "authorId": "user-1",
            "authorName": "민수",
            "authorEmoji": "👨‍💻",
            "authorRole": "peer",
            "content": "선생님 감사해요! 정보올림피아드 일정 찾아볼게요.",
            "createdAt": "2025-03-16T11:30:00Z",
            "replies": []
          }
        ]
      }
    ],
    "pagination": { ... }
  }
}
```

#### POST `/shared-plans/:id/comments` - 댓글 작성

**Request**:
```json
{
  "content": "정말 도움이 되는 로드맵이에요! 저도 참고할게요.",
  "parentCommentId": null
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "comment-5",
    "sharedPlanId": "shared-1",
    "authorId": "user-3",
    "authorName": "지현",
    "authorEmoji": "👩‍💻",
    "authorRole": "peer",
    "content": "정말 도움이 되는 로드맵이에요! 저도 참고할게요.",
    "createdAt": "2026-03-27T10:00:00Z"
  }
}
```

#### POST `/shared-plans/:id/comments/:commentId/reply` - 대댓글 작성

**Request**:
```json
{
  "content": "같이 공부해요!"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "comment-5-1",
    "parentCommentId": "comment-5",
    ...
  }
}
```

#### PUT `/comments/:id` - 댓글 수정

**Request**:
```json
{
  "content": "수정된 댓글 내용"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "comment-5",
    "content": "수정된 댓글 내용",
    "updatedAt": "2026-03-27T10:05:00Z"
  }
}
```

#### DELETE `/comments/:id` - 댓글 삭제

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Comment deleted successfully",
    "deletedId": "comment-5"
  }
}
```

---

### 5.9 신고 (Reports)

#### POST `/reports` - 신고 제출

**Request**:
```json
{
  "targetType": "shared_plan",
  "targetId": "shared-1",
  "reasonId": "spam",
  "reasonLabel": "스팸 또는 홍보성 콘텐츠",
  "detail": "반복적으로 동일한 내용을 게시하고 있습니다."
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "report-1",
    "targetType": "shared_plan",
    "targetId": "shared-1",
    "reasonId": "spam",
    "reasonLabel": "스팸 또는 홍보성 콘텐츠",
    "detail": "반복적으로 동일한 내용을 게시하고 있습니다.",
    "status": "pending",
    "reportedAt": "2026-03-27T10:00:00Z"
  }
}
```

#### GET `/reports` - 신고 목록 조회 (관리자 전용)

**Query Parameters**:
- `status`: 상태 필터 (`pending` | `reviewed` | `resolved` | `rejected`)
- `targetType`: 대상 유형 필터 (`shared_plan` | `comment`)
- `page`: 페이지 번호
- `limit`: 페이지당 항목 수

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "report-1",
        "reporterId": "user-5",
        "reporterName": "김신고",
        "targetType": "shared_plan",
        "targetId": "shared-1",
        "targetTitle": "소프트웨어 개발자 로드맵",
        "reasonId": "spam",
        "reasonLabel": "스팸 또는 홍보성 콘텐츠",
        "detail": "반복적으로 동일한 내용을 게시하고 있습니다.",
        "status": "pending",
        "reportedAt": "2026-03-27T10:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

#### PATCH `/reports/:id` - 신고 검토 (관리자 전용)

**Request**:
```json
{
  "status": "resolved",
  "resolutionNote": "해당 콘텐츠를 숨김 처리했습니다."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "report-1",
    "status": "resolved",
    "reviewedBy": "admin-1",
    "reviewedAt": "2026-03-27T10:30:00Z",
    "resolutionNote": "해당 콘텐츠를 숨김 처리했습니다."
  }
}
```

---

### 5.10 학교 (Schools)

#### GET `/schools` - 학교 목록 조회

**Query Parameters**:
- `search`: 학교 이름 검색
- `region`: 지역 필터
- `schoolType`: 학교 유형 필터 (`elementary` | `middle` | `high`)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "schools": [
      {
        "id": "school-1",
        "name": "서울 미래중학교",
        "code": "FUTURE2024",
        "operatorId": "teacher-1",
        "operatorName": "김진로",
        "operatorEmoji": "👩‍🏫",
        "grades": ["mid1", "mid2", "mid3"],
        "memberCount": 87,
        "description": "서울 강남구 소재, 진로 탐색 프로그램 우수 학교",
        "region": "서울특별시 강남구",
        "schoolType": "middle",
        "createdAt": "2025-03-01T00:00:00Z"
      }
    ]
  }
}
```

#### GET `/schools/:id` - 학교 상세 조회

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "school-1",
    "name": "서울 미래중학교",
    "code": "FUTURE2024",
    "operatorId": "teacher-1",
    "operatorName": "김진로",
    "operatorEmoji": "👩‍🏫",
    "grades": ["mid1", "mid2", "mid3"],
    "memberCount": 87,
    "description": "서울 강남구 소재, 진로 탐색 프로그램 우수 학교",
    "region": "서울특별시 강남구",
    "schoolType": "middle",
    "createdAt": "2025-03-01T00:00:00Z",
    "updatedAt": "2025-04-21T18:30:00Z"
  }
}
```

#### POST `/schools/join` - 학교 가입

**Request**:
```json
{
  "code": "FUTURE2024"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "school": {
      "id": "school-1",
      "name": "서울 미래중학교",
      ...
    },
    "message": "Successfully joined school"
  }
}
```

#### POST `/schools` - 학교 생성 (선생님 전용)

**Request**:
```json
{
  "name": "서울 미래중학교",
  "code": "FUTURE2024",
  "grades": ["mid1", "mid2", "mid3"],
  "description": "서울 강남구 소재, 진로 탐색 프로그램 우수 학교",
  "region": "서울특별시 강남구",
  "schoolType": "middle"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "school-1",
    "name": "서울 미래중학교",
    ...
  }
}
```

---

### 5.11 그룹 (Groups)

#### GET `/groups` - 내 그룹 목록 조회

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "groups": [
      {
        "id": "group-1",
        "name": "IT 개발자 꿈나무들",
        "emoji": "💻",
        "description": "프로그래밍과 IT에 관심 있는 친구들 모임. 코딩 대회, 해커톤, 프로젝트 함께해요.",
        "color": "#3B82F6",
        "creatorId": "user-1",
        "creatorName": "민수",
        "memberCount": 5,
        "sharedPlanCount": 4,
        "inviteCode": "GRP-IT-001",
        "tags": ["코딩", "IT", "개발", "AI"],
        "myRole": "creator",
        "createdAt": "2025-03-01T00:00:00Z",
        "updatedAt": "2025-04-28T12:00:00Z"
      }
    ]
  }
}
```

#### GET `/groups/:id` - 그룹 상세 조회

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "group-1",
    "name": "IT 개발자 꿈나무들",
    "emoji": "💻",
    "description": "프로그래밍과 IT에 관심 있는 친구들 모임. 코딩 대회, 해커톤, 프로젝트 함께해요.",
    "color": "#3B82F6",
    "creatorId": "user-1",
    "creatorName": "민수",
    "memberCount": 5,
    "sharedPlanCount": 4,
    "inviteCode": "GRP-IT-001",
    "tags": ["코딩", "IT", "개발", "AI"],
    "members": [
      {
        "id": "user-1",
        "name": "민수",
        "emoji": "🧑‍💻",
        "grade": "mid2",
        "role": "creator",
        "joinedAt": "2025-03-01T00:00:00Z"
      },
      {
        "id": "user-2",
        "name": "지현",
        "emoji": "👩‍💻",
        "grade": "mid2",
        "role": "member",
        "joinedAt": "2025-03-02T00:00:00Z"
      }
    ],
    "myRole": "creator",
    "createdAt": "2025-03-01T00:00:00Z",
    "updatedAt": "2025-04-28T12:00:00Z"
  }
}
```

#### POST `/groups` - 그룹 생성

**Request**:
```json
{
  "name": "IT 개발자 꿈나무들",
  "emoji": "💻",
  "description": "프로그래밍과 IT에 관심 있는 친구들 모임. 코딩 대회, 해커톤, 프로젝트 함께해요.",
  "color": "#3B82F6",
  "tags": ["코딩", "IT", "개발", "AI"]
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "group-1",
    "name": "IT 개발자 꿈나무들",
    "inviteCode": "GRP-IT-001",
    ...
  }
}
```

#### POST `/groups/join` - 그룹 가입

**Request**:
```json
{
  "inviteCode": "GRP-IT-001"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "group": {
      "id": "group-1",
      "name": "IT 개발자 꿈나무들",
      ...
    },
    "message": "Successfully joined group"
  }
}
```

#### PUT `/groups/:id` - 그룹 수정 (생성자 전용)

**Request**:
```json
{
  "name": "IT 개발자 꿈나무들 (수정)",
  "description": "수정된 설명",
  "tags": ["코딩", "IT", "개발", "AI", "해커톤"]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "group-1",
    "name": "IT 개발자 꿈나무들 (수정)",
    ...
  }
}
```

#### DELETE `/groups/:id` - 그룹 삭제 (생성자 전용)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Group deleted successfully",
    "deletedId": "group-1"
  }
}
```

#### POST `/groups/:id/leave` - 그룹 탈퇴

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Successfully left the group"
  }
}
```

#### DELETE `/groups/:id/members/:userId` - 그룹 멤버 추방 (생성자 전용)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Member removed successfully",
    "removedUserId": "user-3"
  }
}
```

---

### 5.12 알림 (Notifications)

#### GET `/notifications` - 알림 목록 조회

**Query Parameters**:
- `isRead`: 읽음 여부 필터 (`true` | `false`)
- `page`: 페이지 번호
- `limit`: 페이지당 항목 수

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif-1",
        "type": "comment",
        "title": "새 댓글이 달렸어요",
        "message": "김진로 선생님이 '소프트웨어 개발자 로드맵'에 댓글을 남겼습니다.",
        "linkUrl": "/career?tab=community&sharedPlanId=shared-1",
        "isRead": false,
        "createdAt": "2026-03-27T10:00:00Z"
      }
    ],
    "pagination": { ... },
    "unreadCount": 3
  }
}
```

#### PATCH `/notifications/:id/read` - 알림 읽음 처리

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "notif-1",
    "isRead": true
  }
}
```

#### PATCH `/notifications/read-all` - 모든 알림 읽음 처리

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "All notifications marked as read",
    "count": 3
  }
}
```

---

## 6. 기능별 상세 설계

### 6.1 템플릿 커리어 패스

#### 6.1.1 개요

- 직업별 사전 정의된 로드맵 제공
- 사용자는 템플릿을 복사하여 자신의 커리어 패스로 생성
- 템플릿은 관리자가 생성·수정 (일반 사용자는 읽기 전용)

#### 6.1.2 데이터 구조

템플릿은 `career_plans` 테이블에서 `is_template = true`로 관리합니다.

```sql
-- 템플릿 조회 쿼리 예시
SELECT * FROM career_plans
WHERE is_template = TRUE
  AND job_id = 'doctor'
ORDER BY created_at DESC;
```

#### 6.1.3 비즈니스 로직

**템플릿 복사 프로세스**:

1. 사용자가 템플릿 선택 (`GET /templates/:id`)
2. "이 템플릿 사용하기" 클릭 (`POST /templates/:id/use`)
3. 백엔드에서 템플릿 데이터 복사:
   - `career_plans` 테이블에 새 레코드 생성 (`is_template = false`, `user_id = 현재 사용자`)
   - `plan_years`, `goal_groups`, `plan_items`, `sub_items` 모두 복사
4. 생성된 커리어 패스 ID 반환
5. 프론트엔드에서 `/career?tab=timeline` 페이지로 이동

**코드 예시 (Node.js + Prisma)**:

```typescript
async function useTemplate(templateId: string, userId: string, customTitle?: string) {
  const template = await prisma.careerPlan.findUnique({
    where: { id: templateId, isTemplate: true },
    include: {
      years: {
        include: {
          goalGroups: {
            include: {
              items: {
                include: {
                  subItems: true,
                  links: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!template) {
    throw new Error('Template not found');
  }

  // 트랜잭션으로 전체 복사
  const newPlan = await prisma.$transaction(async (tx) => {
    // 1. CareerPlan 복사
    const plan = await tx.careerPlan.create({
      data: {
        userId,
        title: customTitle || template.title,
        jobId: template.jobId,
        jobName: template.jobName,
        jobEmoji: template.jobEmoji,
        starId: template.starId,
        starName: template.starName,
        starEmoji: template.starEmoji,
        starColor: template.starColor,
        description: template.description,
        isTemplate: false,
      },
    });

    // 2. PlanYears 복사
    for (const year of template.years) {
      const newYear = await tx.planYear.create({
        data: {
          careerPlanId: plan.id,
          gradeId: year.gradeId,
          gradeLabel: year.gradeLabel,
          sortOrder: year.sortOrder,
        },
      });

      // 3. GoalGroups 복사
      for (const group of year.goalGroups) {
        const newGroup = await tx.goalGroup.create({
          data: {
            planYearId: newYear.id,
            goal: group.goal,
            sortOrder: group.sortOrder,
          },
        });

        // 4. PlanItems 복사
        for (const item of group.items) {
          const newItem = await tx.planItem.create({
            data: {
              planYearId: newYear.id,
              goalGroupId: newGroup.id,
              type: item.type,
              title: item.title,
              month: item.month,
              difficulty: item.difficulty,
              cost: item.cost,
              organizer: item.organizer,
              url: item.url,
              description: item.description,
              activitySubtype: item.activitySubtype,
              categoryTags: item.categoryTags,
              sortOrder: item.sortOrder,
            },
          });

          // 5. SubItems 복사
          for (const subItem of item.subItems) {
            await tx.subItem.create({
              data: {
                planItemId: newItem.id,
                title: subItem.title,
                description: subItem.description,
                url: subItem.url,
                isDone: false, // 초기화
                sortOrder: subItem.sortOrder,
              },
            });
          }

          // 6. Links 복사
          for (const link of item.links) {
            await tx.itemLink.create({
              data: {
                planItemId: newItem.id,
                title: link.title,
                url: link.url,
                kind: link.kind,
                sortOrder: link.sortOrder,
              },
            });
          }
        }
      }
    }

    return plan;
  });

  return newPlan;
}
```

---

### 6.2 커리어 패스 CRUD

#### 6.2.1 생성 (Create)

**프로세스**:

1. 사용자가 "새 커리어 패스 만들기" 클릭
2. 빌더 다이얼로그 열림 (직업 선택 → 학년 선택 → 활동 추가)
3. 완료 후 `POST /career-plans` 호출
4. 백엔드에서 트랜잭션으로 전체 데이터 저장
5. 생성된 커리어 패스 ID 반환

**검증 규칙**:

- `title`: 필수, 1~200자
- `jobId`, `starId`: 필수
- `years`: 최소 1개 이상
- `goalGroups`: 각 학년당 최소 1개 이상
- `items`: 각 목표 그룹당 최소 1개 이상
- `month`: 1~12 범위
- `difficulty`: 1~5 범위

#### 6.2.2 조회 (Read)

**목록 조회**:

- 페이지네이션 적용 (기본 20개)
- 필터: `jobId`, `starId`
- 정렬: `createdAt DESC` (최신순)

**상세 조회**:

- `career_plans` + `plan_years` + `goal_groups` + `plan_items` + `sub_items` + `item_links` 모두 JOIN
- 계층 구조로 반환

**성능 최적화**:

- Redis 캐싱 (TTL: 5분)
- 캐시 키: `career_plan:{planId}`
- 수정 시 캐시 무효화

#### 6.2.3 수정 (Update)

**프로세스**:

1. 사용자가 커리어 패스 편집 클릭
2. 빌더 다이얼로그 열림 (기존 데이터 로드)
3. 수정 후 `PUT /career-plans/:id` 호출
4. 백엔드에서 전체 데이터 교체 (삭제 후 재생성)
5. `updated_at` 갱신

**권한 검증**:

- 본인의 커리어 패스만 수정 가능
- `user_id = 현재 사용자 ID` 확인

#### 6.2.4 삭제 (Delete)

**프로세스**:

1. 사용자가 삭제 확인
2. `DELETE /career-plans/:id` 호출
3. 백엔드에서 CASCADE 삭제:
   - `career_plans` 삭제 시 `plan_years`, `goal_groups`, `plan_items`, `sub_items`, `item_links` 자동 삭제
   - `shared_plans`도 함께 삭제 (공유 취소)

**권한 검증**:

- 본인의 커리어 패스만 삭제 가능

---

### 6.3 커뮤니티 (학교·그룹)

#### 6.3.1 학교 (Schools)

**학교 생성 (선생님 전용)**:

- 선생님이 학교 코드 생성 (예: `FUTURE2024`)
- 학생들은 이 코드로 학교 가입

**학교 가입**:

1. 학생이 학교 코드 입력 (`POST /schools/join`)
2. 백엔드에서 학교 존재 여부 확인
3. `users.school_id` 업데이트
4. `schools.member_count` 증가

**학교 공간**:

- 같은 학교에 속한 학생들의 공유 패스 조회
- 필터: `schoolId = 현재 사용자의 school_id`

#### 6.3.2 그룹 (Groups)

**그룹 생성**:

1. 사용자가 그룹 이름·설명·이모지·색상 입력
2. `POST /groups` 호출
3. 백엔드에서 초대 코드 자동 생성 (예: `GRP-IT-001`)
4. `group_members` 테이블에 생성자 추가 (`role = 'creator'`)

**그룹 가입**:

1. 사용자가 초대 코드 입력 (`POST /groups/join`)
2. 백엔드에서 그룹 존재 여부 확인
3. `group_members` 테이블에 추가 (`role = 'member'`)
4. `groups.member_count` 증가

**그룹 관리**:

- 생성자(`creator`)는 그룹 수정·삭제·멤버 추방 가능
- 일반 멤버(`member`)는 그룹 탈퇴만 가능

**그룹 탈퇴**:

1. 사용자가 탈퇴 확인
2. `POST /groups/:id/leave` 호출
3. `group_members`에서 해당 레코드 삭제
4. `groups.member_count` 감소

**그룹 삭제 (생성자 전용)**:

1. 생성자가 삭제 확인
2. `DELETE /groups/:id` 호출
3. `group_members` 모두 삭제 (CASCADE)
4. `shared_plan_groups` 모두 삭제 (CASCADE)

---

### 6.4 댓글 시스템

#### 6.4.1 댓글 구조

- **최상위 댓글**: `parent_comment_id = NULL`
- **대댓글**: `parent_comment_id = {부모 댓글 ID}`
- 최대 깊이: 2단계 (댓글 → 대댓글)

#### 6.4.2 댓글 작성

**프로세스**:

1. 사용자가 댓글 입력 후 "댓글 달기" 클릭
2. `POST /shared-plans/:id/comments` 호출
3. 백엔드에서 댓글 저장
4. `shared_plans.comment_count` 증가
5. 커리어 패스 소유자에게 알림 발송 (Notification)

**대댓글 작성**:

1. 사용자가 "답글 달기" 클릭
2. `POST /shared-plans/:id/comments/:commentId/reply` 호출
3. `parent_comment_id` 설정하여 저장
4. 부모 댓글 작성자에게 알림 발송

#### 6.4.3 댓글 조회

**트리 구조 변환**:

```typescript
function buildCommentTree(comments: Comment[]): CommentNode[] {
  const commentMap = new Map<string, CommentNode>();
  const rootComments: CommentNode[] = [];

  // 1. 모든 댓글을 Map에 저장
  comments.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // 2. 부모-자식 관계 설정
  comments.forEach((comment) => {
    const node = commentMap.get(comment.id)!;
    if (comment.parentCommentId) {
      const parent = commentMap.get(comment.parentCommentId);
      if (parent) {
        parent.replies.push(node);
      }
    } else {
      rootComments.push(node);
    }
  });

  return rootComments;
}
```

#### 6.4.4 댓글 수정·삭제

**수정**:

- 본인의 댓글만 수정 가능
- `PUT /comments/:id` 호출
- `updated_at` 갱신

**삭제**:

- 본인의 댓글만 삭제 가능
- `DELETE /comments/:id` 호출
- 대댓글이 있는 경우:
  - **Soft Delete**: `is_hidden = true` 설정, 내용을 "삭제된 댓글입니다"로 변경
  - **Hard Delete**: 대댓글이 없으면 완전 삭제

#### 6.4.5 운영자 댓글 (Operator Comments)

- 선생님(`role = 'teacher'`)이 작성한 댓글은 `author_role = 'operator'`로 표시
- 프론트엔드에서 특별한 스타일 적용 (배경색·아이콘 등)

---

### 6.5 신고 시스템

#### 6.5.1 신고 대상

- **공유 패스 (shared_plan)**: 부적절한 콘텐츠·스팸·저작권 침해 등
- **댓글 (comment)**: 욕설·비방·스팸 등

#### 6.5.2 신고 사유

`/frontend/data/report-reasons.json` 참고:

```json
{
  "content": [
    { "id": "spam", "label": "스팸 또는 홍보성 콘텐츠" },
    { "id": "inappropriate", "label": "부적절한 내용" },
    { "id": "copyright", "label": "저작권 침해" },
    { "id": "misleading", "label": "허위 정보" },
    { "id": "other", "label": "기타" }
  ],
  "comment": [
    { "id": "abuse", "label": "욕설 또는 비방" },
    { "id": "spam", "label": "스팸" },
    { "id": "inappropriate", "label": "부적절한 내용" },
    { "id": "other", "label": "기타" }
  ]
}
```

#### 6.5.3 신고 프로세스

**사용자 신고**:

1. 사용자가 "신고하기" 클릭
2. 신고 사유 선택 + 상세 설명 입력
3. `POST /reports` 호출
4. 백엔드에서 신고 저장 (`status = 'pending'`)
5. 관리자에게 알림 발송

**관리자 검토**:

1. 관리자가 신고 목록 조회 (`GET /reports?status=pending`)
2. 신고 내용 확인 후 조치 결정:
   - **Resolved**: 콘텐츠 숨김 처리 (`is_hidden = true`)
   - **Rejected**: 신고 기각
3. `PATCH /reports/:id` 호출 (상태 업데이트)
4. 신고자에게 결과 알림 발송

#### 6.5.4 자동 숨김 처리

- 동일 콘텐츠에 대한 신고가 **5건 이상** 누적 시 자동 숨김
- 관리자 검토 전까지 일시적으로 숨김 처리

```sql
-- 신고 건수 집계
SELECT target_id, COUNT(*) as report_count
FROM reports
WHERE target_type = 'shared_plan'
  AND status = 'pending'
GROUP BY target_id
HAVING COUNT(*) >= 5;

-- 자동 숨김 처리
UPDATE shared_plans
SET is_hidden = TRUE
WHERE id IN (
  SELECT target_id FROM reports
  WHERE target_type = 'shared_plan'
    AND status = 'pending'
  GROUP BY target_id
  HAVING COUNT(*) >= 5
);
```

---

### 6.6 공유 시스템

#### 6.6.1 공유 유형 (Share Type)

- **전체 공유 (public)**: 모든 사용자가 조회 가능
- **학교 공유 (school)**: 같은 학교 학생만 조회 가능
- **그룹 공유 (group)**: 특정 그룹 멤버만 조회 가능

#### 6.6.2 공유 프로세스

**공유 설정**:

1. 사용자가 커리어 패스 선택 후 "공유하기" 클릭
2. 공유 설정 다이얼로그 열림:
   - 공유 설명 입력 (선택)
   - 공유 범위 선택 (전체·학교·그룹)
   - 그룹 선택 (그룹 공유 시)
   - 태그 입력 (선택)
3. `POST /shared-plans` 호출
4. 백엔드에서 `shared_plans` 레코드 생성
5. 그룹 공유 시 `shared_plan_groups` 레코드 생성

**공유 수정**:

1. 사용자가 "공유 설정 변경" 클릭
2. `PUT /shared-plans/:id` 호출
3. 공유 범위·그룹·태그 업데이트
4. `updated_at` 갱신

**공유 취소**:

1. 사용자가 "공유 취소" 클릭
2. `DELETE /shared-plans/:id` 호출
3. `shared_plans` 레코드 삭제
4. `shared_plan_groups` 레코드 삭제 (CASCADE)

#### 6.6.3 공유 패스 조회 권한

**전체 공유 (public)**:

- 모든 로그인 사용자가 조회 가능

**학교 공유 (school)**:

- 같은 학교에 속한 학생만 조회 가능
- 쿼리 조건: `schoolId = 현재 사용자의 school_id`

**그룹 공유 (group)**:

- 해당 그룹 멤버만 조회 가능
- 쿼리 조건:
  ```sql
  SELECT sp.*
  FROM shared_plans sp
  JOIN shared_plan_groups spg ON sp.id = spg.shared_plan_id
  JOIN group_members gm ON spg.group_id = gm.group_id
  WHERE gm.user_id = {현재 사용자 ID}
    AND sp.share_type = 'group';
  ```

#### 6.6.4 멀티 공유 (Multi-Share)

프론트엔드 분석 결과, **하나의 커리어 패스를 여러 그룹에 동시 공유** 가능합니다.

**구현 방법**:

- `shared_plan_groups` 테이블에 여러 레코드 생성
- 예: `shared_plan_id = 'shared-1'`, `group_id = 'group-1'` / `group_id = 'group-2'`

**조회 쿼리**:

```sql
-- 특정 그룹의 공유 패스 조회
SELECT sp.*
FROM shared_plans sp
JOIN shared_plan_groups spg ON sp.id = spg.shared_plan_id
WHERE spg.group_id = 'group-1';

-- 사용자가 속한 모든 그룹의 공유 패스 조회
SELECT DISTINCT sp.*
FROM shared_plans sp
JOIN shared_plan_groups spg ON sp.id = spg.shared_plan_id
JOIN group_members gm ON spg.group_id = gm.group_id
WHERE gm.user_id = {현재 사용자 ID};
```

---

## 7. 보안 및 권한 관리

### 7.1 인증 (Authentication)

#### 7.1.1 JWT 토큰 기반 인증

**Access Token**:

- 유효 기간: 1시간
- Payload:
  ```json
  {
    "userId": "uuid-1234",
    "email": "student@example.com",
    "role": "student",
    "iat": 1711526400,
    "exp": 1711530000
  }
  ```

**Refresh Token**:

- 유효 기간: 7일
- Redis에 저장 (키: `refresh_token:{userId}`, 값: `{refreshToken}`)
- 로그아웃 시 Redis에서 삭제

#### 7.1.2 비밀번호 보안

- **해싱 알고리즘**: bcrypt (cost factor: 12)
- **최소 요구사항**: 8자 이상, 영문·숫자·특수문자 조합
- **비밀번호 재설정**: 이메일 인증 링크 (유효 기간: 1시간)

### 7.2 권한 관리 (Authorization)

#### 7.2.1 역할 기반 접근 제어 (RBAC)

**역할 (Roles)**:

- **student**: 일반 학생
- **teacher**: 선생님 (학교 운영자)
- **admin**: 시스템 관리자

**권한 매트릭스**:

| 기능 | student | teacher | admin |
|------|---------|---------|-------|
| 커리어 패스 CRUD (본인) | ✅ | ✅ | ✅ |
| 커리어 패스 공유 | ✅ | ✅ | ✅ |
| 댓글 작성·수정·삭제 (본인) | ✅ | ✅ | ✅ |
| 좋아요·북마크 | ✅ | ✅ | ✅ |
| 신고 제출 | ✅ | ✅ | ✅ |
| 그룹 생성·가입 | ✅ | ✅ | ✅ |
| 학교 생성 | ❌ | ✅ | ✅ |
| 학교 가입 | ✅ | ✅ | ✅ |
| 신고 검토 | ❌ | ❌ | ✅ |
| 사용자 관리 | ❌ | ❌ | ✅ |
| 템플릿 생성·수정 | ❌ | ❌ | ✅ |

#### 7.2.2 리소스 소유권 검증

**미들웨어 예시 (Node.js + Express)**:

```typescript
async function checkCareerPlanOwnership(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params;
  const userId = req.user.id; // JWT에서 추출

  const plan = await prisma.careerPlan.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!plan) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Career plan not found' } });
  }

  if (plan.userId !== userId && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You do not have permission to access this resource' } });
  }

  next();
}

// 라우터에서 사용
router.put('/career-plans/:id', authenticate, checkCareerPlanOwnership, updateCareerPlan);
```

### 7.3 데이터 보호

#### 7.3.1 SQL Injection 방지

- **ORM 사용**: Prisma / SQLAlchemy (파라미터화된 쿼리 자동 생성)
- **직접 쿼리 금지**: Raw SQL 사용 시 반드시 파라미터 바인딩

#### 7.3.2 XSS (Cross-Site Scripting) 방지

- **입력 검증**: 모든 사용자 입력 검증 (길이·형식·특수문자)
- **출력 이스케이프**: HTML 렌더링 시 자동 이스케이프 (React는 기본 제공)
- **CSP (Content Security Policy)**: HTTP 헤더 설정

#### 7.3.3 CSRF (Cross-Site Request Forgery) 방지

- **SameSite Cookie**: `SameSite=Strict` 설정
- **CSRF Token**: 상태 변경 요청(POST·PUT·DELETE)에 토큰 검증

#### 7.3.4 Rate Limiting

**API 호출 제한**:

- **인증 API**: 5회/분 (로그인·회원가입)
- **일반 API**: 100회/분
- **공유 패스 조회**: 200회/분
- **댓글 작성**: 10회/분

**구현 (Express + express-rate-limit)**:

```typescript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 5,
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests, please try again later' } },
});

router.post('/auth/login', authLimiter, login);
```

---

## 8. 성능 최적화 전략

### 8.1 데이터베이스 최적화

#### 8.1.1 인덱스 전략

**주요 인덱스**:

```sql
-- 사용자 조회
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_school_id ON users(school_id);

-- 커리어 패스 조회
CREATE INDEX idx_career_plans_user_id ON career_plans(user_id);
CREATE INDEX idx_career_plans_job_id ON career_plans(job_id);
CREATE INDEX idx_career_plans_is_template ON career_plans(is_template);

-- 공유 패스 조회
CREATE INDEX idx_shared_plans_user_id ON shared_plans(user_id);
CREATE INDEX idx_shared_plans_school_id ON shared_plans(school_id);
CREATE INDEX idx_shared_plans_share_type ON shared_plans(share_type);
CREATE INDEX idx_shared_plans_shared_at ON shared_plans(shared_at DESC);
CREATE INDEX idx_shared_plans_like_count ON shared_plans(like_count DESC);
CREATE INDEX idx_shared_plans_tags ON shared_plans(tags) USING GIN; -- 배열 인덱스

-- 댓글 조회
CREATE INDEX idx_comments_shared_plan_id ON comments(shared_plan_id);
CREATE INDEX idx_comments_parent_comment_id ON comments(parent_comment_id);

-- 반응 조회
CREATE INDEX idx_reactions_user_id ON reactions(user_id);
CREATE INDEX idx_reactions_target ON reactions(target_type, target_id);
```

#### 8.1.2 쿼리 최적화

**N+1 문제 해결**:

- **Eager Loading**: 연관 데이터 한 번에 조회
- **DataLoader**: GraphQL 사용 시 배치 로딩

**예시 (Prisma)**:

```typescript
// ❌ N+1 문제 발생
const plans = await prisma.careerPlan.findMany();
for (const plan of plans) {
  const years = await prisma.planYear.findMany({ where: { careerPlanId: plan.id } }); // N번 쿼리
}

// ✅ Eager Loading
const plans = await prisma.careerPlan.findMany({
  include: {
    years: {
      include: {
        goalGroups: {
          include: {
            items: {
              include: {
                subItems: true,
                links: true,
              },
            },
          },
        },
      },
    },
  },
});
```

#### 8.1.3 페이지네이션

**Offset-based Pagination**:

```sql
SELECT * FROM shared_plans
WHERE share_type = 'public'
ORDER BY shared_at DESC
LIMIT 20 OFFSET 40; -- 3페이지 (page=3, limit=20)
```

**Cursor-based Pagination** (대용량 데이터):

```sql
SELECT * FROM shared_plans
WHERE share_type = 'public'
  AND shared_at < '2026-03-27T10:00:00Z' -- 이전 페이지 마지막 항목의 shared_at
ORDER BY shared_at DESC
LIMIT 20;
```

### 8.2 캐싱 전략

#### 8.2.1 Redis 캐싱

**캐시 대상**:

- **커리어 패스 상세**: `career_plan:{planId}` (TTL: 5분)
- **공유 패스 목록**: `shared_plans:public:page:{page}` (TTL: 1분)
- **학교 정보**: `school:{schoolId}` (TTL: 10분)
- **그룹 정보**: `group:{groupId}` (TTL: 10분)
- **사용자 프로필**: `user:{userId}` (TTL: 5분)

**캐시 무효화**:

- 데이터 수정 시 해당 캐시 삭제
- 예: 커리어 패스 수정 → `DEL career_plan:{planId}`

**구현 예시 (Node.js + ioredis)**:

```typescript
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

async function getCareerPlanWithCache(planId: string) {
  const cacheKey = `career_plan:${planId}`;

  // 1. 캐시 조회
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // 2. DB 조회
  const plan = await prisma.careerPlan.findUnique({
    where: { id: planId },
    include: { /* ... */ },
  });

  if (!plan) {
    throw new Error('Career plan not found');
  }

  // 3. 캐시 저장 (TTL: 5분)
  await redis.setex(cacheKey, 300, JSON.stringify(plan));

  return plan;
}

async function invalidateCareerPlanCache(planId: string) {
  await redis.del(`career_plan:${planId}`);
}
```

#### 8.2.2 CDN 캐싱

**정적 리소스**:

- 프로필 이미지
- 포트폴리오 파일 (PDF·이미지 등)

**CDN 설정**:

- CloudFlare / AWS CloudFront
- Cache-Control 헤더: `public, max-age=31536000` (1년)

### 8.3 API 응답 최적화

#### 8.3.1 필드 선택 (Field Selection)

**GraphQL 스타일 필드 선택**:

```
GET /career-plans/:id?fields=id,title,jobName,yearCount
```

**응답**:

```json
{
  "id": "uuid-1",
  "title": "소프트웨어 개발자 로드맵",
  "jobName": "소프트웨어 개발자",
  "yearCount": 3
}
```

#### 8.3.2 응답 압축

**Gzip / Brotli 압축**:

- Express: `compression` 미들웨어
- Nginx: `gzip on;`

```typescript
import compression from 'compression';

app.use(compression());
```

#### 8.3.3 부분 응답 (Partial Response)

**목록 조회 시 요약 정보만 반환**:

```json
{
  "plans": [
    {
      "id": "uuid-1",
      "title": "소프트웨어 개발자 로드맵",
      "jobName": "소프트웨어 개발자",
      "yearCount": 3,
      "itemCount": 12
      // years 필드 제외 (상세 조회 시에만 포함)
    }
  ]
}
```

---

## 9. 배포 및 확장성

### 9.1 Docker 컨테이너화

#### 9.1.1 Dockerfile

```dockerfile
# Node.js 백엔드 예시
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

#### 9.1.2 Docker Compose

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:password@postgres:5432/careerpath
      - REDIS_HOST=redis
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=careerpath
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 9.2 수평 확장 (Horizontal Scaling)

#### 9.2.1 로드 밸런서

**Nginx 설정**:

```nginx
upstream api_backend {
  server api1:3000;
  server api2:3000;
  server api3:3000;
}

server {
  listen 80;
  server_name api.aicareerpath.com;

  location / {
    proxy_pass http://api_backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

#### 9.2.2 세션 관리

**Redis 기반 세션 저장**:

- 여러 API 서버가 동일한 Redis 인스턴스 공유
- Refresh Token을 Redis에 저장하여 로그아웃 처리

### 9.3 데이터베이스 확장

#### 9.3.1 읽기 복제본 (Read Replica)

**Master-Slave 구조**:

- **Master**: 쓰기 작업 (INSERT·UPDATE·DELETE)
- **Slave**: 읽기 작업 (SELECT)

**Prisma 설정**:

```typescript
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // Master
    },
  },
});

const prismaReadReplica = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_READ_REPLICA_URL, // Slave
    },
  },
});

// 읽기 전용 쿼리
const plans = await prismaReadReplica.careerPlan.findMany();

// 쓰기 쿼리
await prisma.careerPlan.create({ data: { ... } });
```

#### 9.3.2 샤딩 (Sharding)

**사용자 ID 기반 샤딩**:

- Shard 1: `user_id` 해시값 % 4 = 0
- Shard 2: `user_id` 해시값 % 4 = 1
- Shard 3: `user_id` 해시값 % 4 = 2
- Shard 4: `user_id` 해시값 % 4 = 3

**주의사항**:

- 샤딩은 복잡도가 높으므로 트래픽이 매우 많을 때만 고려
- 초기에는 수직 확장 (CPU·메모리 증설) 권장

### 9.4 모니터링 및 로깅

#### 9.4.1 APM (Application Performance Monitoring)

**DataDog / New Relic**:

- API 응답 시간 추적
- 느린 쿼리 탐지
- 에러율 모니터링

#### 9.4.2 에러 추적

**Sentry**:

- 백엔드 에러 자동 수집
- 스택 트레이스 분석
- 알림 설정 (Slack·이메일)

#### 9.4.3 로그 관리

**Winston (Node.js) / Loguru (Python)**:

- 구조화된 로그 (JSON 형식)
- 로그 레벨: `error` > `warn` > `info` > `debug`
- 로그 집계: ELK Stack (Elasticsearch + Logstash + Kibana)

**로그 예시**:

```json
{
  "level": "info",
  "timestamp": "2026-03-27T10:00:00Z",
  "userId": "uuid-1234",
  "method": "POST",
  "path": "/career-plans",
  "statusCode": 201,
  "responseTime": 123,
  "message": "Career plan created successfully"
}
```

---

## 10. 부록

### 10.1 환경 변수 (.env)

```bash
# 데이터베이스
DATABASE_URL=postgresql://user:password@localhost:5432/careerpath
DATABASE_READ_REPLICA_URL=postgresql://user:password@replica:5432/careerpath

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=careerpath-files
AWS_REGION=ap-northeast-2

# 이메일 (SendGrid / AWS SES)
EMAIL_FROM=noreply@aicareerpath.com
SENDGRID_API_KEY=your-sendgrid-api-key

# Sentry
SENTRY_DSN=https://xxx@sentry.io/xxx

# 기타
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://aicareerpath.com
```

### 10.2 API 에러 코드

| 코드 | HTTP 상태 | 설명 |
|------|-----------|------|
| `VALIDATION_ERROR` | 400 | 입력 데이터 검증 실패 |
| `UNAUTHORIZED` | 401 | 인증 실패 (토큰 없음·만료) |
| `FORBIDDEN` | 403 | 권한 없음 |
| `NOT_FOUND` | 404 | 리소스 없음 |
| `CONFLICT` | 409 | 중복 데이터 (예: 이메일 중복) |
| `RATE_LIMIT_EXCEEDED` | 429 | API 호출 제한 초과 |
| `INTERNAL_SERVER_ERROR` | 500 | 서버 내부 오류 |
| `SERVICE_UNAVAILABLE` | 503 | 서비스 일시 중단 |

### 10.3 마이그레이션 전략

**Prisma Migrate**:

```bash
# 마이그레이션 생성
npx prisma migrate dev --name add_sub_items_table

# 프로덕션 배포
npx prisma migrate deploy
```

**롤백 전략**:

- 마이그레이션 파일 버전 관리 (Git)
- 롤백 스크립트 작성 (DOWN 마이그레이션)

### 10.4 테스트 전략

**단위 테스트 (Unit Test)**:

- 비즈니스 로직 함수 테스트
- Jest / Vitest

**통합 테스트 (Integration Test)**:

- API 엔드포인트 테스트
- Supertest (Node.js) / pytest (Python)

**E2E 테스트**:

- 프론트엔드 + 백엔드 통합 테스트
- Playwright / Cypress

**테스트 커버리지 목표**: 80% 이상

---

## 11. 결론

본 문서는 AI CareerPath의 **커리어 패스 기능**에 대한 백엔드 및 데이터베이스 설계를 상세히 다루었습니다.

### 11.1 핵심 요약

1. **6가지 핵심 기능**:
   - 템플릿 커리어 패스
   - 커리어 패스 CRUD
   - 커뮤니티 (학교·그룹)
   - 댓글 시스템
   - 신고 시스템
   - 공유 시스템

2. **데이터베이스 설계**:
   - PostgreSQL 16개 테이블
   - 정규화된 구조 (3NF)
   - 인덱스 최적화

3. **API 설계**:
   - RESTful API (60+ 엔드포인트)
   - JWT 인증
   - RBAC 권한 관리

4. **성능 최적화**:
   - Redis 캐싱
   - 데이터베이스 인덱스
   - 페이지네이션

5. **보안**:
   - SQL Injection 방지
   - XSS·CSRF 방지
   - Rate Limiting

### 11.2 다음 단계

1. **Phase 1 (MVP)**:
   - 커리어 패스 CRUD 구현
   - 템플릿 시스템 구현
   - 기본 공유 기능 (전체 공유)

2. **Phase 2 (커뮤니티)**:
   - 학교·그룹 기능 구현
   - 댓글 시스템 구현
   - 좋아요·북마크 기능

3. **Phase 3 (고도화)**:
   - 신고 시스템 구현
   - 알림 시스템 구현
   - 실시간 기능 (WebSocket)

4. **Phase 4 (확장)**:
   - 마이크로서비스 분리
   - 수평 확장
   - 글로벌 배포 (CDN)

---

**문서 버전**: 1.0.0  
**최종 수정일**: 2026-03-27  
**작성자**: AI Assistant  
**검토자**: (추후 기입)
