# 커리어 실행(DreamMate) Django 백엔드 DB 설계서

> **작성일**: 2026-03-27  
> **목적**: AI CareerPath DreamMate 기능의 Django 기반 데이터베이스 상세 설계  
> **분석 대상**: `/frontend/app/dreammate` 및 관련 JSON 데이터  
> **백엔드 프레임워크**: Django 5.0 + Django REST Framework + PostgreSQL 15

---

## 목차

1. [개요](#1-개요)
2. [데이터베이스 아키텍처](#2-데이터베이스-아키텍처)
3. [Django 모델 상세 설계](#3-django-모델-상세-설계)
4. [인덱스 및 쿼리 최적화](#4-인덱스-및-쿼리-최적화)
5. [마이그레이션 전략](#5-마이그레이션-전략)
6. [데이터 무결성 및 제약조건](#6-데이터-무결성-및-제약조건)
7. [성능 최적화](#7-성능-최적화)
8. [백업 및 복구](#8-백업-및-복구)

---

## 1. 개요

### 1.1 시스템 목적

**DreamMate (커리어 실행)**는 학생들이 단기 실행 계획(방과후·방학·학기)을 수립하고, 주차별 TODO를 관리하며, 실행 결과를 기록하고, 그룹 커뮤니티와 공유하는 시스템입니다.

### 1.2 핵심 데이터 엔티티

1. **User** - 사용자 (학생·선생님·관리자)
2. **Group** - 사용자 그룹 (학교 없음, 그룹만 존재)
3. **Roadmap** - 개인 로드맵 (실행 계획)
4. **RoadmapItem** - 로드맵 활동 항목
5. **RoadmapTodo** - 주차별 TODO (week-by-week)
6. **RoadmapMilestone** - 실행 결과 기록
7. **DreamResource** - 드림 라이브러리 (자료)
8. **DreamSpace** - 드림 스페이스 (그룹 프로그램)
9. **SharedRoadmap** - 공유된 로드맵
10. **Comment** - 댓글
11. **Reaction** - 좋아요·북마크
12. **Report** - 신고

### 1.3 Career Path와의 차이점

| 항목 | Career Path | DreamMate |
|------|-------------|-----------|
| 기간 | 장기 (3년 이상) | 단기 (방과후·방학·학기) |
| 단위 | 학년별·월별 | 주차별 (week-by-week) |
| 구조 | 학년 → 목표 → 활동 | 로드맵 → 활동 → TODO |
| 커뮤니티 | 학교 + 그룹 | **그룹만** (학교 없음) |
| 추가 기능 | 템플릿 | 드림 라이브러리, 드림 스페이스 |

### 1.4 데이터베이스 선택 이유

**PostgreSQL 15+**:
- JSON/JSONB 필드 지원
- Array 필드 지원
- Full-text search 지원
- Django ORM 완벽 호환

---

## 2. 데이터베이스 아키텍처

### 2.1 전체 ERD

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USERS (사용자)                             │
│  - id (PK)                                                           │
│  - email (UNIQUE)                                                    │
│  - password_hash                                                     │
│  - name, emoji, grade_id                                             │
│  - role (student | teacher | admin)                                  │
│  - school_id (NULL) ◄─── 학교 개념 없음                              │
└────────────┬────────────────────────────────────────────────────────┘
             │
             │
    ┌────────▼────────┐
    │     GROUPS      │ ◄─── 학교 없음, 그룹만 존재
    │  - id (PK)      │
    │  - name         │
    │  - creator_id   │
    │  - invite_code  │
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │ GROUP_MEMBERS   │
    │  - group_id (FK)│
    │  - user_id (FK) │
    │  - role         │
    └─────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       ROADMAPS (로드맵)                              │
│  - id (PK)                                                           │
│  - user_id (FK → users)                                              │
│  - title, description                                                │
│  - period (afterschool | vacation | semester)                        │
│  - star_color                                                        │
│  - focus_item_types (ARRAY)                                          │
│  - final_result_title, final_result_description                      │
│  - final_result_url, final_result_image_url                          │
└────────────┬────────────────────────────────────────────────────────┘
             │
             │ 1:N
             │
    ┌────────▼────────┐
    │ ROADMAP_ITEMS   │ ◄─── 활동·수상·프로젝트·논문
    │  - id (PK)      │
    │  - roadmap      │
    │  - type         │
    │  - title        │
    │  - months (ARRAY)│
    │  - difficulty   │
    │  - target_output│
    │  - success_crit │
    └────────┬────────┘
             │
             │ 1:N
             │
    ┌────────▼────────┐
    │ ROADMAP_TODOS   │ ◄─── 주차별 TODO (week-by-week)
    │  - id (PK)      │
    │  - roadmap_item │
    │  - week_label   │
    │  - week_number  │
    │  - entry_type   │ (goal | task)
    │  - title        │
    │  - is_done      │
    │  - note         │
    │  - output_ref   │
    └─────────────────┘

    ┌────────▼────────┐
    │ROADMAP_MILESTONES│ ◄─── 실행 결과 기록
    │  - id (PK)      │
    │  - roadmap      │
    │  - title        │
    │  - description  │
    │  - month_week   │
    │  - time_log     │
    │  - result_url   │
    │  - image_url    │
    │  - recorded_at  │
    └─────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                 DREAM_RESOURCES (드림 라이브러리)                    │
│  - id (PK)                                                           │
│  - user_id (FK → users)                                              │
│  - type (portfolio | guide | template)                               │
│  - title, description                                                │
│  - file_url, thumbnail_url                                           │
│  - tags (ARRAY)                                                      │
│  - like_count, bookmark_count, download_count                        │
└────────────┬────────────────────────────────────────────────────────┘
             │
             │ 1:N
             │
    ┌────────▼────────┐
    │RESOURCE_SECTIONS│ ◄─── 자료 섹션 (가이드·템플릿)
    │  - id (PK)      │
    │  - resource     │
    │  - title        │
    │  - content      │
    │  - sort_order   │
    └─────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                  DREAM_SPACES (드림 스페이스)                        │
│  - id (PK)                                                           │
│  - group_id (FK → groups)                                            │
│  - title, description                                                │
│  - program_type (class | project | mentoring)                        │
│  - recruitment_status (open | closed)                                │
│  - max_participants, current_participants                            │
│  - start_date, end_date                                              │
└────────────┬────────────────────────────────────────────────────────┘
             │
             │ 1:N
             │
    ┌────────▼────────┐
    │SPACE_PARTICIPANTS│ ◄─── 참여자
    │  - id (PK)      │
    │  - space        │
    │  - user_id      │
    │  - status       │ (applied | approved | confirmed | inProgress)
    │  - applied_at   │
    └─────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                  SHARED_ROADMAPS (공유된 로드맵)                     │
│  - id (PK)                                                           │
│  - roadmap_id (FK → roadmaps)                                        │
│  - user_id (FK → users)                                              │
│  - share_type (private | public | space)                             │
│  - tags (ARRAY)                                                      │
│  - like_count, bookmark_count, view_count, comment_count            │
└────────────┬───────────────────────────────┬────────────────────────┘
             │                               │
             │ M:N                           │ 1:N
             │                               │
    ┌────────▼────────┐             ┌────────▼────────┐
    │SHARED_ROADMAP_  │             │   COMMENTS      │
    │   GROUPS        │             │  - id (PK)      │
    │  - shared_road  │             │  - content_type │
    │  - group_id (FK)│             │  - object_id    │
    └─────────────────┘             │  - user_id      │
                                    │  - parent_id    │
                                    │  - content      │
                                    └─────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       REACTIONS (좋아요·북마크)                      │
│  - id (PK)                                                           │
│  - user_id (FK → users)                                              │
│  - content_type_id (FK → django_content_type)                        │
│  - object_id (UUID)                                                  │
│  - reaction_type (like | bookmark)                                   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          REPORTS (신고)                              │
│  - id (PK)                                                           │
│  - reporter_id (FK → users)                                          │
│  - content_type_id (FK → django_content_type)                        │
│  - object_id (UUID)                                                  │
│  - reason_id, reason_label, detail                                   │
│  - status (pending | reviewed | resolved | rejected)                 │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 테이블 관계 요약

| 관계 | 부모 | 자식 | 타입 | 삭제 규칙 |
|------|------|------|------|-----------|
| 사용자-그룹 | users, groups | group_members | M:N | CASCADE |
| 사용자-로드맵 | users | roadmaps | 1:N | CASCADE |
| 로드맵-활동 | roadmaps | roadmap_items | 1:N | CASCADE |
| 활동-TODO | roadmap_items | roadmap_todos | 1:N | CASCADE |
| 로드맵-마일스톤 | roadmaps | roadmap_milestones | 1:N | CASCADE |
| 사용자-자료 | users | dream_resources | 1:N | CASCADE |
| 자료-섹션 | dream_resources | resource_sections | 1:N | CASCADE |
| 그룹-스페이스 | groups | dream_spaces | 1:N | CASCADE |
| 스페이스-참여자 | dream_spaces | space_participants | 1:N | CASCADE |
| 로드맵-공유 | roadmaps | shared_roadmaps | 1:N | CASCADE |
| 공유-그룹 | shared_roadmaps, groups | shared_roadmap_groups | M:N | CASCADE |

---

## 3. Django 모델 상세 설계

### 3.1 User (사용자)

```python
# apps/accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import EmailValidator, MinLengthValidator
import uuid

class User(AbstractUser):
    """
    사용자 모델 (학생·선생님·관리자)
    
    DreamMate는 학교 개념이 없으므로 school 필드는 NULL
    """
    
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    
    email = models.EmailField(
        unique=True,
        validators=[EmailValidator()]
    )
    password = models.CharField(
        max_length=128,
        validators=[MinLengthValidator(8)]
    )
    
    name = models.CharField(max_length=100)
    emoji = models.CharField(max_length=10, default='👤')
    grade_id = models.CharField(max_length=20, blank=True, null=True)
    profile_image_url = models.URLField(blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    
    ROLE_CHOICES = [
        ('student', '학생'),
        ('teacher', '선생님'),
        ('admin', '관리자'),
    ]
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='student'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login_at = models.DateTimeField(blank=True, null=True)
    
    is_active = models.BooleanField(default=True)
    is_email_verified = models.BooleanField(default=False)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'name']
    
    class Meta:
        db_table = 'users'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email'], name='idx_dm_users_email'),
            models.Index(fields=['grade_id'], name='idx_dm_users_grade'),
            models.Index(fields=['role'], name='idx_dm_users_role'),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.email})"
```

### 3.2 Group (그룹)

```python
# apps/groups/models.py
from django.db import models
from django.contrib.postgres.fields import ArrayField
import uuid

class Group(models.Model):
    """
    사용자 그룹 모델
    
    DreamMate는 학교 개념이 없고 그룹만 존재
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    name = models.CharField(max_length=200)
    emoji = models.CharField(max_length=10, default='👥')
    description = models.TextField()
    color = models.CharField(max_length=20, default='#6C5CE7')
    
    creator = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='created_groups'
    )
    
    invite_code = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
        null=True
    )
    
    member_count = models.IntegerField(default=1)
    shared_roadmap_count = models.IntegerField(default=0)
    
    tags = ArrayField(
        models.CharField(max_length=50),
        default=list
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'groups'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['creator'], name='idx_dm_groups_creator'),
            models.Index(fields=['invite_code'], name='idx_dm_groups_invite'),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.emoji})"


class GroupMember(models.Model):
    """그룹 멤버 (M:N)"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        related_name='memberships'
    )
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='group_memberships'
    )
    
    ROLE_CHOICES = [
        ('creator', '생성자'),
        ('operator', '운영자'),
        ('member', '멤버'),
    ]
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='member'
    )
    
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'group_members'
        unique_together = ['group', 'user']
        indexes = [
            models.Index(fields=['group'], name='idx_dm_gm_group'),
            models.Index(fields=['user'], name='idx_dm_gm_user'),
        ]
    
    def __str__(self):
        return f"{self.user.name} in {self.group.name}"
```

### 3.3 Roadmap (로드맵)

```python
# apps/roadmaps/models.py
from django.db import models
from django.contrib.postgres.fields import ArrayField
import uuid

class Roadmap(models.Model):
    """
    로드맵 (개인 실행 계획)
    
    - 단기 실행 계획 (방과후·방학·학기)
    - 주차별 TODO 관리
    - 최종 결과물 기록
    """
    
    PERIOD_CHOICES = [
        ('afterschool', '방과후'),
        ('vacation', '방학'),
        ('semester', '학기'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='roadmaps'
    )
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    
    period = models.CharField(
        max_length=20,
        choices=PERIOD_CHOICES,
        help_text="실행 기간 (방과후·방학·학기)"
    )
    
    star_color = models.CharField(
        max_length=20,
        default='#6C5CE7',
        help_text="적성 색상 (HEX)"
    )
    
    # 집중 활동 유형 (배열)
    focus_item_types = ArrayField(
        models.CharField(max_length=20),
        blank=True,
        default=list,
        help_text="집중 활동 유형 (예: ['award', 'activity', 'project'])"
    )
    
    # 최종 결과물
    final_result_title = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text="최종 결과물 제목"
    )
    final_result_description = models.TextField(
        blank=True,
        null=True,
        help_text="최종 결과물 설명"
    )
    final_result_url = models.URLField(
        blank=True,
        null=True,
        help_text="최종 결과물 URL"
    )
    final_result_image_url = models.URLField(
        blank=True,
        null=True,
        help_text="최종 결과물 이미지 URL (S3)"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'roadmaps'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at'], name='idx_dm_roadmaps_user_created'),
            models.Index(fields=['period'], name='idx_dm_roadmaps_period'),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.user.name})"
    
    @property
    def item_count(self):
        """활동 수"""
        return self.items.count()
    
    @property
    def completed_todo_count(self):
        """완료된 TODO 수"""
        return RoadmapTodo.objects.filter(
            roadmap_item__roadmap=self,
            is_done=True
        ).count()
    
    @property
    def total_todo_count(self):
        """전체 TODO 수"""
        return RoadmapTodo.objects.filter(
            roadmap_item__roadmap=self
        ).count()
```

### 3.4 RoadmapItem (로드맵 활동)

```python
# apps/roadmaps/models.py
class RoadmapItem(models.Model):
    """
    로드맵 활동 항목
    
    - 활동·수상·프로젝트·논문
    - 월별 실행 계획
    - 목표 산출물·성공 기준
    """
    
    TYPE_CHOICES = [
        ('activity', '활동'),
        ('award', '수상·대회'),
        ('project', '프로젝트'),
        ('paper', '논문·연구'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    roadmap = models.ForeignKey(
        Roadmap,
        on_delete=models.CASCADE,
        related_name='items'
    )
    
    type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES
    )
    
    title = models.CharField(max_length=300)
    
    # 실행 월 (배열)
    months = ArrayField(
        models.IntegerField(),
        default=list,
        help_text="실행 월 (예: [3, 4, 5])"
    )
    
    difficulty = models.IntegerField(
        default=1,
        help_text="난이도 (1~5)"
    )
    
    # 목표 산출물
    target_output = models.TextField(
        blank=True,
        null=True,
        help_text="목표 산출물 (예: GitHub 저장소 + README)"
    )
    
    # 성공 기준
    success_criteria = models.TextField(
        blank=True,
        null=True,
        help_text="성공 기준 (예: 실제 대화 10회 이상 테스트)"
    )
    
    sort_order = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'roadmap_items'
        ordering = ['sort_order', 'created_at']
        indexes = [
            models.Index(fields=['roadmap', 'sort_order'], name='idx_dm_ri_roadmap_order'),
            models.Index(fields=['type'], name='idx_dm_ri_type'),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.type})"
    
    @property
    def completed_todo_count(self):
        """완료된 TODO 수"""
        return self.todos.filter(is_done=True).count()
    
    @property
    def total_todo_count(self):
        """전체 TODO 수"""
        return self.todos.count()
```

### 3.5 RoadmapTodo (주차별 TODO)

```python
# apps/roadmaps/models.py
class RoadmapTodo(models.Model):
    """
    주차별 TODO (week-by-week)
    
    - 활동을 주차별로 쪼갠 실행 항목
    - goal (목표) vs task (작업) 구분
    - 완료 여부·메모·산출물 참조
    """
    
    ENTRY_TYPE_CHOICES = [
        ('goal', '목표'),
        ('task', '작업'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    roadmap_item = models.ForeignKey(
        RoadmapItem,
        on_delete=models.CASCADE,
        related_name='todos'
    )
    
    week_label = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="주차 라벨 (예: 3월 1주차)"
    )
    
    week_number = models.IntegerField(
        blank=True,
        null=True,
        help_text="주차 번호 (예: 1, 2, 3...)"
    )
    
    entry_type = models.CharField(
        max_length=20,
        choices=ENTRY_TYPE_CHOICES,
        default='task',
        help_text="항목 유형 (goal: 목표, task: 작업)"
    )
    
    title = models.CharField(max_length=300)
    
    is_done = models.BooleanField(
        default=False,
        help_text="완료 여부"
    )
    
    note = models.TextField(
        blank=True,
        null=True,
        help_text="메모 (완료 후 기록)"
    )
    
    output_ref = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        help_text="산출물 참조 (예: python_basic_slides.pdf)"
    )
    
    sort_order = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'roadmap_todos'
        ordering = ['week_number', 'sort_order', 'created_at']
        indexes = [
            models.Index(fields=['roadmap_item', 'week_number'], name='idx_dm_rt_item_week'),
            models.Index(fields=['is_done'], name='idx_dm_rt_done'),
        ]
    
    def __str__(self):
        status = '✓' if self.is_done else '○'
        return f"{status} {self.title} ({self.week_label})"
```

### 3.6 RoadmapMilestone (실행 결과 기록)

```python
# apps/roadmaps/models.py
class RoadmapMilestone(models.Model):
    """
    실행 결과 기록 (마일스톤)
    
    - 로드맵 실행 중 중요한 성과 기록
    - 시간 투입·결과물·이미지 첨부
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    roadmap = models.ForeignKey(
        Roadmap,
        on_delete=models.CASCADE,
        related_name='milestones'
    )
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    
    month_week_label = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="월·주차 라벨 (예: 3월 2주차)"
    )
    
    time_log = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="투입 시간 (예: 총 12시간)"
    )
    
    result_url = models.URLField(
        blank=True,
        null=True,
        help_text="결과물 URL"
    )
    
    image_url = models.URLField(
        blank=True,
        null=True,
        help_text="이미지 URL (S3)"
    )
    
    recorded_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="기록 일시"
    )
    
    sort_order = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'roadmap_milestones'
        ordering = ['sort_order', '-recorded_at']
        indexes = [
            models.Index(fields=['roadmap', 'sort_order'], name='idx_dm_rm_roadmap_order'),
            models.Index(fields=['-recorded_at'], name='idx_dm_rm_recorded'),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.roadmap.title})"
```

### 3.7 DreamResource (드림 라이브러리)

```python
# apps/resources/models.py
from django.db import models
from django.contrib.postgres.fields import ArrayField
import uuid

class DreamResource(models.Model):
    """
    드림 라이브러리 (자료)
    
    - 포트폴리오·가이드·템플릿
    - 파일 업로드 (S3)
    - 좋아요·북마크·다운로드 수
    """
    
    TYPE_CHOICES = [
        ('portfolio', '포트폴리오'),
        ('guide', '가이드'),
        ('template', '템플릿'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='dream_resources'
    )
    
    type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES
    )
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    
    # 파일
    file_url = models.URLField(
        blank=True,
        null=True,
        help_text="파일 URL (S3)"
    )
    thumbnail_url = models.URLField(
        blank=True,
        null=True,
        help_text="썸네일 URL (S3)"
    )
    
    # 태그
    tags = ArrayField(
        models.CharField(max_length=50),
        default=list
    )
    
    # 통계
    like_count = models.IntegerField(default=0)
    bookmark_count = models.IntegerField(default=0)
    download_count = models.IntegerField(default=0)
    view_count = models.IntegerField(default=0)
    comment_count = models.IntegerField(default=0)
    
    # 공유 설정
    SHARE_TYPE_CHOICES = [
        ('private', '비공개'),
        ('public', '전체 공유'),
        ('space', '그룹 공유'),
    ]
    share_type = models.CharField(
        max_length=20,
        choices=SHARE_TYPE_CHOICES,
        default='private'
    )
    
    is_hidden = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'dream_resources'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at'], name='idx_dm_dr_user_created'),
            models.Index(fields=['type'], name='idx_dm_dr_type'),
            models.Index(fields=['share_type'], name='idx_dm_dr_share_type'),
            models.Index(fields=['-like_count'], name='idx_dm_dr_likes'),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.type})"


class ResourceSection(models.Model):
    """
    자료 섹션 (가이드·템플릿 내부 구조)
    
    - 가이드·템플릿은 여러 섹션으로 구성
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    resource = models.ForeignKey(
        DreamResource,
        on_delete=models.CASCADE,
        related_name='sections'
    )
    
    title = models.CharField(max_length=200)
    content = models.TextField()
    
    sort_order = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'resource_sections'
        ordering = ['sort_order', 'created_at']
        indexes = [
            models.Index(fields=['resource', 'sort_order'], name='idx_dm_rs_resource_order'),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.resource.title})"
```

### 3.8 DreamSpace (드림 스페이스)

```python
# apps/spaces/models.py
from django.db import models
import uuid

class DreamSpace(models.Model):
    """
    드림 스페이스 (그룹 프로그램)
    
    - 그룹 내에서 운영하는 프로그램
    - 수업형·프로젝트형·멘토링형
    - 참여자 모집·승인·진행
    """
    
    PROGRAM_TYPE_CHOICES = [
        ('class', '수업형'),
        ('project', '프로젝트형'),
        ('mentoring', '멘토링형'),
    ]
    
    RECRUITMENT_STATUS_CHOICES = [
        ('open', '모집중'),
        ('closed', '모집마감'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    group = models.ForeignKey(
        'groups.Group',
        on_delete=models.CASCADE,
        related_name='dream_spaces'
    )
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    program_type = models.CharField(
        max_length=20,
        choices=PROGRAM_TYPE_CHOICES
    )
    
    recruitment_status = models.CharField(
        max_length=20,
        choices=RECRUITMENT_STATUS_CHOICES,
        default='open'
    )
    
    max_participants = models.IntegerField(
        blank=True,
        null=True,
        help_text="최대 참여자 수 (NULL이면 무제한)"
    )
    
    current_participants = models.IntegerField(
        default=0,
        help_text="현재 참여자 수"
    )
    
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'dream_spaces'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['group'], name='idx_dm_ds_group'),
            models.Index(fields=['program_type'], name='idx_dm_ds_program_type'),
            models.Index(fields=['recruitment_status'], name='idx_dm_ds_recruitment'),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.group.name})"


class SpaceParticipant(models.Model):
    """
    드림 스페이스 참여자
    
    - 신청 → 승인 → 참여 확정 → 진행 체크
    """
    
    STATUS_CHOICES = [
        ('applied', '신청'),
        ('approved', '승인'),
        ('confirmed', '참여 확정'),
        ('inProgress', '진행 체크'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    space = models.ForeignKey(
        DreamSpace,
        on_delete=models.CASCADE,
        related_name='participants'
    )
    
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='space_participations'
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='applied'
    )
    
    applied_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(blank=True, null=True)
    confirmed_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        db_table = 'space_participants'
        unique_together = ['space', 'user']
        ordering = ['applied_at']
        indexes = [
            models.Index(fields=['space', 'status'], name='idx_dm_sp_space_status'),
            models.Index(fields=['user'], name='idx_dm_sp_user'),
        ]
    
    def __str__(self):
        return f"{self.user.name} in {self.space.title} ({self.status})"
```

### 3.9 SharedRoadmap (공유된 로드맵)

```python
# apps/roadmaps/models.py
class SharedRoadmap(models.Model):
    """
    공유된 로드맵
    
    - 개인 로드맵을 커뮤니티에 공유
    - 공유 유형: 전체 공유(public), 그룹 공유(space)
    - 학교 공유 없음 (DreamMate는 그룹만 존재)
    """
    
    SHARE_TYPE_CHOICES = [
        ('private', '비공개'),
        ('public', '전체 공유'),
        ('space', '그룹 공유'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    roadmap = models.ForeignKey(
        Roadmap,
        on_delete=models.CASCADE,
        related_name='shared_instances'
    )
    
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='shared_roadmaps'
    )
    
    share_type = models.CharField(
        max_length=20,
        choices=SHARE_TYPE_CHOICES,
        default='private'
    )
    
    description = models.TextField(blank=True, null=True)
    
    tags = ArrayField(
        models.CharField(max_length=50),
        blank=True,
        default=list
    )
    
    # 통계
    like_count = models.IntegerField(default=0)
    bookmark_count = models.IntegerField(default=0)
    view_count = models.IntegerField(default=0)
    comment_count = models.IntegerField(default=0)
    
    shared_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    is_hidden = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'shared_roadmaps'
        ordering = ['-shared_at']
        indexes = [
            models.Index(fields=['user', '-shared_at'], name='idx_dm_sr_user_shared'),
            models.Index(fields=['roadmap'], name='idx_dm_sr_roadmap'),
            models.Index(fields=['share_type'], name='idx_dm_sr_share_type'),
            models.Index(fields=['-like_count'], name='idx_dm_sr_likes'),
        ]
    
    def __str__(self):
        return f"Shared: {self.roadmap.title} ({self.share_type})"


class SharedRoadmapGroup(models.Model):
    """
    공유 로드맵 - 그룹 연결 (M:N)
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    shared_roadmap = models.ForeignKey(
        SharedRoadmap,
        on_delete=models.CASCADE,
        related_name='group_links'
    )
    
    group = models.ForeignKey(
        'groups.Group',
        on_delete=models.CASCADE,
        related_name='shared_roadmap_links'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'shared_roadmap_groups'
        unique_together = ['shared_roadmap', 'group']
        indexes = [
            models.Index(fields=['shared_roadmap'], name='idx_dm_srg_shared_roadmap'),
            models.Index(fields=['group'], name='idx_dm_srg_group'),
        ]
    
    def __str__(self):
        return f"{self.shared_roadmap.roadmap.title} → {self.group.name}"
```

### 3.10 Comment (댓글)

```python
# apps/comments/models.py
from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
import uuid

class Comment(models.Model):
    """
    범용 댓글 모델 (GenericForeignKey)
    
    - SharedRoadmap, DreamResource 등에 댓글 가능
    - 대댓글 지원
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='comments'
    )
    
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name='replies'
    )
    
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
            models.Index(fields=['content_type', 'object_id'], name='idx_dm_comments_target'),
            models.Index(fields=['user'], name='idx_dm_comments_user'),
            models.Index(fields=['parent'], name='idx_dm_comments_parent'),
        ]
    
    def __str__(self):
        return f"Comment by {self.user.name}"
```

### 3.11 Reaction (좋아요·북마크)

```python
# apps/reactions/models.py
from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
import uuid

class Reaction(models.Model):
    """
    범용 반응 모델 (좋아요·북마크)
    """
    
    REACTION_TYPE_CHOICES = [
        ('like', '좋아요'),
        ('bookmark', '북마크'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='reactions'
    )
    
    reaction_type = models.CharField(
        max_length=20,
        choices=REACTION_TYPE_CHOICES
    )
    
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.UUIDField()
    content_object = GenericForeignKey('content_type', 'object_id')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'reactions'
        unique_together = ['user', 'content_type', 'object_id', 'reaction_type']
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'reaction_type'], name='idx_dm_reactions_user_type'),
            models.Index(fields=['content_type', 'object_id'], name='idx_dm_reactions_target'),
        ]
    
    def __str__(self):
        return f"{self.user.name} {self.reaction_type}"
```

### 3.12 Report (신고)

```python
# apps/reports/models.py
from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
import uuid

class Report(models.Model):
    """
    범용 신고 모델
    """
    
    STATUS_CHOICES = [
        ('pending', '대기 중'),
        ('reviewed', '검토 완료'),
        ('resolved', '처리 완료'),
        ('rejected', '기각'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    reporter = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='reports'
    )
    
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.UUIDField()
    content_object = GenericForeignKey('content_type', 'object_id')
    
    reason_id = models.CharField(max_length=50)
    reason_label = models.CharField(max_length=200)
    detail = models.TextField(blank=True, null=True)
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    
    reviewed_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='reviewed_reports'
    )
    reviewed_at = models.DateTimeField(blank=True, null=True)
    resolution_note = models.TextField(blank=True, null=True)
    
    reported_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'reports'
        ordering = ['-reported_at']
        indexes = [
            models.Index(fields=['reporter'], name='idx_dm_reports_reporter'),
            models.Index(fields=['content_type', 'object_id'], name='idx_dm_reports_target'),
            models.Index(fields=['status'], name='idx_dm_reports_status'),
        ]
    
    def __str__(self):
        return f"Report by {self.reporter.name}"
```

---

## 4. 인덱스 및 쿼리 최적화

### 4.1 복합 인덱스 전략

#### 4.1.1 로드맵 조회 최적화

```python
class Roadmap(models.Model):
    class Meta:
        indexes = [
            # 사용자별 최신 로드맵
            models.Index(fields=['user', '-created_at'], name='idx_dm_roadmaps_user_created'),
            
            # 기간별 조회
            models.Index(fields=['period'], name='idx_dm_roadmaps_period'),
        ]
```

**쿼리 예시**:

```python
# 사용자의 방학 로드맵 조회
Roadmap.objects.filter(user=user, period='vacation').order_by('-created_at')
# → idx_dm_roadmaps_user_created, idx_dm_roadmaps_period 인덱스 사용
```

#### 4.1.2 TODO 조회 최적화

```python
class RoadmapTodo(models.Model):
    class Meta:
        indexes = [
            # 활동별 주차 조회
            models.Index(fields=['roadmap_item', 'week_number'], name='idx_dm_rt_item_week'),
            
            # 완료 여부 필터
            models.Index(fields=['is_done'], name='idx_dm_rt_done'),
        ]
```

**쿼리 예시**:

```python
# 특정 활동의 미완료 TODO 조회
RoadmapTodo.objects.filter(roadmap_item=item, is_done=False).order_by('week_number')
# → idx_dm_rt_item_week, idx_dm_rt_done 인덱스 사용
```

### 4.2 N+1 문제 해결

```python
# apps/roadmaps/views.py
class RoadmapViewSet(viewsets.ModelViewSet):
    def retrieve(self, request, *args, **kwargs):
        """상세 조회: prefetch_related로 하위 데이터 한 번에 로드"""
        queryset = Roadmap.objects.select_related('user').prefetch_related(
            Prefetch(
                'items',
                queryset=RoadmapItem.objects.prefetch_related(
                    'todos'
                )
            ),
            'milestones',
        )
        
        roadmap = queryset.get(pk=kwargs['pk'])
        serializer = RoadmapDetailSerializer(roadmap)
        return Response(serializer.data)

# SQL 쿼리 예시 (총 4번 실행)
# 1. SELECT * FROM roadmaps WHERE id = 'roadmap-uuid';
# 2. SELECT * FROM users WHERE id = 'user-uuid';
# 3. SELECT * FROM roadmap_items WHERE roadmap_id = 'roadmap-uuid';
# 4. SELECT * FROM roadmap_todos WHERE roadmap_item_id IN ('item-1', 'item-2', ...);
# 5. SELECT * FROM roadmap_milestones WHERE roadmap_id = 'roadmap-uuid';
```

---

## 5. 마이그레이션 전략

### 5.1 초기 마이그레이션

```bash
# 1. 마이그레이션 파일 생성
python manage.py makemigrations

# 2. 마이그레이션 적용
python manage.py migrate

# 3. 특정 앱만 마이그레이션
python manage.py migrate roadmaps
```

### 5.2 데이터 마이그레이션

```python
# apps/roadmaps/migrations/0002_migrate_legacy_data.py
from django.db import migrations

def migrate_legacy_share_type(apps, schema_editor):
    """
    하위 호환: 기존 'operator' 값을 'space'로 변환
    """
    SharedRoadmap = apps.get_model('roadmaps', 'SharedRoadmap')
    SharedRoadmap.objects.filter(share_type='operator').update(share_type='space')

class Migration(migrations.Migration):
    dependencies = [
        ('roadmaps', '0001_initial'),
    ]
    
    operations = [
        migrations.RunPython(migrate_legacy_share_type),
    ]
```

---

## 6. 데이터 무결성 및 제약조건

### 6.1 UNIQUE 제약조건

```python
# 1. 이메일 중복 방지
class User(AbstractUser):
    email = models.EmailField(unique=True)

# 2. 그룹 초대 코드 중복 방지
class Group(models.Model):
    invite_code = models.CharField(max_length=50, unique=True)

# 3. 그룹 멤버 중복 방지
class GroupMember(models.Model):
    class Meta:
        unique_together = ['group', 'user']

# 4. 공유 로드맵-그룹 중복 방지
class SharedRoadmapGroup(models.Model):
    class Meta:
        unique_together = ['shared_roadmap', 'group']

# 5. 반응 중복 방지
class Reaction(models.Model):
    class Meta:
        unique_together = ['user', 'content_type', 'object_id', 'reaction_type']

# 6. 스페이스 참여자 중복 방지
class SpaceParticipant(models.Model):
    class Meta:
        unique_together = ['space', 'user']
```

### 6.2 CHECK 제약조건

```python
from django.core.validators import MinValueValidator, MaxValueValidator

class RoadmapItem(models.Model):
    difficulty = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    
    months = ArrayField(
        models.IntegerField(
            validators=[MinValueValidator(1), MaxValueValidator(12)]
        ),
        default=list
    )
```

### 6.3 Foreign Key 삭제 규칙

| 모델 | 외래 키 | 삭제 규칙 | 이유 |
|------|---------|-----------|------|
| Roadmap.user | User | CASCADE | 사용자 삭제 시 로드맵도 삭제 |
| RoadmapItem.roadmap | Roadmap | CASCADE | 로드맵 삭제 시 활동도 삭제 |
| RoadmapTodo.roadmap_item | RoadmapItem | CASCADE | 활동 삭제 시 TODO도 삭제 |
| RoadmapMilestone.roadmap | Roadmap | CASCADE | 로드맵 삭제 시 마일스톤도 삭제 |
| DreamResource.user | User | CASCADE | 사용자 삭제 시 자료도 삭제 |
| DreamSpace.group | Group | CASCADE | 그룹 삭제 시 스페이스도 삭제 |
| SharedRoadmap.roadmap | Roadmap | CASCADE | 로드맵 삭제 시 공유도 삭제 |
| Comment.user | User | CASCADE | 사용자 삭제 시 댓글도 삭제 |
| Reaction.user | User | CASCADE | 사용자 삭제 시 반응도 삭제 |
| Report.reporter | User | CASCADE | 신고자 삭제 시 신고도 삭제 |
| Report.reviewed_by | User | SET NULL | 검토자 삭제 시 NULL 처리 |

---

## 7. 성능 최적화

### 7.1 Django ORM 최적화

#### 7.1.1 only() / defer()

```python
# 목록 조회 시 요약 정보만
Roadmap.objects.only(
    'id', 'title', 'period', 'star_color', 'created_at'
).filter(user=user)
```

#### 7.1.2 annotate() - 집계 쿼리

```python
from django.db.models import Count, Q

# 로드맵별 완료율 계산
roadmaps = Roadmap.objects.filter(user=user).annotate(
    item_count=Count('items'),
    completed_todo_count=Count('items__todos', filter=Q(items__todos__is_done=True)),
    total_todo_count=Count('items__todos'),
)

for roadmap in roadmaps:
    completion_rate = (roadmap.completed_todo_count / roadmap.total_todo_count * 100) if roadmap.total_todo_count > 0 else 0
    print(f"{roadmap.title}: {completion_rate:.1f}%")
```

### 7.2 Redis 캐싱

```python
# config/settings/base.py
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/2',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'KEY_PREFIX': 'dreammate',
        'TIMEOUT': 300,
    }
}
```

```python
# apps/roadmaps/views.py
from django.core.cache import cache

class RoadmapViewSet(viewsets.ModelViewSet):
    def retrieve(self, request, *args, **kwargs):
        """상세 조회 (캐싱)"""
        roadmap_id = kwargs['pk']
        cache_key = f"roadmap:{roadmap_id}"
        
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)
        
        roadmap = self.get_object()
        serializer = RoadmapDetailSerializer(roadmap)
        
        cache.set(cache_key, serializer.data, 300)
        
        return Response(serializer.data)
```

---

## 8. 백업 및 복구

### 8.1 데이터베이스 백업

```bash
# 전체 백업
pg_dump -U dreammate -h localhost dreammate > backup_$(date +%Y%m%d_%H%M%S).sql

# 압축 백업
pg_dump -U dreammate -h localhost dreammate | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### 8.2 데이터 복구

```bash
# SQL 파일 복구
psql -U dreammate -h localhost dreammate < backup_20260327_100000.sql

# 압축 파일 복구
gunzip -c backup_20260327_100000.sql.gz | psql -U dreammate -h localhost dreammate
```

---

## 9. 부록

### 9.1 Django Signals (자동 카운터 업데이트)

```python
# apps/reactions/signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Reaction
from apps.roadmaps.models import SharedRoadmap
from apps.resources.models import DreamResource

@receiver(post_save, sender=Reaction)
def increment_reaction_count(sender, instance, created, **kwargs):
    """반응 생성 시 카운터 증가"""
    if not created:
        return
    
    model_name = instance.content_type.model
    
    if model_name == 'sharedroadmap':
        obj = SharedRoadmap.objects.get(id=instance.object_id)
    elif model_name == 'dreamresource':
        obj = DreamResource.objects.get(id=instance.object_id)
    else:
        return
    
    if instance.reaction_type == 'like':
        obj.like_count += 1
    elif instance.reaction_type == 'bookmark':
        obj.bookmark_count += 1
    
    obj.save(update_fields=['like_count', 'bookmark_count'])

@receiver(post_delete, sender=Reaction)
def decrement_reaction_count(sender, instance, **kwargs):
    """반응 삭제 시 카운터 감소"""
    model_name = instance.content_type.model
    
    if model_name == 'sharedroadmap':
        obj = SharedRoadmap.objects.get(id=instance.object_id)
    elif model_name == 'dreamresource':
        obj = DreamResource.objects.get(id=instance.object_id)
    else:
        return
    
    if instance.reaction_type == 'like':
        obj.like_count = max(0, obj.like_count - 1)
    elif instance.reaction_type == 'bookmark':
        obj.bookmark_count = max(0, obj.bookmark_count - 1)
    
    obj.save(update_fields=['like_count', 'bookmark_count'])
```

---

## 10. 결론

### 10.1 핵심 요약

1. **Django 모델 12개**:
   - User, Group, GroupMember
   - Roadmap, RoadmapItem, RoadmapTodo, RoadmapMilestone
   - DreamResource, ResourceSection
   - DreamSpace, SpaceParticipant
   - SharedRoadmap, SharedRoadmapGroup
   - Comment, Reaction, Report

2. **Career Path와의 차이점**:
   - **학교 없음**, 그룹만 존재
   - **주차별 TODO** (week-by-week)
   - **드림 라이브러리·드림 스페이스** 추가

3. **데이터베이스 특징**:
   - PostgreSQL ArrayField (태그·월·집중 활동 유형)
   - GenericForeignKey (댓글·반응·신고)
   - 복합 인덱스 (쿼리 최적화)

4. **성능 최적화**:
   - select_related / prefetch_related
   - Redis 캐싱
   - 연결 풀링

### 10.2 다음 단계

1. **Phase 1**: User, Group 모델 구현
2. **Phase 2**: Roadmap, RoadmapItem, RoadmapTodo 모델 구현
3. **Phase 3**: DreamResource, DreamSpace 모델 구현
4. **Phase 4**: SharedRoadmap, Comment, Reaction 모델 구현

---

**문서 버전**: 2.0.0  
**최종 수정일**: 2026-03-27  
**작성자**: AI Assistant
