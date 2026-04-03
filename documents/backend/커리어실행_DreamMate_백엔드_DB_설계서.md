# 커리어 실행(DreamMate) 백엔드 & DB 설계서

> **작성일**: 2026-03-27  
> **목적**: AI CareerPath 커리어 실행(DreamMate) 기능의 백엔드 API 및 데이터베이스 설계  
> **분석 대상**: `/frontend/app/dreammate` 및 관련 JSON 데이터  
> **백엔드 프레임워크**: Django + Django REST Framework (DRF)

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

AI CareerPath의 **커리어 실행(DreamMate)** 기능은 학생들이 단기 실행 로드맵을 작성하고, 주차별 TODO를 관리하며, 실행 결과를 기록하고 커뮤니티(그룹)와 공유하는 실행 중심 플랫폼입니다.

**커리어 패스(Career Path)와의 차이점**:
- **커리어 패스**: 장기 계획 (3년 이상), 학년별 구조, 학교 커뮤니티 포함
- **커리어 실행(DreamMate)**: 단기 실행 (3개월 이내), 주차별 TODO, 그룹 커뮤니티만 존재

### 1.2 핵심 기능 6가지

프론트엔드 분석 결과, 다음 6가지 핵심 기능으로 구성됩니다:

1. **로드맵 CRUD**: 개인 실행 로드맵 생성·수정·삭제·조회
2. **주차별 TODO 관리**: 주차 목표·작업 체크리스트·진행 메모·회고
3. **드림 라이브러리**: 학습 자료·가이드 공유 (MD·PDF 뷰어)
4. **드림 스페이스 (그룹)**: 사용자 그룹 관리 (학교 없음)
5. **댓글 시스템**: 공유된 로드맵·자료에 대한 댓글
6. **신고 시스템**: 부적절한 로드맵·자료·댓글 신고

### 1.3 기술 스택

**백엔드**:
- **언어/프레임워크**: Python 3.11+ + Django 5.0 + Django REST Framework (DRF)
- **데이터베이스**: PostgreSQL 15+ (관계형 데이터) + Redis 7+ (캐싱·세션)
- **ORM**: Django ORM
- **인증**: JWT (djangorestframework-simplejwt)
- **파일 스토리지**: AWS S3 / Cloudflare R2 (MD·PDF 파일 업로드)
- **비동기 작업**: Celery + Redis (알림 발송, 이메일 등)

**인프라**:
- **컨테이너**: Docker + Docker Compose
- **배포**: AWS ECS / GCP Cloud Run / Heroku
- **모니터링**: Sentry (에러 추적), Prometheus + Grafana (메트릭)

---

## 2. 시스템 아키텍처

### 2.1 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
│  /dreammate?tab=feed | library | space | my                  │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTPS (REST API)
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway / Load Balancer                │
│                    (Nginx / AWS ALB)                          │
└────────────────┬────────────────────────────────────────────┘
                 │
    ┌────────────┼────────────┬────────────────┐
    ▼            ▼            ▼                ▼
┌─────────┐ ┌─────────┐ ┌──────────┐   ┌──────────────┐
│ Django  │ │ Django  │ │  Celery  │   │   Nginx      │
│ Web     │ │ REST    │ │  Worker  │   │  (Static)    │
│ Server  │ │Framework│ │          │   │              │
└────┬────┘ └────┬────┘ └────┬─────┘   └──────────────┘
     │           │            │
     └───────────┴────────────┴─────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
     ┌─────────┐  ┌─────────┐  ┌─────────┐
     │PostgreSQL│  │  Redis  │  │   S3    │
     │  (Main)  │  │ (Cache) │  │ (Files) │
     └─────────┘  └─────────┘  └─────────┘
```

### 2.2 Django 프로젝트 구조

```
dreammate_backend/
├── config/                      # Django 설정
│   ├── settings/
│   │   ├── base.py
│   │   ├── development.py
│   │   └── production.py
│   ├── urls.py
│   └── wsgi.py
├── apps/
│   ├── accounts/                # 사용자 인증·관리
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── roadmaps/                # 로드맵 CRUD
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── library/                 # 드림 라이브러리
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── spaces/                  # 드림 스페이스 (그룹)
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── comments/                # 댓글 시스템
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── reports/                 # 신고 시스템
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   └── reactions/               # 좋아요·북마크
│       ├── models.py
│       ├── serializers.py
│       ├── views.py
│       └── urls.py
├── manage.py
├── requirements.txt
└── Dockerfile
```

---

## 3. 도메인 모델 분석

### 3.1 프론트엔드 데이터 구조 분석

#### 3.1.1 SharedRoadmap (공유된 로드맵)

```typescript
// frontend/app/dreammate/types.ts
interface SharedRoadmap {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerEmoji: string;
  ownerGrade: string;
  title: string;
  description: string;
  period: PeriodType;                    // 'afterschool' | 'vacation' | 'semester'
  starColor: string;
  focusItemTypes?: DreamItemType[];      // ['award', 'activity', 'project', 'paper']
  shareScope?: RoadmapShareScope;        // 'private' | 'public' | 'space' (하위 호환)
  shareChannels?: RoadmapShareChannel[]; // ['public', 'space'] (멀티 선택)
  items: RoadmapItem[];
  finalResultTitle?: string;
  finalResultDescription?: string;
  finalResultUrl?: string;
  finalResultImageUrl?: string;
  milestoneResults?: RoadmapMilestoneResult[];
  groupIds: string[];                    // 공유된 그룹 ID 목록
  likes: number;
  bookmarks: number;
  sharedAt: string;
  comments: RoadmapComment[];
}

type PeriodType = 'afterschool' | 'vacation' | 'semester';
type DreamItemType = 'award' | 'activity' | 'project' | 'paper';
type RoadmapShareChannel = 'public' | 'space';
```

#### 3.1.2 RoadmapItem (로드맵 항목)

```typescript
interface RoadmapItem {
  id: string;
  type: DreamItemType;
  title: string;
  months: number[];                      // 실행 월 (예: [3, 4, 5])
  difficulty: number;                    // 난이도 (1~5)
  targetOutput?: string;                 // 목표 산출물
  successCriteria?: string;              // 완료 판단 기준
  subItems?: RoadmapTodoItem[];          // 주차별 TODO
}
```

#### 3.1.3 RoadmapTodoItem (주차별 TODO)

```typescript
interface RoadmapTodoItem {
  id: string;
  weekLabel?: string;                    // 주차 라벨 (예: "3월 1주차")
  weekNumber?: number;                   // 주차 번호 (1~8)
  entryType?: 'goal' | 'task';           // 목표 vs 작업
  title: string;
  isDone?: boolean;                      // 완료 여부
  note?: string;                         // 진행 메모
  outputRef?: string;                    // 산출물 참조 (파일명·URL)
  reviewNote?: string;                   // 회고 메모
}
```

#### 3.1.4 RoadmapMilestoneResult (마일스톤 결과)

```typescript
interface RoadmapMilestoneResult {
  id: string;
  title: string;
  description?: string;
  monthWeekLabel?: string;               // 월·주차 라벨
  timeLog?: string;                      // 소요 시간
  resultUrl?: string;                    // 결과 URL
  imageUrl?: string;                     // 결과 이미지
  recordedAt?: string;                   // 기록 일시
}
```

#### 3.1.5 DreamResource (드림 라이브러리 자료)

```typescript
interface DreamResource {
  id: string;
  category: ResourceCategoryId;          // 'admission' | 'contest' | 'project' | 'roadmap' | 'study' | 'portfolio'
  title: string;
  description: string;
  authorId?: string;
  resourceUrl?: string;                  // 외부 URL
  attachmentFileName?: string;
  attachmentFileType?: 'md' | 'pdf';
  attachmentMarkdownContent?: string;    // MD 본문
  attachmentDataUrl?: string;            // PDF Data URL
  authorName: string;
  authorEmoji: string;
  authorGrade: string;
  tags: string[];
  likes: number;
  bookmarks: number;
  createdAt: string;
}

type ResourceCategoryId = 'admission' | 'contest' | 'project' | 'roadmap' | 'study' | 'portfolio';
```

#### 3.1.6 DreamSpace (드림 스페이스 - 그룹)

```typescript
interface DreamSpace {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  creatorId: string;
  creatorName: string;
  memberCount: number;
  members: SpaceMember[];
  sharedRoadmapCount: number;
  recruitmentStatus?: SpaceRecruitmentStatus;  // 'open' | 'closed'
  notices?: SpaceNotice[];
  programProposals?: SpaceProgramProposal[];
  participationApplications?: SpaceParticipationApplication[];
  inviteCode?: string;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

interface SpaceMember {
  id: string;
  name: string;
  emoji: string;
  grade: string;
  joinedAt: string;
  role?: 'creator' | 'member';
}

interface SpaceNotice {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  createdByUserId: string;
  createdByName: string;
}

interface SpaceProgramProposal {
  id: string;
  title: string;
  summary: string;
  programType: 'class' | 'project' | 'mentoring';
  template: ProjectProposalTemplate;
}

interface SpaceParticipationApplication {
  id: string;
  applicantUserId: string;
  applicantName: string;
  applicantEmoji: string;
  applicantGrade: string;
  message: string;
  appliedAt: string;
  status: 'applied' | 'approved' | 'confirmed' | 'inProgress';
  approvedAt?: string;
  confirmedAt?: string;
  inProgressAt?: string;
  handledByUserId?: string;
}
```

#### 3.1.7 Comment (댓글)

```typescript
interface RoadmapComment {
  id: string;
  parentId?: string;                     // 대댓글인 경우 부모 댓글 ID
  authorId?: string;
  authorName: string;
  authorEmoji: string;
  content: string;
  createdAt: string;
}

interface DreamResourceComment {
  id: string;
  resourceId: string;
  authorId: string;
  authorName: string;
  authorEmoji: string;
  content: string;
  createdAt: string;
}
```

#### 3.1.8 Report (신고)

```typescript
interface RoadmapReportRecord {
  id: string;
  roadmapId: string;
  reasonId: string;
  detail: string;
  reportedByUserId: string;
  createdAt: string;
}

interface DreamResourceReportRecord {
  id: string;
  resourceId: string;
  reasonId: string;
  detail: string;
  reportedByUserId: string;
  createdAt: string;
}
```

---

## 4. 데이터베이스 설계

### 4.1 ERD (Entity Relationship Diagram)

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│    users     │───┬───│     roadmaps     │───┬───│roadmap_items │
└──────────────┘   │   └──────────────────┘   │   └──────────────┘
       │           │            │              │           │
       │           │            │              │           ▼
       │           │            │              │   ┌──────────────┐
       │           │            │              └───│ roadmap_todos│
       │           │            │                  └──────────────┘
       │           │            │
       │           │            ▼
       │           │    ┌──────────────────┐
       │           └────│ shared_roadmaps  │
       │                └──────────────────┘
       │                        │
       │                        ├──────────────┬──────────────┐
       │                        │              │              │
       │                        ▼              ▼              ▼
       │                ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
       │                │   comments   │  │  reactions   │  │  milestones  │
       │                └──────────────┘  └──────────────┘  └──────────────┘
       │                        │
       │                        ▼
       │                ┌──────────────┐
       │                │   reports    │
       │                └──────────────┘
       │
       ├────────────────┬────────────────┐
       ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  resources   │  │    spaces    │  │space_members │
└──────────────┘  └──────────────┘  └──────────────┘
       │                │                    │
       ├────────────────┤                    │
       ▼                ▼                    │
┌──────────────┐  ┌──────────────┐          │
│resource_     │  │shared_roadmap│          │
│ comments     │  │   _spaces    │          │
└──────────────┘  └──────────────┘          │
                         │                  │
                         └──────────────────┘
```

### 4.2 Django 모델 설계

#### 4.2.1 User (사용자)

```python
# apps/accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """사용자 모델"""
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100)
    emoji = models.CharField(max_length=10, default='👤')
    grade_id = models.CharField(max_length=20, blank=True, null=True)  # 현재 학년
    profile_image_url = models.URLField(blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login_at = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_email_verified = models.BooleanField(default=False)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'name']
    
    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['grade_id']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.email})"
```

#### 4.2.2 Roadmap (로드맵)

```python
# apps/roadmaps/models.py
from django.db import models
from django.contrib.postgres.fields import ArrayField
from apps.accounts.models import User

class Roadmap(models.Model):
    """로드맵 (개인 실행 계획)"""
    PERIOD_CHOICES = [
        ('afterschool', '방과후'),
        ('vacation', '방학'),
        ('semester', '학기'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='roadmaps')
    title = models.CharField(max_length=200)
    description = models.TextField()
    period = models.CharField(max_length=20, choices=PERIOD_CHOICES)
    star_color = models.CharField(max_length=20, default='#6C5CE7')
    focus_item_types = ArrayField(
        models.CharField(max_length=20),
        blank=True,
        default=list,
    )  # ['award', 'activity', 'project', 'paper']
    
    # 최종 결과물
    final_result_title = models.CharField(max_length=200, blank=True, null=True)
    final_result_description = models.TextField(blank=True, null=True)
    final_result_url = models.URLField(blank=True, null=True)
    final_result_image_url = models.URLField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'roadmaps'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['period']),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.user.name})"
```

#### 4.2.3 RoadmapItem (로드맵 항목)

```python
# apps/roadmaps/models.py
class RoadmapItem(models.Model):
    """로드맵 항목 (수상·활동·프로젝트·논문)"""
    TYPE_CHOICES = [
        ('award', '수상·대회'),
        ('activity', '활동'),
        ('project', '프로젝트'),
        ('paper', '논문·탐구'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    roadmap = models.ForeignKey(Roadmap, on_delete=models.CASCADE, related_name='items')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=300)
    months = ArrayField(models.IntegerField(), default=list)  # [3, 4, 5]
    difficulty = models.IntegerField(default=1)  # 1~5
    target_output = models.TextField(blank=True, null=True)
    success_criteria = models.TextField(blank=True, null=True)
    sort_order = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'roadmap_items'
        ordering = ['sort_order', 'created_at']
        indexes = [
            models.Index(fields=['roadmap', 'sort_order']),
            models.Index(fields=['type']),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.type})"
```

#### 4.2.4 RoadmapTodo (주차별 TODO)

```python
# apps/roadmaps/models.py
class RoadmapTodo(models.Model):
    """주차별 TODO (목표·작업)"""
    ENTRY_TYPE_CHOICES = [
        ('goal', '주차 목표'),
        ('task', '작업'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    roadmap_item = models.ForeignKey(RoadmapItem, on_delete=models.CASCADE, related_name='todos')
    week_label = models.CharField(max_length=50, blank=True, null=True)  # "3월 1주차"
    week_number = models.IntegerField(blank=True, null=True)  # 1~8
    entry_type = models.CharField(max_length=10, choices=ENTRY_TYPE_CHOICES, default='task')
    title = models.CharField(max_length=300)
    is_done = models.BooleanField(default=False)
    note = models.TextField(blank=True, null=True)  # 진행 메모
    output_ref = models.CharField(max_length=500, blank=True, null=True)  # 산출물 참조
    review_note = models.TextField(blank=True, null=True)  # 회고
    sort_order = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'roadmap_todos'
        ordering = ['week_number', 'sort_order', 'created_at']
        indexes = [
            models.Index(fields=['roadmap_item', 'week_number']),
            models.Index(fields=['is_done']),
        ]
    
    def __str__(self):
        return f"{self.title} (Week {self.week_number})"
```

#### 4.2.5 SharedRoadmap (공유된 로드맵)

```python
# apps/roadmaps/models.py
class SharedRoadmap(models.Model):
    """공유된 로드맵"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    roadmap = models.ForeignKey(Roadmap, on_delete=models.CASCADE, related_name='shared_instances')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shared_roadmaps')
    share_channels = ArrayField(
        models.CharField(max_length=20),
        default=list,
    )  # ['public', 'space']
    
    like_count = models.IntegerField(default=0)
    bookmark_count = models.IntegerField(default=0)
    view_count = models.IntegerField(default=0)
    comment_count = models.IntegerField(default=0)
    
    shared_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_hidden = models.BooleanField(default=False)  # 신고 등으로 숨김 처리
    
    class Meta:
        db_table = 'shared_roadmaps'
        ordering = ['-shared_at']
        indexes = [
            models.Index(fields=['user', '-shared_at']),
            models.Index(fields=['-like_count']),
            models.Index(fields=['is_hidden']),
        ]
    
    def __str__(self):
        return f"Shared: {self.roadmap.title}"
```

#### 4.2.6 SharedRoadmapSpace (공유 로드맵 - 스페이스 연결)

```python
# apps/roadmaps/models.py
class SharedRoadmapSpace(models.Model):
    """공유 로드맵 - 스페이스 연결 (M2M)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shared_roadmap = models.ForeignKey(SharedRoadmap, on_delete=models.CASCADE, related_name='space_links')
    space = models.ForeignKey('spaces.Space', on_delete=models.CASCADE, related_name='roadmap_links')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'shared_roadmap_spaces'
        unique_together = ['shared_roadmap', 'space']
        indexes = [
            models.Index(fields=['shared_roadmap']),
            models.Index(fields=['space']),
        ]
```

#### 4.2.7 RoadmapMilestone (마일스톤 결과)

```python
# apps/roadmaps/models.py
class RoadmapMilestone(models.Model):
    """로드맵 마일스톤 결과"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    roadmap = models.ForeignKey(Roadmap, on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    month_week_label = models.CharField(max_length=50, blank=True, null=True)
    time_log = models.CharField(max_length=100, blank=True, null=True)
    result_url = models.URLField(blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    recorded_at = models.DateTimeField(blank=True, null=True)
    sort_order = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'roadmap_milestones'
        ordering = ['sort_order', 'recorded_at']
        indexes = [
            models.Index(fields=['roadmap', 'sort_order']),
        ]
```

#### 4.2.8 Resource (드림 라이브러리 자료)

```python
# apps/library/models.py
from django.db import models
from django.contrib.postgres.fields import ArrayField
from apps.accounts.models import User

class Resource(models.Model):
    """드림 라이브러리 자료"""
    CATEGORY_CHOICES = [
        ('admission', '입시'),
        ('contest', '대회'),
        ('project', '프로젝트'),
        ('roadmap', '로드맵'),
        ('study', '학습'),
        ('portfolio', '포트폴리오'),
    ]
    
    FILE_TYPE_CHOICES = [
        ('md', 'Markdown'),
        ('pdf', 'PDF'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resources')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    resource_url = models.URLField(blank=True, null=True)
    
    # 파일 첨부
    attachment_file_name = models.CharField(max_length=255, blank=True, null=True)
    attachment_file_type = models.CharField(max_length=10, choices=FILE_TYPE_CHOICES, blank=True, null=True)
    attachment_markdown_content = models.TextField(blank=True, null=True)
    attachment_data_url = models.TextField(blank=True, null=True)  # PDF Data URL
    attachment_s3_key = models.CharField(max_length=500, blank=True, null=True)  # S3 저장 키
    
    tags = ArrayField(models.CharField(max_length=50), default=list)
    like_count = models.IntegerField(default=0)
    bookmark_count = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_hidden = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'resources'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['category']),
            models.Index(fields=['-like_count']),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.category})"
```

#### 4.2.9 Space (드림 스페이스 - 그룹)

```python
# apps/spaces/models.py
from django.db import models
from django.contrib.postgres.fields import ArrayField
from apps.accounts.models import User

class Space(models.Model):
    """드림 스페이스 (그룹)"""
    RECRUITMENT_STATUS_CHOICES = [
        ('open', '모집 중'),
        ('closed', '모집 마감'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    emoji = models.CharField(max_length=10, default='👥')
    description = models.TextField()
    color = models.CharField(max_length=20, default='#6C5CE7')
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_spaces')
    invite_code = models.CharField(max_length=50, unique=True, blank=True, null=True)
    member_count = models.IntegerField(default=1)
    shared_roadmap_count = models.IntegerField(default=0)
    recruitment_status = models.CharField(max_length=20, choices=RECRUITMENT_STATUS_CHOICES, default='open')
    tags = ArrayField(models.CharField(max_length=50), default=list)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'spaces'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['creator']),
            models.Index(fields=['invite_code']),
            models.Index(fields=['recruitment_status']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.emoji})"
```

#### 4.2.10 SpaceMember (스페이스 멤버)

```python
# apps/spaces/models.py
class SpaceMember(models.Model):
    """스페이스 멤버"""
    ROLE_CHOICES = [
        ('creator', '생성자'),
        ('member', '멤버'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    space = models.ForeignKey(Space, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='space_memberships')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'space_members'
        unique_together = ['space', 'user']
        indexes = [
            models.Index(fields=['space']),
            models.Index(fields=['user']),
        ]
    
    def __str__(self):
        return f"{self.user.name} in {self.space.name}"
```

#### 4.2.11 SpaceNotice (스페이스 공지)

```python
# apps/spaces/models.py
class SpaceNotice(models.Model):
    """스페이스 공지"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    space = models.ForeignKey(Space, on_delete=models.CASCADE, related_name='notices')
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'space_notices'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['space', '-created_at']),
        ]
```

#### 4.2.12 SpaceProgramProposal (스페이스 프로그램 제안)

```python
# apps/spaces/models.py
class SpaceProgramProposal(models.Model):
    """스페이스 프로그램 제안"""
    PROGRAM_TYPE_CHOICES = [
        ('class', '수업'),
        ('project', '프로젝트'),
        ('mentoring', '멘토링'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    space = models.ForeignKey(Space, on_delete=models.CASCADE, related_name='program_proposals')
    title = models.CharField(max_length=200)
    summary = models.TextField()
    program_type = models.CharField(max_length=20, choices=PROGRAM_TYPE_CHOICES)
    template_data = models.JSONField()  # ProjectProposalTemplate 전체 저장
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'space_program_proposals'
        ordering = ['-created_at']
```

#### 4.2.13 SpaceParticipationApplication (스페이스 참여 신청)

```python
# apps/spaces/models.py
class SpaceParticipationApplication(models.Model):
    """스페이스 참여 신청"""
    STATUS_CHOICES = [
        ('applied', '신청'),
        ('approved', '승인'),
        ('confirmed', '확정'),
        ('inProgress', '진행 중'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    space = models.ForeignKey(Space, on_delete=models.CASCADE, related_name='participation_applications')
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='space_applications')
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')
    
    applied_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(blank=True, null=True)
    confirmed_at = models.DateTimeField(blank=True, null=True)
    in_progress_at = models.DateTimeField(blank=True, null=True)
    handled_by = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True, related_name='handled_applications')
    
    class Meta:
        db_table = 'space_participation_applications'
        ordering = ['-applied_at']
        indexes = [
            models.Index(fields=['space', 'status']),
            models.Index(fields=['applicant']),
        ]
```

#### 4.2.14 Comment (댓글)

```python
# apps/comments/models.py
from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from apps.accounts.models import User

class Comment(models.Model):
    """범용 댓글 모델 (로드맵·자료 공통)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, blank=True, null=True, related_name='replies')
    
    # GenericForeignKey로 SharedRoadmap 또는 Resource 참조
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.UUIDField()
    content_object = GenericForeignKey('content_type', 'object_id')
    
    content = models.TextField()
    is_hidden = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'comments'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['user']),
            models.Index(fields=['parent']),
        ]
    
    def __str__(self):
        return f"Comment by {self.user.name} on {self.content_type}"
```

#### 4.2.15 Reaction (좋아요·북마크)

```python
# apps/reactions/models.py
from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from apps.accounts.models import User

class Reaction(models.Model):
    """범용 반응 모델 (좋아요·북마크)"""
    REACTION_TYPE_CHOICES = [
        ('like', '좋아요'),
        ('bookmark', '북마크'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reactions')
    reaction_type = models.CharField(max_length=20, choices=REACTION_TYPE_CHOICES)
    
    # GenericForeignKey로 SharedRoadmap 또는 Resource 참조
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.UUIDField()
    content_object = GenericForeignKey('content_type', 'object_id')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'reactions'
        unique_together = ['user', 'content_type', 'object_id', 'reaction_type']
        indexes = [
            models.Index(fields=['user', 'reaction_type']),
            models.Index(fields=['content_type', 'object_id']),
        ]
    
    def __str__(self):
        return f"{self.user.name} {self.reaction_type} on {self.content_type}"
```

#### 4.2.16 Report (신고)

```python
# apps/reports/models.py
from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from apps.accounts.models import User

class Report(models.Model):
    """범용 신고 모델"""
    STATUS_CHOICES = [
        ('pending', '대기 중'),
        ('reviewed', '검토 완료'),
        ('resolved', '처리 완료'),
        ('rejected', '기각'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports')
    
    # GenericForeignKey로 SharedRoadmap, Resource, Comment 참조
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.UUIDField()
    content_object = GenericForeignKey('content_type', 'object_id')
    
    reason_id = models.CharField(max_length=50)
    reason_label = models.CharField(max_length=200)
    detail = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True, related_name='reviewed_reports')
    reviewed_at = models.DateTimeField(blank=True, null=True)
    resolution_note = models.TextField(blank=True, null=True)
    
    reported_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'reports'
        ordering = ['-reported_at']
        indexes = [
            models.Index(fields=['reporter']),
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"Report by {self.reporter.name} on {self.content_type}"
```

---

## 5. API 엔드포인트 설계

### 5.1 API 버전 관리

- **Base URL**: `https://api.aicareerpath.com/v1/dreammate`
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
        "field": "title",
        "message": "This field is required"
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
      "createdAt": "2026-03-27T10:00:00Z"
    },
    "tokens": {
      "access": "eyJhbGciOiJIUzI1NiIs...",
      "refresh": "eyJhbGciOiJIUzI1NiIs..."
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
  "refresh": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "access": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### 5.4 로드맵 (Roadmaps)

#### GET `/roadmaps` - 내 로드맵 목록 조회

**Query Parameters**:
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 20)
- `period`: 기간 필터 (`afterschool` | `vacation` | `semester`)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "roadmaps": [
      {
        "id": "uuid-rm-1",
        "title": "IT 개발자 방과후 활동 로드맵",
        "description": "방과후 3개월(3~6월) 동안 SW 공모전, 코딩 동아리 운영...",
        "period": "afterschool",
        "starColor": "#6C5CE7",
        "focusItemTypes": ["project", "activity", "award"],
        "itemCount": 3,
        "completedTodoCount": 8,
        "totalTodoCount": 24,
        "createdAt": "2026-03-10T09:00:00Z",
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

#### GET `/roadmaps/:id` - 로드맵 상세 조회

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid-rm-1",
    "title": "IT 개발자 방과후 활동 로드맵",
    "description": "...",
    "period": "afterschool",
    "starColor": "#6C5CE7",
    "focusItemTypes": ["project", "activity", "award"],
    "finalResultTitle": "교내 SW 공모전 최우수상",
    "finalResultDescription": "...",
    "finalResultUrl": "https://github.com/example/lunch-review-app",
    "items": [
      {
        "id": "item-1",
        "type": "award",
        "title": "학교 급식 리뷰 앱 개발 (React Native)",
        "months": [3, 4, 5],
        "difficulty": 4,
        "targetOutput": "GitHub 저장소 URL + APK 파일 + 시연 영상 3분",
        "successCriteria": "공모전 제출 마감 48시간 전 최종본 업로드...",
        "todos": [
          {
            "id": "todo-1",
            "weekNumber": 1,
            "weekLabel": "3월 1주차",
            "entryType": "goal",
            "title": "급식 리뷰 앱 기획 및 화면 설계 완료",
            "isDone": true,
            "note": "Figma로 메인 화면 3개 설계...",
            "outputRef": "figma_design_v1.pdf",
            "reviewNote": "화면 수를 5개에서 3개로 줄여 개발 시간 단축"
          }
        ]
      }
    ],
    "milestones": [
      {
        "id": "ms-1",
        "title": "1차 MVP 기능 구현 완료",
        "description": "React Native 기반 학급 급식 리뷰 앱 핵심 기능...",
        "monthWeekLabel": "3월 2주차",
        "resultUrl": "https://github.com/example/lunch-review-app",
        "recordedAt": "2026-03-08T10:00:00Z"
      }
    ],
    "createdAt": "2026-03-10T09:00:00Z",
    "updatedAt": "2026-03-20T10:00:00Z"
  }
}
```

#### POST `/roadmaps` - 로드맵 생성

**Request**:
```json
{
  "title": "IT 개발자 방과후 활동 로드맵",
  "description": "방과후 3개월(3~6월) 동안 SW 공모전, 코딩 동아리 운영...",
  "period": "afterschool",
  "starColor": "#6C5CE7",
  "focusItemTypes": ["project", "activity", "award"],
  "items": [
    {
      "type": "award",
      "title": "학교 급식 리뷰 앱 개발 (React Native)",
      "months": [3, 4, 5],
      "difficulty": 4,
      "targetOutput": "GitHub 저장소 URL + APK 파일 + 시연 영상 3분",
      "successCriteria": "공모전 제출 마감 48시간 전 최종본 업로드...",
      "todos": [
        {
          "weekNumber": 1,
          "weekLabel": "3월 1주차",
          "entryType": "goal",
          "title": "급식 리뷰 앱 기획 및 화면 설계 완료"
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
    "id": "uuid-rm-1",
    "title": "IT 개발자 방과후 활동 로드맵",
    ...
  }
}
```

#### PUT `/roadmaps/:id` - 로드맵 수정

**Request**: (POST와 동일한 구조)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid-rm-1",
    "title": "IT 개발자 방과후 활동 로드맵 (수정됨)",
    ...
  }
}
```

#### DELETE `/roadmaps/:id` - 로드맵 삭제

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Roadmap deleted successfully",
    "deletedId": "uuid-rm-1"
  }
}
```

#### PATCH `/roadmaps/:id/items/:itemId/todos/:todoId` - TODO 완료 토글

**Request**:
```json
{
  "isDone": true,
  "note": "Figma로 메인 화면 3개 설계 완료",
  "outputRef": "figma_design_v1.pdf",
  "reviewNote": "화면 수를 5개에서 3개로 줄여 개발 시간 단축"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "todo-1",
    "isDone": true,
    "note": "Figma로 메인 화면 3개 설계 완료",
    "outputRef": "figma_design_v1.pdf",
    "reviewNote": "화면 수를 5개에서 3개로 줄여 개발 시간 단축",
    "updatedAt": "2026-03-27T10:00:00Z"
  }
}
```

---

### 5.5 공유 로드맵 (Shared Roadmaps)

#### GET `/shared-roadmaps` - 공유 로드맵 목록 조회

**Query Parameters**:
- `page`: 페이지 번호
- `limit`: 페이지당 항목 수
- `shareChannel`: 공유 채널 필터 (`public` | `space`)
- `spaceId`: 스페이스 ID 필터 (선택)
- `period`: 기간 필터 (선택)
- `sortBy`: 정렬 기준 (`recent` | `likes` | `bookmarks`)
- `search`: 검색어 (제목·설명·작성자 이름)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "sharedRoadmaps": [
      {
        "id": "shared-1",
        "roadmapId": "rm-1",
        "ownerId": "user-1",
        "ownerName": "박시준",
        "ownerEmoji": "🔬",
        "ownerGrade": "mid2",
        "title": "IT 개발자 방과후 활동 로드맵",
        "description": "...",
        "period": "afterschool",
        "starColor": "#6C5CE7",
        "focusItemTypes": ["project", "activity", "award"],
        "shareChannels": ["public"],
        "likeCount": 58,
        "bookmarkCount": 32,
        "viewCount": 450,
        "commentCount": 2,
        "sharedAt": "2026-03-10T09:00:00Z",
        "isLiked": false,
        "isBookmarked": false
      }
    ],
    "pagination": { ... }
  }
}
```

#### GET `/shared-roadmaps/:id` - 공유 로드맵 상세 조회

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "shared-1",
    "roadmapId": "rm-1",
    "ownerId": "user-1",
    "ownerName": "박시준",
    "ownerEmoji": "🔬",
    "ownerGrade": "mid2",
    "title": "IT 개발자 방과후 활동 로드맵",
    "description": "...",
    "period": "afterschool",
    "starColor": "#6C5CE7",
    "focusItemTypes": ["project", "activity", "award"],
    "shareChannels": ["public"],
    "items": [ ... ],
    "milestones": [ ... ],
    "finalResultTitle": "교내 SW 공모전 최우수상",
    "finalResultDescription": "...",
    "finalResultUrl": "https://github.com/example/lunch-review-app",
    "likeCount": 58,
    "bookmarkCount": 32,
    "viewCount": 450,
    "commentCount": 2,
    "sharedAt": "2026-03-10T09:00:00Z",
    "isLiked": false,
    "isBookmarked": false
  }
}
```

#### POST `/shared-roadmaps` - 로드맵 공유

**Request**:
```json
{
  "roadmapId": "rm-1",
  "shareChannels": ["public", "space"],
  "spaceIds": ["space-1", "space-2"]
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "shared-1",
    "roadmapId": "rm-1",
    "shareChannels": ["public", "space"],
    ...
  }
}
```

#### PUT `/shared-roadmaps/:id` - 공유 로드맵 수정

**Request**:
```json
{
  "shareChannels": ["space"],
  "spaceIds": ["space-1"]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "shared-1",
    "shareChannels": ["space"],
    ...
  }
}
```

#### DELETE `/shared-roadmaps/:id` - 공유 로드맵 삭제 (공유 취소)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Shared roadmap deleted successfully",
    "deletedId": "shared-1"
  }
}
```

#### POST `/shared-roadmaps/:id/use` - 공유 로드맵 복사하여 내 로드맵 생성

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "uuid-new-rm",
    "title": "IT 개발자 방과후 활동 로드맵 (복사본)",
    ...
  }
}
```

---

### 5.6 반응 (Reactions)

#### POST `/shared-roadmaps/:id/like` - 좋아요 토글

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "isLiked": true,
    "likeCount": 59
  }
}
```

#### POST `/shared-roadmaps/:id/bookmark` - 북마크 토글

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "isBookmarked": true,
    "bookmarkCount": 33
  }
}
```

#### POST `/resources/:id/like` - 자료 좋아요 토글

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

#### POST `/resources/:id/bookmark` - 자료 북마크 토글

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "isBookmarked": true,
    "bookmarkCount": 9
  }
}
```

---

### 5.7 댓글 (Comments)

#### GET `/shared-roadmaps/:id/comments` - 로드맵 댓글 목록 조회

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": "cmt-1",
        "authorId": "user-2",
        "authorName": "김하늘",
        "authorEmoji": "💻",
        "content": "주차 목표가 명확해서 따라하기 좋네요. 저도 이 방식으로 관리해볼게요!",
        "createdAt": "2026-03-11T10:30:00Z",
        "replies": []
      }
    ]
  }
}
```

#### POST `/shared-roadmaps/:id/comments` - 로드맵 댓글 작성

**Request**:
```json
{
  "content": "정말 도움이 되는 로드맵이에요! 저도 참고할게요.",
  "parentId": null
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "cmt-5",
    "authorId": "user-3",
    "authorName": "지현",
    "authorEmoji": "👩‍💻",
    "content": "정말 도움이 되는 로드맵이에요! 저도 참고할게요.",
    "createdAt": "2026-03-27T10:00:00Z"
  }
}
```

#### GET `/resources/:id/comments` - 자료 댓글 목록 조회

**Response** (200 OK): (로드맵 댓글과 동일한 구조)

#### POST `/resources/:id/comments` - 자료 댓글 작성

**Request**: (로드맵 댓글과 동일한 구조)

**Response** (201 Created): (로드맵 댓글과 동일한 구조)

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
    "id": "cmt-5",
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
    "deletedId": "cmt-5"
  }
}
```

---

### 5.8 신고 (Reports)

#### POST `/reports` - 신고 제출

**Request**:
```json
{
  "targetType": "shared_roadmap",
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
    "targetType": "shared_roadmap",
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
- `targetType`: 대상 유형 필터 (`shared_roadmap` | `resource` | `comment`)

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
        "targetType": "shared_roadmap",
        "targetId": "shared-1",
        "reasonId": "spam",
        "reasonLabel": "스팸 또는 홍보성 콘텐츠",
        "detail": "반복적으로 동일한 내용을 게시하고 있습니다.",
        "status": "pending",
        "reportedAt": "2026-03-27T10:00:00Z"
      }
    ]
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

### 5.9 드림 라이브러리 (Resources)

#### GET `/resources` - 자료 목록 조회

**Query Parameters**:
- `page`: 페이지 번호
- `limit`: 페이지당 항목 수
- `category`: 카테고리 필터 (`admission` | `contest` | `project` | `roadmap` | `study` | `portfolio`)
- `tags`: 태그 필터 (쉼표 구분)
- `sortBy`: 정렬 기준 (`recent` | `likes` | `bookmarks`)
- `search`: 검색어

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "resources": [
      {
        "id": "res-1",
        "category": "study",
        "title": "주간 학습 루틴 템플릿",
        "description": "마크다운 뷰어 동작을 확인하기 위한 샘플입니다...",
        "resourceUrl": "https://raw.githubusercontent.com/...",
        "attachmentFileName": "weekly-study-template.md",
        "attachmentFileType": "md",
        "authorId": "user-1",
        "authorName": "나의 로드맵",
        "authorEmoji": "🧑‍🚀",
        "authorGrade": "self",
        "tags": ["md", "viewer-test", "학습루틴"],
        "likeCount": 12,
        "bookmarkCount": 8,
        "createdAt": "2026-03-19T09:00:00Z",
        "isLiked": false,
        "isBookmarked": false
      }
    ],
    "pagination": { ... }
  }
}
```

#### GET `/resources/:id` - 자료 상세 조회

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "res-1",
    "category": "study",
    "title": "주간 학습 루틴 템플릿",
    "description": "마크다운 뷰어 동작을 확인하기 위한 샘플입니다...",
    "resourceUrl": "https://raw.githubusercontent.com/...",
    "attachmentFileName": "weekly-study-template.md",
    "attachmentFileType": "md",
    "attachmentMarkdownContent": "# 주간 학습 루틴\n\n## 목표\n- 수학 문제 풀이 20문제\n...",
    "authorId": "user-1",
    "authorName": "나의 로드맵",
    "authorEmoji": "🧑‍🚀",
    "authorGrade": "self",
    "tags": ["md", "viewer-test", "학습루틴"],
    "likeCount": 12,
    "bookmarkCount": 8,
    "createdAt": "2026-03-19T09:00:00Z",
    "isLiked": false,
    "isBookmarked": false
  }
}
```

#### POST `/resources` - 자료 생성

**Request** (multipart/form-data):
```
category: "study"
title: "주간 학습 루틴 템플릿"
description: "마크다운 뷰어 동작을 확인하기 위한 샘플입니다..."
resourceUrl: "https://raw.githubusercontent.com/..."
tags: ["md", "viewer-test", "학습루틴"]
file: (파일 업로드)
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "res-1",
    "category": "study",
    "title": "주간 학습 루틴 템플릿",
    ...
  }
}
```

#### PUT `/resources/:id` - 자료 수정

**Request**: (POST와 동일한 구조)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "res-1",
    "title": "주간 학습 루틴 템플릿 (수정됨)",
    ...
  }
}
```

#### DELETE `/resources/:id` - 자료 삭제

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Resource deleted successfully",
    "deletedId": "res-1"
  }
}
```

---

### 5.10 드림 스페이스 (Spaces)

#### GET `/spaces` - 스페이스 목록 조회

**Query Parameters**:
- `search`: 스페이스 이름 검색
- `recruitmentStatus`: 모집 상태 필터 (`open` | `closed`)
- `tags`: 태그 필터

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "spaces": [
      {
        "id": "space-1",
        "name": "과학고 준비반",
        "emoji": "🔬",
        "description": "과학고 입시를 함께 준비하는 스터디 그룹입니다...",
        "color": "#6C5CE7",
        "creatorId": "user-1",
        "creatorName": "김하늘",
        "memberCount": 8,
        "sharedRoadmapCount": 5,
        "recruitmentStatus": "open",
        "inviteCode": "SCI-2026",
        "tags": ["과학고", "탐구", "수상", "면접"],
        "myRole": null,
        "createdAt": "2026-01-10T09:00:00Z"
      }
    ]
  }
}
```

#### GET `/spaces/:id` - 스페이스 상세 조회

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "space-1",
    "name": "과학고 준비반",
    "emoji": "🔬",
    "description": "과학고 입시를 함께 준비하는 스터디 그룹입니다...",
    "color": "#6C5CE7",
    "creatorId": "user-1",
    "creatorName": "김하늘",
    "memberCount": 8,
    "sharedRoadmapCount": 5,
    "recruitmentStatus": "open",
    "inviteCode": "SCI-2026",
    "tags": ["과학고", "탐구", "수상", "면접"],
    "members": [
      {
        "id": "user-1",
        "name": "김하늘",
        "emoji": "🌟",
        "grade": "mid2",
        "role": "creator",
        "joinedAt": "2026-01-10T09:00:00Z"
      }
    ],
    "notices": [
      {
        "id": "notice-1",
        "title": "3월 첫째 주 탐구 주제 발표 일정 안내",
        "content": "3월 8일(토) 오후 2시에 각자 탐구 주제 3분 발표를 진행합니다...",
        "createdAt": "2026-03-05T09:00:00Z",
        "createdByUserId": "user-1",
        "createdByName": "김하늘"
      }
    ],
    "programProposals": [ ... ],
    "participationApplications": [ ... ],
    "myRole": "creator",
    "createdAt": "2026-01-10T09:00:00Z",
    "updatedAt": "2026-03-10T10:00:00Z"
  }
}
```

#### POST `/spaces` - 스페이스 생성

**Request**:
```json
{
  "name": "과학고 준비반",
  "emoji": "🔬",
  "description": "과학고 입시를 함께 준비하는 스터디 그룹입니다...",
  "color": "#6C5CE7",
  "tags": ["과학고", "탐구", "수상", "면접"]
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "space-1",
    "name": "과학고 준비반",
    "inviteCode": "SCI-2026",
    ...
  }
}
```

#### POST `/spaces/join` - 스페이스 가입

**Request**:
```json
{
  "inviteCode": "SCI-2026"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "space": {
      "id": "space-1",
      "name": "과학고 준비반",
      ...
    },
    "message": "Successfully joined space"
  }
}
```

#### PUT `/spaces/:id` - 스페이스 수정 (생성자 전용)

**Request**:
```json
{
  "name": "과학고 준비반 (수정)",
  "description": "수정된 설명",
  "recruitmentStatus": "closed",
  "tags": ["과학고", "탐구", "수상", "면접", "멘토링"]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "space-1",
    "name": "과학고 준비반 (수정)",
    ...
  }
}
```

#### DELETE `/spaces/:id` - 스페이스 삭제 (생성자 전용)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Space deleted successfully",
    "deletedId": "space-1"
  }
}
```

#### POST `/spaces/:id/leave` - 스페이스 탈퇴

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Successfully left the space"
  }
}
```

#### POST `/spaces/:id/notices` - 스페이스 공지 작성 (생성자 전용)

**Request**:
```json
{
  "title": "3월 첫째 주 탐구 주제 발표 일정 안내",
  "content": "3월 8일(토) 오후 2시에 각자 탐구 주제 3분 발표를 진행합니다..."
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "notice-1",
    "title": "3월 첫째 주 탐구 주제 발표 일정 안내",
    "content": "3월 8일(토) 오후 2시에 각자 탐구 주제 3분 발표를 진행합니다...",
    "createdAt": "2026-03-05T09:00:00Z",
    "createdByUserId": "user-1",
    "createdByName": "김하늘"
  }
}
```

#### POST `/spaces/:id/participation-applications` - 스페이스 참여 신청

**Request**:
```json
{
  "message": "과학고 입시를 준비 중인 중1입니다. 탐구 보고서 작성 경험이 부족해서 함께 배우고 싶어 신청합니다."
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "app-1",
    "applicantUserId": "user-13",
    "applicantName": "문지호",
    "applicantEmoji": "🧪",
    "applicantGrade": "mid1",
    "message": "과학고 입시를 준비 중인 중1입니다...",
    "appliedAt": "2026-03-08T14:00:00Z",
    "status": "applied"
  }
}
```

#### PATCH `/spaces/:id/participation-applications/:appId` - 참여 신청 승인/거절 (생성자 전용)

**Request**:
```json
{
  "status": "approved"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "app-1",
    "status": "approved",
    "approvedAt": "2026-03-08T15:00:00Z",
    "handledByUserId": "user-1"
  }
}
```

---

## 6. 기능별 상세 설계

### 6.1 로드맵 CRUD

#### 6.1.1 생성 (Create)

**Django View 예시**:

```python
# apps/roadmaps/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from .models import Roadmap, RoadmapItem, RoadmapTodo, RoadmapMilestone
from .serializers import RoadmapSerializer, RoadmapDetailSerializer

class RoadmapViewSet(viewsets.ModelViewSet):
    """로드맵 ViewSet"""
    permission_classes = [IsAuthenticated]
    serializer_class = RoadmapSerializer
    
    def get_queryset(self):
        return Roadmap.objects.filter(user=self.request.user)
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """로드맵 생성 (트랜잭션)"""
        serializer = RoadmapDetailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # 1. Roadmap 생성
        roadmap = Roadmap.objects.create(
            user=request.user,
            title=serializer.validated_data['title'],
            description=serializer.validated_data['description'],
            period=serializer.validated_data['period'],
            star_color=serializer.validated_data.get('star_color', '#6C5CE7'),
            focus_item_types=serializer.validated_data.get('focus_item_types', []),
        )
        
        # 2. RoadmapItems 생성
        for item_data in serializer.validated_data.get('items', []):
            item = RoadmapItem.objects.create(
                roadmap=roadmap,
                type=item_data['type'],
                title=item_data['title'],
                months=item_data['months'],
                difficulty=item_data['difficulty'],
                target_output=item_data.get('target_output'),
                success_criteria=item_data.get('success_criteria'),
                sort_order=item_data.get('sort_order', 0),
            )
            
            # 3. RoadmapTodos 생성
            for todo_data in item_data.get('todos', []):
                RoadmapTodo.objects.create(
                    roadmap_item=item,
                    week_label=todo_data.get('week_label'),
                    week_number=todo_data.get('week_number'),
                    entry_type=todo_data.get('entry_type', 'task'),
                    title=todo_data['title'],
                    sort_order=todo_data.get('sort_order', 0),
                )
        
        # 4. Milestones 생성
        for milestone_data in serializer.validated_data.get('milestones', []):
            RoadmapMilestone.objects.create(
                roadmap=roadmap,
                title=milestone_data['title'],
                description=milestone_data.get('description'),
                month_week_label=milestone_data.get('month_week_label'),
                time_log=milestone_data.get('time_log'),
                result_url=milestone_data.get('result_url'),
                image_url=milestone_data.get('image_url'),
                recorded_at=milestone_data.get('recorded_at'),
                sort_order=milestone_data.get('sort_order', 0),
            )
        
        # 5. 응답
        response_serializer = RoadmapDetailSerializer(roadmap)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
```

#### 6.1.2 조회 (Read)

**목록 조회 (페이지네이션)**:

```python
# apps/roadmaps/views.py
from rest_framework.pagination import PageNumberPagination

class RoadmapPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'limit'
    max_page_size = 100

class RoadmapViewSet(viewsets.ModelViewSet):
    pagination_class = RoadmapPagination
    
    def list(self, request, *args, **kwargs):
        """로드맵 목록 조회"""
        queryset = self.get_queryset()
        
        # 필터링
        period = request.query_params.get('period')
        if period:
            queryset = queryset.filter(period=period)
        
        # 페이지네이션
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
```

**상세 조회 (Prefetch)**:

```python
# apps/roadmaps/views.py
from django.db.models import Prefetch

class RoadmapViewSet(viewsets.ModelViewSet):
    def retrieve(self, request, *args, **kwargs):
        """로드맵 상세 조회 (N+1 문제 해결)"""
        queryset = Roadmap.objects.prefetch_related(
            Prefetch('items', queryset=RoadmapItem.objects.prefetch_related('todos')),
            'milestones',
        )
        roadmap = queryset.get(pk=kwargs['pk'], user=request.user)
        serializer = RoadmapDetailSerializer(roadmap)
        return Response(serializer.data)
```

#### 6.1.3 수정 (Update)

**전체 교체 방식**:

```python
# apps/roadmaps/views.py
class RoadmapViewSet(viewsets.ModelViewSet):
    @transaction.atomic
    def update(self, request, *args, **kwargs):
        """로드맵 수정 (전체 교체)"""
        roadmap = self.get_object()
        
        # 1. 기존 하위 데이터 삭제
        roadmap.items.all().delete()
        roadmap.milestones.all().delete()
        
        # 2. 새 데이터 생성 (create와 동일)
        serializer = RoadmapDetailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # ... (create와 동일한 로직)
        
        roadmap.updated_at = timezone.now()
        roadmap.save()
        
        response_serializer = RoadmapDetailSerializer(roadmap)
        return Response(response_serializer.data)
```

#### 6.1.4 삭제 (Delete)

```python
# apps/roadmaps/views.py
class RoadmapViewSet(viewsets.ModelViewSet):
    def destroy(self, request, *args, **kwargs):
        """로드맵 삭제 (CASCADE)"""
        roadmap = self.get_object()
        roadmap.delete()
        return Response(
            {'message': 'Roadmap deleted successfully', 'deletedId': str(roadmap.id)},
            status=status.HTTP_200_OK
        )
```

---

### 6.2 주차별 TODO 관리

#### 6.2.1 TODO 완료 토글

```python
# apps/roadmaps/views.py
from rest_framework.decorators import action

class RoadmapViewSet(viewsets.ModelViewSet):
    @action(detail=True, methods=['patch'], url_path='items/(?P<item_id>[^/.]+)/todos/(?P<todo_id>[^/.]+)')
    def update_todo(self, request, pk=None, item_id=None, todo_id=None):
        """TODO 완료 토글"""
        roadmap = self.get_object()
        
        try:
            todo = RoadmapTodo.objects.get(
                id=todo_id,
                roadmap_item__id=item_id,
                roadmap_item__roadmap=roadmap,
            )
        except RoadmapTodo.DoesNotExist:
            return Response({'error': 'Todo not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # 업데이트
        todo.is_done = request.data.get('isDone', todo.is_done)
        todo.note = request.data.get('note', todo.note)
        todo.output_ref = request.data.get('outputRef', todo.output_ref)
        todo.review_note = request.data.get('reviewNote', todo.review_note)
        todo.save()
        
        serializer = RoadmapTodoSerializer(todo)
        return Response(serializer.data)
```

#### 6.2.2 진행률 계산

```python
# apps/roadmaps/models.py
class Roadmap(models.Model):
    # ...
    
    @property
    def completion_rate(self):
        """로드맵 완료율 계산"""
        total_todos = RoadmapTodo.objects.filter(roadmap_item__roadmap=self).count()
        if total_todos == 0:
            return 0
        completed_todos = RoadmapTodo.objects.filter(
            roadmap_item__roadmap=self,
            is_done=True,
        ).count()
        return round((completed_todos / total_todos) * 100, 1)
```

---

### 6.3 드림 라이브러리

#### 6.3.1 파일 업로드 (S3)

```python
# apps/library/views.py
import boto3
from django.conf import settings
from rest_framework.parsers import MultiPartParser, FormParser

class ResourceViewSet(viewsets.ModelViewSet):
    parser_classes = [MultiPartParser, FormParser]
    
    def create(self, request, *args, **kwargs):
        """자료 생성 (파일 업로드)"""
        file = request.FILES.get('file')
        
        if file:
            # S3 업로드
            s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_REGION,
            )
            
            s3_key = f"resources/{request.user.id}/{file.name}"
            s3_client.upload_fileobj(
                file,
                settings.AWS_S3_BUCKET,
                s3_key,
                ExtraArgs={'ContentType': file.content_type},
            )
            
            # Resource 생성
            resource = Resource.objects.create(
                user=request.user,
                category=request.data['category'],
                title=request.data['title'],
                description=request.data['description'],
                attachment_file_name=file.name,
                attachment_file_type=request.data.get('attachmentFileType'),
                attachment_s3_key=s3_key,
                tags=request.data.get('tags', []),
            )
            
            # MD 파일인 경우 본문 저장
            if file.name.endswith('.md'):
                resource.attachment_markdown_content = file.read().decode('utf-8')
                resource.save()
            
            serializer = ResourceSerializer(resource)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        # 파일 없이 URL만 있는 경우
        serializer = ResourceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        resource = serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
```

#### 6.3.2 MD·PDF 뷰어

**MD 뷰어**: 프론트엔드에서 `attachmentMarkdownContent` 렌더링  
**PDF 뷰어**: S3 URL을 iframe으로 표시

```python
# apps/library/views.py
class ResourceViewSet(viewsets.ModelViewSet):
    @action(detail=True, methods=['get'])
    def download_url(self, request, pk=None):
        """S3 다운로드 URL 생성 (Presigned URL)"""
        resource = self.get_object()
        
        if not resource.attachment_s3_key:
            return Response({'error': 'No file attached'}, status=status.HTTP_404_NOT_FOUND)
        
        s3_client = boto3.client('s3')
        url = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': settings.AWS_S3_BUCKET,
                'Key': resource.attachment_s3_key,
            },
            ExpiresIn=3600,  # 1시간
        )
        
        return Response({'url': url})
```

---

### 6.4 드림 스페이스 (그룹)

#### 6.4.1 스페이스 생성

```python
# apps/spaces/views.py
import random
import string

class SpaceViewSet(viewsets.ModelViewSet):
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """스페이스 생성"""
        # 초대 코드 자동 생성
        invite_code = self.generate_invite_code()
        
        space = Space.objects.create(
            name=request.data['name'],
            emoji=request.data.get('emoji', '👥'),
            description=request.data['description'],
            color=request.data.get('color', '#6C5CE7'),
            creator=request.user,
            invite_code=invite_code,
            tags=request.data.get('tags', []),
        )
        
        # 생성자를 멤버로 추가
        SpaceMember.objects.create(
            space=space,
            user=request.user,
            role='creator',
        )
        
        serializer = SpaceSerializer(space)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def generate_invite_code(self):
        """초대 코드 생성 (예: SCI-2026)"""
        prefix = ''.join(random.choices(string.ascii_uppercase, k=3))
        suffix = ''.join(random.choices(string.digits, k=4))
        return f"{prefix}-{suffix}"
```

#### 6.4.2 스페이스 가입

```python
# apps/spaces/views.py
class SpaceViewSet(viewsets.ModelViewSet):
    @action(detail=False, methods=['post'])
    def join(self, request):
        """스페이스 가입 (초대 코드)"""
        invite_code = request.data.get('inviteCode')
        
        try:
            space = Space.objects.get(invite_code=invite_code)
        except Space.DoesNotExist:
            return Response({'error': 'Invalid invite code'}, status=status.HTTP_404_NOT_FOUND)
        
        # 이미 가입된 경우
        if SpaceMember.objects.filter(space=space, user=request.user).exists():
            return Response({'error': 'Already a member'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 멤버 추가
        SpaceMember.objects.create(
            space=space,
            user=request.user,
            role='member',
        )
        
        # 멤버 수 증가
        space.member_count += 1
        space.save()
        
        serializer = SpaceSerializer(space)
        return Response({
            'space': serializer.data,
            'message': 'Successfully joined space',
        })
```

---

### 6.5 댓글 시스템

#### 6.5.1 GenericForeignKey 활용

```python
# apps/comments/views.py
from django.contrib.contenttypes.models import ContentType

class CommentViewSet(viewsets.ModelViewSet):
    def create(self, request, *args, **kwargs):
        """댓글 작성 (로드맵·자료 공통)"""
        target_type = request.data.get('targetType')  # 'shared_roadmap' | 'resource'
        target_id = request.data.get('targetId')
        
        # ContentType 가져오기
        if target_type == 'shared_roadmap':
            content_type = ContentType.objects.get_for_model(SharedRoadmap)
        elif target_type == 'resource':
            content_type = ContentType.objects.get_for_model(Resource)
        else:
            return Response({'error': 'Invalid target type'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 댓글 생성
        comment = Comment.objects.create(
            user=request.user,
            content_type=content_type,
            object_id=target_id,
            content=request.data['content'],
            parent_id=request.data.get('parentId'),
        )
        
        # 댓글 수 증가
        if target_type == 'shared_roadmap':
            SharedRoadmap.objects.filter(id=target_id).update(comment_count=F('comment_count') + 1)
        
        serializer = CommentSerializer(comment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
```

---

### 6.6 신고 시스템

#### 6.6.1 신고 제출

```python
# apps/reports/views.py
class ReportViewSet(viewsets.ModelViewSet):
    def create(self, request, *args, **kwargs):
        """신고 제출"""
        target_type = request.data.get('targetType')
        target_id = request.data.get('targetId')
        
        # ContentType 가져오기
        if target_type == 'shared_roadmap':
            content_type = ContentType.objects.get_for_model(SharedRoadmap)
        elif target_type == 'resource':
            content_type = ContentType.objects.get_for_model(Resource)
        elif target_type == 'comment':
            content_type = ContentType.objects.get_for_model(Comment)
        else:
            return Response({'error': 'Invalid target type'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 신고 생성
        report = Report.objects.create(
            reporter=request.user,
            content_type=content_type,
            object_id=target_id,
            reason_id=request.data['reasonId'],
            reason_label=request.data['reasonLabel'],
            detail=request.data.get('detail'),
        )
        
        # 자동 숨김 처리 (신고 5건 이상)
        report_count = Report.objects.filter(
            content_type=content_type,
            object_id=target_id,
            status='pending',
        ).count()
        
        if report_count >= 5:
            if target_type == 'shared_roadmap':
                SharedRoadmap.objects.filter(id=target_id).update(is_hidden=True)
            elif target_type == 'resource':
                Resource.objects.filter(id=target_id).update(is_hidden=True)
            elif target_type == 'comment':
                Comment.objects.filter(id=target_id).update(is_hidden=True)
        
        serializer = ReportSerializer(report)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
```

---

## 7. 보안 및 권한 관리

### 7.1 인증 (Authentication)

#### 7.1.1 JWT 토큰 설정

```python
# config/settings/base.py
from datetime import timedelta

INSTALLED_APPS = [
    # ...
    'rest_framework',
    'rest_framework_simplejwt',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}
```

#### 7.1.2 비밀번호 해싱

Django는 기본적으로 PBKDF2 해싱을 사용합니다.

```python
# config/settings/base.py
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
    'django.contrib.auth.hashers.Argon2PasswordHasher',
    'django.contrib.auth.hashers.BCryptSHA256PasswordHasher',
]

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]
```

### 7.2 권한 관리 (Authorization)

#### 7.2.1 커스텀 Permission 클래스

```python
# apps/roadmaps/permissions.py
from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """소유자만 수정·삭제 가능"""
    
    def has_object_permission(self, request, view, obj):
        # 읽기 권한은 모두 허용
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # 쓰기 권한은 소유자만
        return obj.user == request.user

class IsSpaceCreatorOrReadOnly(permissions.BasePermission):
    """스페이스 생성자만 수정·삭제 가능"""
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return obj.creator == request.user
```

#### 7.2.2 ViewSet에 Permission 적용

```python
# apps/roadmaps/views.py
class RoadmapViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        return Roadmap.objects.filter(user=self.request.user)

# apps/spaces/views.py
class SpaceViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsSpaceCreatorOrReadOnly]
```

### 7.3 데이터 보호

#### 7.3.1 CORS 설정

```python
# config/settings/base.py
INSTALLED_APPS = [
    # ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ...
]

# 개발 환경
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]

# 프로덕션 환경
CORS_ALLOWED_ORIGINS = [
    'https://aicareerpath.com',
    'https://www.aicareerpath.com',
]

CORS_ALLOW_CREDENTIALS = True
```

#### 7.3.2 Rate Limiting

```bash
pip install django-ratelimit
```

```python
# apps/accounts/views.py
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator

class LoginView(APIView):
    @method_decorator(ratelimit(key='ip', rate='5/m', method='POST'))
    def post(self, request):
        # 로그인 로직
        pass
```

---

## 8. 성능 최적화 전략

### 8.1 데이터베이스 최적화

#### 8.1.1 인덱스 전략

Django 모델에서 `db_index=True` 또는 `indexes` 옵션 사용:

```python
# apps/roadmaps/models.py
class Roadmap(models.Model):
    # ...
    
    class Meta:
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['period']),
        ]
```

#### 8.1.2 쿼리 최적화 (select_related, prefetch_related)

```python
# apps/roadmaps/views.py
class RoadmapViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        return Roadmap.objects.select_related('user').prefetch_related(
            'items__todos',
            'milestones',
        )
```

### 8.2 캐싱 전략

#### 8.2.1 Redis 캐싱 설정

```python
# config/settings/base.py
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'KEY_PREFIX': 'dreammate',
        'TIMEOUT': 300,  # 5분
    }
}
```

#### 8.2.2 캐싱 적용

```python
# apps/roadmaps/views.py
from django.core.cache import cache

class RoadmapViewSet(viewsets.ModelViewSet):
    def retrieve(self, request, *args, **kwargs):
        """로드맵 상세 조회 (캐싱)"""
        cache_key = f"roadmap:{kwargs['pk']}"
        
        # 캐시 조회
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)
        
        # DB 조회
        roadmap = self.get_object()
        serializer = RoadmapDetailSerializer(roadmap)
        
        # 캐시 저장 (5분)
        cache.set(cache_key, serializer.data, 300)
        
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        """로드맵 수정 (캐시 무효화)"""
        response = super().update(request, *args, **kwargs)
        
        # 캐시 삭제
        cache_key = f"roadmap:{kwargs['pk']}"
        cache.delete(cache_key)
        
        return response
```

### 8.3 페이지네이션

```python
# apps/roadmaps/views.py
from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'limit'
    max_page_size = 100

class RoadmapViewSet(viewsets.ModelViewSet):
    pagination_class = StandardResultsSetPagination
```

---

## 9. 배포 및 확장성

### 9.1 Docker 컨테이너화

#### 9.1.1 Dockerfile

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# 시스템 의존성 설치
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Python 의존성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드 복사
COPY . .

# 정적 파일 수집
RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4"]
```

#### 9.1.2 Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: dreammate
      POSTGRES_USER: dreammate
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  web:
    build: .
    command: gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4
    volumes:
      - .:/app
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://dreammate:password@db:5432/dreammate
      - REDIS_URL=redis://redis:6379/1
      - SECRET_KEY=${SECRET_KEY}
      - DEBUG=False
    depends_on:
      - db
      - redis

  celery:
    build: .
    command: celery -A config worker -l info
    volumes:
      - .:/app
    environment:
      - DATABASE_URL=postgresql://dreammate:password@db:5432/dreammate
      - REDIS_URL=redis://redis:6379/1
    depends_on:
      - db
      - redis

volumes:
  postgres_data:
  redis_data:
```

### 9.2 Gunicorn + Nginx

#### 9.2.1 Gunicorn 설정

```python
# gunicorn_config.py
bind = "0.0.0.0:8000"
workers = 4
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2
```

#### 9.2.2 Nginx 설정

```nginx
# nginx.conf
upstream django {
    server web:8000;
}

server {
    listen 80;
    server_name api.aicareerpath.com;

    location / {
        proxy_pass http://django;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /app/staticfiles/;
    }

    location /media/ {
        alias /app/media/;
    }
}
```

### 9.3 Celery 비동기 작업

#### 9.3.1 Celery 설정

```python
# config/celery.py
from celery import Celery
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')

app = Celery('dreammate')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# config/settings/base.py
CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'Asia/Seoul'
```

#### 9.3.2 비동기 작업 예시

```python
# apps/notifications/tasks.py
from celery import shared_task
from django.core.mail import send_mail

@shared_task
def send_comment_notification(user_id, roadmap_title, commenter_name):
    """댓글 알림 이메일 발송"""
    from apps.accounts.models import User
    
    user = User.objects.get(id=user_id)
    
    send_mail(
        subject=f'새 댓글이 달렸어요: {roadmap_title}',
        message=f'{commenter_name}님이 댓글을 남겼습니다.',
        from_email='noreply@aicareerpath.com',
        recipient_list=[user.email],
        fail_silently=False,
    )
```

---

## 10. 부록

### 10.1 환경 변수 (.env)

```bash
# Django
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=api.aicareerpath.com,localhost

# 데이터베이스
DATABASE_URL=postgresql://user:password@localhost:5432/dreammate

# Redis
REDIS_URL=redis://localhost:6379/1

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=dreammate-files
AWS_REGION=ap-northeast-2

# 이메일 (SendGrid)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=your-sendgrid-api-key
DEFAULT_FROM_EMAIL=noreply@aicareerpath.com

# Sentry
SENTRY_DSN=https://xxx@sentry.io/xxx

# CORS
CORS_ALLOWED_ORIGINS=https://aicareerpath.com,https://www.aicareerpath.com
```

### 10.2 requirements.txt

```
Django==5.0.3
djangorestframework==3.15.1
djangorestframework-simplejwt==5.3.1
django-cors-headers==4.3.1
django-redis==5.4.0
psycopg2-binary==2.9.9
boto3==1.34.69
celery==5.3.6
redis==5.0.3
gunicorn==21.2.0
sentry-sdk==1.43.0
django-ratelimit==4.1.0
Pillow==10.2.0
```

### 10.3 마이그레이션

```bash
# 마이그레이션 생성
python manage.py makemigrations

# 마이그레이션 적용
python manage.py migrate

# 특정 앱만 마이그레이션
python manage.py migrate roadmaps

# 마이그레이션 롤백
python manage.py migrate roadmaps 0001
```

### 10.4 테스트

```python
# apps/roadmaps/tests.py
from django.test import TestCase
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.roadmaps.models import Roadmap

class RoadmapAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            name='테스트 유저',
        )
        self.client.force_authenticate(user=self.user)
    
    def test_create_roadmap(self):
        """로드맵 생성 테스트"""
        data = {
            'title': '테스트 로드맵',
            'description': '테스트 설명',
            'period': 'afterschool',
            'items': [],
        }
        response = self.client.post('/api/v1/dreammate/roadmaps/', data, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Roadmap.objects.count(), 1)
    
    def test_list_roadmaps(self):
        """로드맵 목록 조회 테스트"""
        Roadmap.objects.create(
            user=self.user,
            title='테스트 로드맵',
            description='테스트 설명',
            period='afterschool',
        )
        response = self.client.get('/api/v1/dreammate/roadmaps/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['results']), 1)
```

```bash
# 테스트 실행
python manage.py test

# 특정 앱만 테스트
python manage.py test apps.roadmaps

# 커버리지 측정
pip install coverage
coverage run --source='.' manage.py test
coverage report
```

---

## 11. 결론

본 문서는 AI CareerPath의 **커리어 실행(DreamMate)** 기능에 대한 Django 기반 백엔드 및 데이터베이스 설계를 상세히 다루었습니다.

### 11.1 핵심 요약

1. **6가지 핵심 기능**:
   - 로드맵 CRUD
   - 주차별 TODO 관리
   - 드림 라이브러리
   - 드림 스페이스 (그룹만, 학교 없음)
   - 댓글 시스템
   - 신고 시스템

2. **데이터베이스 설계**:
   - PostgreSQL 16개 모델
   - GenericForeignKey 활용 (댓글·반응·신고)
   - ArrayField 활용 (태그·공유 채널)

3. **API 설계**:
   - Django REST Framework (DRF)
   - JWT 인증
   - Permission 클래스 권한 관리

4. **성능 최적화**:
   - Redis 캐싱
   - select_related / prefetch_related
   - 페이지네이션

5. **보안**:
   - PBKDF2 비밀번호 해싱
   - CORS 설정
   - Rate Limiting

### 11.2 커리어 패스와의 차이점

| 항목 | 커리어 패스 (Career Path) | 커리어 실행 (DreamMate) |
|------|---------------------------|-------------------------|
| **목적** | 장기 진로 계획 (3년 이상) | 단기 실행 계획 (3개월 이내) |
| **구조** | 학년별 (초3~대학생) | 주차별 (1~8주) |
| **커뮤니티** | 학교 + 그룹 | 그룹만 (학교 없음) |
| **핵심 기능** | 목표-활동 그룹핑 | TODO 체크리스트 + 회고 |
| **결과물** | 포트폴리오·수상 기록 | 마일스톤 + 최종 결과물 |
| **백엔드** | Node.js + Express | Django + DRF |

### 11.3 다음 단계

1. **Phase 1 (MVP)**:
   - 로드맵 CRUD 구현
   - 주차별 TODO 관리
   - 기본 공유 기능 (전체 공유)

2. **Phase 2 (커뮤니티)**:
   - 드림 스페이스 (그룹) 구현
   - 댓글 시스템 구현
   - 좋아요·북마크 기능

3. **Phase 3 (라이브러리)**:
   - 드림 라이브러리 구현
   - MD·PDF 뷰어
   - 파일 업로드 (S3)

4. **Phase 4 (고도화)**:
   - 신고 시스템 구현
   - 알림 시스템 (Celery)
   - 실시간 기능 (Django Channels)

---

**문서 버전**: 1.0.0  
**최종 수정일**: 2026-03-27  
**작성자**: AI Assistant  
**검토자**: (추후 기입)
