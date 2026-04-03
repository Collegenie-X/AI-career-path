# 커리어 패스(Career Path) Django 백엔드 DB 설계서

> **작성일**: 2026-03-27  
> **목적**: AI CareerPath 커리어 패스 기능의 Django 기반 데이터베이스 상세 설계  
> **분석 대상**: `/frontend/app/career` 및 관련 JSON 데이터  
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

**커리어 패스(Career Path)**는 학생들이 장기 진로 계획(3년 이상)을 수립하고, 학년별·월별 활동을 관리하며, 학교·그룹 커뮤니티와 공유하는 시스템입니다.

### 1.2 핵심 데이터 엔티티

1. **User** - 사용자 (학생·선생님·관리자)
2. **School** - 학교 (선생님이 생성, 학생이 가입)
3. **Group** - 사용자 그룹 (학생이 생성)
4. **CareerPlan** - 개인 커리어 패스
5. **PlanYear** - 학년별 계획
6. **GoalGroup** - 목표-활동 그룹
7. **PlanItem** - 활동·수상·작품·자격증
8. **SubItem** - 활동 하위 체크리스트
9. **SharedPlan** - 공유된 커리어 패스
10. **Comment** - 댓글
11. **Reaction** - 좋아요·북마크
12. **Report** - 신고

### 1.3 데이터베이스 선택 이유

**PostgreSQL 15+**:
- JSON/JSONB 필드 지원 (유연한 메타데이터 저장)
- Array 필드 지원 (태그·공유 채널 등)
- Full-text search 지원
- 트랜잭션 ACID 보장
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
│  - school_id (FK → schools)                                          │
│  - role (student | teacher | admin)                                  │
└────────────┬───────────────────────────────────┬────────────────────┘
             │                                   │
             │                                   │
    ┌────────▼────────┐                 ┌────────▼────────┐
    │    SCHOOLS      │                 │     GROUPS      │
    │  - id (PK)      │                 │  - id (PK)      │
    │  - name         │                 │  - name         │
    │  - code (UNIQUE)│                 │  - creator_id   │
    │  - operator_id  │                 │  - invite_code  │
    └─────────────────┘                 └────────┬────────┘
                                                 │
                                        ┌────────▼────────┐
                                        │ GROUP_MEMBERS   │
                                        │  - group_id (FK)│
                                        │  - user_id (FK) │
                                        │  - role         │
                                        └─────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       CAREER_PLANS (커리어 패스)                     │
│  - id (PK)                                                           │
│  - user_id (FK → users)                                              │
│  - title, job_id, star_id                                            │
│  - is_template (템플릿 여부)                                          │
└────────────┬────────────────────────────────────────────────────────┘
             │
             │ 1:N
             │
    ┌────────▼────────┐
    │   PLAN_YEARS    │ ◄─── 학년별 계획 (중1, 중2, 중3...)
    │  - id (PK)      │
    │  - career_plan  │
    │  - grade_id     │
    │  - grade_label  │
    └────────┬────────┘
             │
             │ 1:N
             │
    ┌────────▼────────┐
    │  GOAL_GROUPS    │ ◄─── 목표-활동 그룹 ("프로그래밍 기초 완성")
    │  - id (PK)      │
    │  - plan_year    │
    │  - goal (TEXT)  │
    └────────┬────────┘
             │
             │ 1:N
             │
    ┌────────▼────────┐
    │   PLAN_ITEMS    │ ◄─── 활동·수상·작품·자격증
    │  - id (PK)      │
    │  - plan_year    │
    │  - goal_group   │
    │  - type         │
    │  - title        │
    │  - month        │
    │  - difficulty   │
    │  - cost         │
    │  - organizer    │
    │  - url          │
    │  - description  │
    │  - category_tags│ (ARRAY)
    │  - activity_sub │
    └────────┬────────┘
             │
             │ 1:N
             │
    ┌────────▼────────┐
    │   SUB_ITEMS     │ ◄─── 활동 하위 체크리스트
    │  - id (PK)      │
    │  - plan_item    │
    │  - title        │
    │  - is_done      │
    │  - url          │
    │  - description  │
    └─────────────────┘

    ┌────────▼────────┐
    │   ITEM_LINKS    │ ◄─── 활동 참고 링크
    │  - id (PK)      │
    │  - plan_item    │
    │  - title        │
    │  - url          │
    │  - kind         │
    └─────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    SHARED_PLANS (공유된 커리어 패스)                 │
│  - id (PK)                                                           │
│  - career_plan_id (FK → career_plans)                                │
│  - user_id (FK → users)                                              │
│  - school_id (FK → schools, NULL 가능)                               │
│  - share_type (public | school | group)                              │
│  - tags (ARRAY)                                                      │
│  - like_count, bookmark_count, view_count, comment_count            │
└────────────┬───────────────────────────────┬────────────────────────┘
             │                               │
             │ M:N                           │ 1:N
             │                               │
    ┌────────▼────────┐             ┌────────▼────────┐
    │SHARED_PLAN_     │             │   COMMENTS      │
    │   GROUPS        │             │  - id (PK)      │
    │  - shared_plan  │             │  - shared_plan  │
    │  - group_id (FK)│             │  - user_id      │
    └─────────────────┘             │  - parent_id    │
                                    │  - content      │
                                    │  - author_role  │
                                    └────────┬────────┘
                                             │
                                             │ 1:N (self)
                                             │
                                    ┌────────▼────────┐
                                    │   COMMENTS      │
                                    │  (대댓글)        │
                                    └─────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       REACTIONS (좋아요·북마크)                      │
│  - id (PK)                                                           │
│  - user_id (FK → users)                                              │
│  - content_type_id (FK → django_content_type)                        │
│  - object_id (UUID)                                                  │
│  - reaction_type (like | bookmark)                                   │
│  - UNIQUE(user_id, content_type_id, object_id, reaction_type)       │
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
| 사용자-학교 | users | schools | N:1 | SET NULL |
| 사용자-그룹 | users, groups | group_members | M:N | CASCADE |
| 사용자-커리어패스 | users | career_plans | 1:N | CASCADE |
| 커리어패스-학년 | career_plans | plan_years | 1:N | CASCADE |
| 학년-목표그룹 | plan_years | goal_groups | 1:N | CASCADE |
| 목표그룹-활동 | goal_groups | plan_items | 1:N | CASCADE |
| 활동-하위항목 | plan_items | sub_items | 1:N | CASCADE |
| 활동-링크 | plan_items | item_links | 1:N | CASCADE |
| 커리어패스-공유 | career_plans | shared_plans | 1:N | CASCADE |
| 공유-그룹 | shared_plans, groups | shared_plan_groups | M:N | CASCADE |
| 공유-댓글 | shared_plans | comments | 1:N | CASCADE |
| 댓글-대댓글 | comments | comments | 1:N (self) | CASCADE |

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
    
    Django의 AbstractUser를 확장하여 커스텀 필드 추가
    - email을 username 대신 로그인 ID로 사용
    - 학년, 이모지, 학교 정보 추가
    """
    
    # Primary Key
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="사용자 고유 ID (UUID)"
    )
    
    # 인증 정보
    email = models.EmailField(
        unique=True,
        validators=[EmailValidator()],
        help_text="이메일 (로그인 ID)"
    )
    password = models.CharField(
        max_length=128,
        validators=[MinLengthValidator(8)],
        help_text="비밀번호 해시 (PBKDF2)"
    )
    
    # 프로필 정보
    name = models.CharField(
        max_length=100,
        help_text="사용자 이름"
    )
    emoji = models.CharField(
        max_length=10,
        default='👤',
        help_text="프로필 이모지"
    )
    grade_id = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="현재 학년 (예: mid2, high1)"
    )
    profile_image_url = models.URLField(
        blank=True,
        null=True,
        help_text="프로필 이미지 URL (S3)"
    )
    bio = models.TextField(
        blank=True,
        null=True,
        help_text="자기소개"
    )
    
    # 학교 연결
    school = models.ForeignKey(
        'schools.School',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='students',
        help_text="소속 학교"
    )
    
    # 역할
    ROLE_CHOICES = [
        ('student', '학생'),
        ('teacher', '선생님'),
        ('admin', '관리자'),
    ]
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='student',
        help_text="사용자 역할"
    )
    
    # 타임스탬프
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="계정 생성 일시"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="최종 수정 일시"
    )
    last_login_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="마지막 로그인 일시"
    )
    
    # 상태
    is_active = models.BooleanField(
        default=True,
        help_text="활성 여부 (탈퇴 시 False)"
    )
    is_email_verified = models.BooleanField(
        default=False,
        help_text="이메일 인증 여부"
    )
    
    # Django 인증 설정
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'name']
    
    class Meta:
        db_table = 'users'
        verbose_name = '사용자'
        verbose_name_plural = '사용자 목록'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email'], name='idx_users_email'),
            models.Index(fields=['school', 'grade_id'], name='idx_users_school_grade'),
            models.Index(fields=['role'], name='idx_users_role'),
            models.Index(fields=['-created_at'], name='idx_users_created'),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.email})"
    
    def get_full_grade_label(self):
        """학년 전체 라벨 반환 (예: "중학교 2학년")"""
        grade_map = {
            'elem3': '초등 3학년', 'elem4': '초등 4학년', 'elem5': '초등 5학년', 'elem6': '초등 6학년',
            'mid1': '중학교 1학년', 'mid2': '중학교 2학년', 'mid3': '중학교 3학년',
            'high1': '고등학교 1학년', 'high2': '고등학교 2학년', 'high3': '고등학교 3학년',
            'univ': '대학생', 'general': '일반',
        }
        return grade_map.get(self.grade_id, self.grade_id)
```

### 3.2 School (학교)

```python
# apps/schools/models.py
from django.db import models
from django.contrib.postgres.fields import ArrayField
import uuid

class School(models.Model):
    """
    학교 모델
    
    - 선생님(teacher)이 생성
    - 학생들은 학교 코드로 가입
    - 학교 공간에서 같은 학교 학생들의 공유 패스 조회 가능
    """
    
    # Primary Key
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    
    # 기본 정보
    name = models.CharField(
        max_length=200,
        help_text="학교 이름 (예: 서울 미래중학교)"
    )
    code = models.CharField(
        max_length=50,
        unique=True,
        help_text="학교 가입 코드 (예: FUTURE2024)"
    )
    
    # 운영자 (선생님)
    operator = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='operated_schools',
        help_text="학교 운영자 (선생님)"
    )
    
    # 학년 정보
    grades = ArrayField(
        models.CharField(max_length=20),
        default=list,
        help_text="학교에서 관리하는 학년 목록 (예: ['mid1', 'mid2', 'mid3'])"
    )
    
    # 통계
    member_count = models.IntegerField(
        default=0,
        help_text="소속 학생 수"
    )
    
    # 추가 정보
    description = models.TextField(
        blank=True,
        null=True,
        help_text="학교 설명"
    )
    region = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="지역 (예: 서울특별시 강남구)"
    )
    
    SCHOOL_TYPE_CHOICES = [
        ('elementary', '초등학교'),
        ('middle', '중학교'),
        ('high', '고등학교'),
    ]
    school_type = models.CharField(
        max_length=50,
        choices=SCHOOL_TYPE_CHOICES,
        blank=True,
        null=True,
        help_text="학교 유형"
    )
    
    # 타임스탬프
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'schools'
        verbose_name = '학교'
        verbose_name_plural = '학교 목록'
        ordering = ['name']
        indexes = [
            models.Index(fields=['code'], name='idx_schools_code'),
            models.Index(fields=['operator'], name='idx_schools_operator'),
            models.Index(fields=['region', 'school_type'], name='idx_schools_region_type'),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.code})"
```

### 3.3 Group (그룹)

```python
# apps/groups/models.py
from django.db import models
from django.contrib.postgres.fields import ArrayField
import uuid

class Group(models.Model):
    """
    사용자 그룹 모델
    
    - 학생이 자유롭게 생성
    - 초대 코드로 가입
    - 그룹 내에서 커리어 패스 공유
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    name = models.CharField(
        max_length=200,
        help_text="그룹 이름 (예: IT 개발자 꿈나무들)"
    )
    emoji = models.CharField(
        max_length=10,
        default='👥',
        help_text="그룹 이모지"
    )
    description = models.TextField(
        help_text="그룹 설명"
    )
    color = models.CharField(
        max_length=20,
        default='#6C5CE7',
        help_text="그룹 테마 색상"
    )
    
    creator = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='created_groups',
        help_text="그룹 생성자"
    )
    
    invite_code = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
        null=True,
        help_text="초대 코드 (예: GRP-IT-001)"
    )
    
    # 통계
    member_count = models.IntegerField(
        default=1,
        help_text="멤버 수"
    )
    shared_plan_count = models.IntegerField(
        default=0,
        help_text="공유된 패스 수"
    )
    
    tags = ArrayField(
        models.CharField(max_length=50),
        default=list,
        help_text="그룹 태그"
    )
    
    is_operator_test = models.BooleanField(
        default=False,
        help_text="운영자 테스트용 그룹 여부"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'groups'
        verbose_name = '그룹'
        verbose_name_plural = '그룹 목록'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['creator'], name='idx_groups_creator'),
            models.Index(fields=['invite_code'], name='idx_groups_invite_code'),
            models.Index(fields=['-created_at'], name='idx_groups_created'),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.emoji})"
```

### 3.4 GroupMember (그룹 멤버)

```python
# apps/groups/models.py
class GroupMember(models.Model):
    """
    그룹 멤버 (M:N 중간 테이블)
    
    - 한 사용자는 여러 그룹에 가입 가능
    - 한 그룹은 여러 멤버 보유
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        related_name='memberships',
        help_text="그룹"
    )
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='group_memberships',
        help_text="사용자"
    )
    
    ROLE_CHOICES = [
        ('creator', '생성자'),
        ('operator', '운영자'),
        ('member', '멤버'),
    ]
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='member',
        help_text="그룹 내 역할"
    )
    
    joined_at = models.DateTimeField(
        auto_now_add=True,
        help_text="가입 일시"
    )
    
    class Meta:
        db_table = 'group_members'
        verbose_name = '그룹 멤버'
        verbose_name_plural = '그룹 멤버 목록'
        unique_together = ['group', 'user']
        ordering = ['joined_at']
        indexes = [
            models.Index(fields=['group'], name='idx_group_members_group'),
            models.Index(fields=['user'], name='idx_group_members_user'),
            models.Index(fields=['role'], name='idx_group_members_role'),
        ]
    
    def __str__(self):
        return f"{self.user.name} in {self.group.name} ({self.role})"
```

### 3.5 CareerPlan (커리어 패스)

```python
# apps/career_plans/models.py
from django.db import models
import uuid

class CareerPlan(models.Model):
    """
    커리어 패스 (개인 진로 계획)
    
    - 사용자별 여러 개 생성 가능
    - 템플릿 플래그로 관리자 생성 템플릿 구분
    - 직업(job)·적성(star) 정보 포함
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='career_plans',
        help_text="소유자"
    )
    
    # 기본 정보
    title = models.CharField(
        max_length=200,
        help_text="커리어 패스 제목"
    )
    description = models.TextField(
        blank=True,
        null=True,
        help_text="커리어 패스 설명"
    )
    
    # 직업 정보
    job_id = models.CharField(
        max_length=100,
        help_text="직업 ID (예: doctor, app-developer)"
    )
    job_name = models.CharField(
        max_length=100,
        help_text="직업 이름 (예: 의사, 소프트웨어 개발자)"
    )
    job_emoji = models.CharField(
        max_length=10,
        blank=True,
        null=True,
        help_text="직업 이모지"
    )
    
    # 적성(별) 정보
    star_id = models.CharField(
        max_length=100,
        help_text="적성 ID (예: explore, tech)"
    )
    star_name = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="적성 이름 (예: 탐구의 별, 기술의 별)"
    )
    star_emoji = models.CharField(
        max_length=10,
        blank=True,
        null=True,
        help_text="적성 이모지"
    )
    star_color = models.CharField(
        max_length=20,
        default='#6C5CE7',
        help_text="적성 색상 (HEX)"
    )
    
    # 템플릿 여부
    is_template = models.BooleanField(
        default=False,
        help_text="템플릿 여부 (관리자가 생성한 샘플 패스)"
    )
    template_category = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="템플릿 카테고리 (예: highschool, admission)"
    )
    
    # 타임스탬프
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'career_plans'
        verbose_name = '커리어 패스'
        verbose_name_plural = '커리어 패스 목록'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at'], name='idx_career_plans_user_created'),
            models.Index(fields=['job_id'], name='idx_career_plans_job'),
            models.Index(fields=['star_id'], name='idx_career_plans_star'),
            models.Index(fields=['is_template'], name='idx_career_plans_template'),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.user.name})"
    
    @property
    def year_count(self):
        """학년 수 계산"""
        return self.years.count()
    
    @property
    def item_count(self):
        """총 활동 수 계산"""
        return PlanItem.objects.filter(plan_year__career_plan=self).count()
```

### 3.6 PlanYear (학년별 계획)

```python
# apps/career_plans/models.py
class PlanYear(models.Model):
    """
    학년별 계획
    
    - 한 커리어 패스는 여러 학년으로 구성
    - 학년당 여러 목표 그룹 보유
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    career_plan = models.ForeignKey(
        CareerPlan,
        on_delete=models.CASCADE,
        related_name='years',
        help_text="소속 커리어 패스"
    )
    
    grade_id = models.CharField(
        max_length=20,
        help_text="학년 ID (예: mid1, high2)"
    )
    grade_label = models.CharField(
        max_length=50,
        help_text="학년 라벨 (예: 중1, 고2)"
    )
    
    # 학기 옵션
    SEMESTER_CHOICES = [
        ('both', '1·2학기 통합'),
        ('first', '1학기만'),
        ('second', '2학기만'),
        ('split', '1·2학기 분리'),
        ('', '미선택'),
    ]
    semester = models.CharField(
        max_length=20,
        choices=SEMESTER_CHOICES,
        default='both',
        help_text="학기 옵션"
    )
    
    sort_order = models.IntegerField(
        default=0,
        help_text="정렬 순서"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'plan_years'
        verbose_name = '학년별 계획'
        verbose_name_plural = '학년별 계획 목록'
        unique_together = ['career_plan', 'grade_id']
        ordering = ['sort_order', 'created_at']
        indexes = [
            models.Index(fields=['career_plan', 'sort_order'], name='idx_plan_years_plan_order'),
            models.Index(fields=['grade_id'], name='idx_plan_years_grade'),
        ]
    
    def __str__(self):
        return f"{self.career_plan.title} - {self.grade_label}"
```

### 3.7 GoalGroup (목표-활동 그룹)

```python
# apps/career_plans/models.py
class GoalGroup(models.Model):
    """
    목표-활동 그룹
    
    - 한 학년 내에서 목표별로 활동을 그룹핑
    - 예: "프로그래밍 기초 완성" 목표 → 3개 활동
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    plan_year = models.ForeignKey(
        PlanYear,
        on_delete=models.CASCADE,
        related_name='goal_groups',
        help_text="소속 학년"
    )
    
    goal = models.TextField(
        help_text="목표 (예: 프로그래밍 기초 완성)"
    )
    
    # 학기 구분 (semester=split인 경우)
    SEMESTER_ID_CHOICES = [
        ('first', '1학기'),
        ('second', '2학기'),
        ('', '통합'),
    ]
    semester_id = models.CharField(
        max_length=20,
        choices=SEMESTER_ID_CHOICES,
        blank=True,
        default='',
        help_text="학기 구분 (split 모드에서만 사용)"
    )
    
    sort_order = models.IntegerField(
        default=0,
        help_text="정렬 순서"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'goal_groups'
        verbose_name = '목표 그룹'
        verbose_name_plural = '목표 그룹 목록'
        ordering = ['sort_order', 'created_at']
        indexes = [
            models.Index(fields=['plan_year', 'sort_order'], name='idx_goal_groups_year_order'),
            models.Index(fields=['semester_id'], name='idx_goal_groups_semester'),
        ]
    
    def __str__(self):
        return f"{self.goal} ({self.plan_year.grade_label})"
```

### 3.8 PlanItem (활동·수상·작품·자격증)

```python
# apps/career_plans/models.py
from django.contrib.postgres.fields import ArrayField

class PlanItem(models.Model):
    """
    활동·수상·작품·자격증
    
    - 한 학년 내 여러 활동 보유
    - 목표 그룹에 속할 수도, 독립적일 수도 있음
    - 월별 실행 계획 (months 배열)
    """
    
    TYPE_CHOICES = [
        ('activity', '활동'),
        ('award', '수상·대회'),
        ('portfolio', '작품'),
        ('certification', '자격증'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    plan_year = models.ForeignKey(
        PlanYear,
        on_delete=models.CASCADE,
        related_name='items',
        help_text="소속 학년"
    )
    
    goal_group = models.ForeignKey(
        GoalGroup,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='items',
        help_text="소속 목표 그룹 (NULL이면 독립 활동)"
    )
    
    type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        help_text="활동 유형"
    )
    
    title = models.CharField(
        max_length=300,
        help_text="활동 제목"
    )
    
    # 실행 월 (배열)
    months = ArrayField(
        models.IntegerField(),
        default=list,
        help_text="실행 월 목록 (예: [3, 4, 5])"
    )
    
    difficulty = models.IntegerField(
        default=1,
        help_text="난이도 (1~5)"
    )
    
    cost = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="비용 (예: 무료, 3만원)"
    )
    
    organizer = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text="주최 기관"
    )
    
    url = models.URLField(
        blank=True,
        null=True,
        help_text="관련 URL (대표 링크)"
    )
    
    description = models.TextField(
        blank=True,
        null=True,
        help_text="상세 설명"
    )
    
    # 카테고리 태그 (배열)
    CATEGORY_TAG_CHOICES = [
        'project', 'award', 'paper', 'intern', 'volunteer', 'camp', 'activity'
    ]
    category_tags = ArrayField(
        models.CharField(max_length=50),
        blank=True,
        default=list,
        help_text="카테고리 태그 (예: ['project', 'award'])"
    )
    
    # 활동 세부 유형
    ACTIVITY_SUBTYPE_CHOICES = [
        ('project', '프로젝트'),
        ('intern', '인턴'),
        ('volunteer', '봉사'),
        ('camp', '캠프'),
        ('research', '연구'),
        ('paper', '논문'),
        ('general', '일반'),
    ]
    activity_subtype = models.CharField(
        max_length=50,
        choices=ACTIVITY_SUBTYPE_CHOICES,
        blank=True,
        null=True,
        help_text="활동 세부 유형 (activity 타입인 경우)"
    )
    
    sort_order = models.IntegerField(
        default=0,
        help_text="정렬 순서"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'plan_items'
        verbose_name = '활동 항목'
        verbose_name_plural = '활동 항목 목록'
        ordering = ['sort_order', 'created_at']
        indexes = [
            models.Index(fields=['plan_year', 'sort_order'], name='idx_plan_items_year_order'),
            models.Index(fields=['goal_group'], name='idx_plan_items_goal_group'),
            models.Index(fields=['type'], name='idx_plan_items_type'),
            models.Index(fields=['months'], name='idx_plan_items_months'),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.type})"
    
    @property
    def month_range_display(self):
        """월 범위 표시 (예: 3~5월)"""
        if not self.months:
            return ''
        return f"{min(self.months)}~{max(self.months)}월"
```

### 3.9 SubItem (활동 하위 체크리스트)

```python
# apps/career_plans/models.py
class SubItem(models.Model):
    """
    활동 하위 실행 항목 (체크리스트)
    
    - 큰 활동을 작은 단위로 쪼갠 실행 항목
    - 완료 여부(is_done) 체크
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    plan_item = models.ForeignKey(
        PlanItem,
        on_delete=models.CASCADE,
        related_name='sub_items',
        help_text="소속 활동"
    )
    
    title = models.CharField(
        max_length=300,
        help_text="하위 항목 제목"
    )
    
    is_done = models.BooleanField(
        default=False,
        help_text="완료 여부"
    )
    
    url = models.URLField(
        blank=True,
        null=True,
        help_text="관련 URL"
    )
    
    description = models.TextField(
        blank=True,
        null=True,
        help_text="상세 설명"
    )
    
    sort_order = models.IntegerField(
        default=0,
        help_text="정렬 순서"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'sub_items'
        verbose_name = '하위 실행 항목'
        verbose_name_plural = '하위 실행 항목 목록'
        ordering = ['sort_order', 'created_at']
        indexes = [
            models.Index(fields=['plan_item', 'sort_order'], name='idx_sub_items_item_order'),
            models.Index(fields=['is_done'], name='idx_sub_items_done'),
        ]
    
    def __str__(self):
        return f"{self.title} ({'✓' if self.is_done else '○'})"
```

### 3.10 ItemLink (활동 참고 링크)

```python
# apps/career_plans/models.py
class ItemLink(models.Model):
    """
    활동 참고 링크
    
    - 한 활동에 여러 참고 링크 첨부 가능
    - 링크 종류(kind)로 구분
    """
    
    LINK_KIND_CHOICES = [
        ('official', '공식 사이트'),
        ('application', '신청 페이지'),
        ('reference', '참고 자료'),
        ('portfolio', '포트폴리오'),
        ('result', '결과물'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    plan_item = models.ForeignKey(
        PlanItem,
        on_delete=models.CASCADE,
        related_name='links',
        help_text="소속 활동"
    )
    
    title = models.CharField(
        max_length=200,
        help_text="링크 제목"
    )
    
    url = models.URLField(
        help_text="링크 URL"
    )
    
    kind = models.CharField(
        max_length=50,
        choices=LINK_KIND_CHOICES,
        blank=True,
        null=True,
        help_text="링크 종류"
    )
    
    sort_order = models.IntegerField(
        default=0,
        help_text="정렬 순서"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'item_links'
        verbose_name = '활동 참고 링크'
        verbose_name_plural = '활동 참고 링크 목록'
        ordering = ['sort_order', 'created_at']
        indexes = [
            models.Index(fields=['plan_item', 'sort_order'], name='idx_item_links_item_order'),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.kind})"
```

### 3.11 SharedPlan (공유된 커리어 패스)

```python
# apps/career_plans/models.py
from django.contrib.postgres.fields import ArrayField

class SharedPlan(models.Model):
    """
    공유된 커리어 패스
    
    - 개인 커리어 패스를 커뮤니티에 공유
    - 공유 유형: 전체 공유(public), 학교 공유(school), 그룹 공유(group)
    - 좋아요·북마크·댓글 기능
    """
    
    SHARE_TYPE_CHOICES = [
        ('private', '비공개'),
        ('public', '전체 공유'),
        ('school', '학교 공유'),
        ('group', '그룹 공유'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    career_plan = models.ForeignKey(
        CareerPlan,
        on_delete=models.CASCADE,
        related_name='shared_instances',
        help_text="원본 커리어 패스"
    )
    
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='shared_plans',
        help_text="공유자 (소유자)"
    )
    
    school = models.ForeignKey(
        'schools.School',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='shared_plans',
        help_text="소속 학교 (학교 공유 시)"
    )
    
    share_type = models.CharField(
        max_length=20,
        choices=SHARE_TYPE_CHOICES,
        default='private',
        help_text="공유 유형"
    )
    
    description = models.TextField(
        blank=True,
        null=True,
        help_text="공유 설명"
    )
    
    tags = ArrayField(
        models.CharField(max_length=50),
        blank=True,
        default=list,
        help_text="태그 (예: ['SW', '코딩', '정보올림피아드'])"
    )
    
    # 통계 (비정규화 - 성능 최적화)
    like_count = models.IntegerField(
        default=0,
        help_text="좋아요 수"
    )
    bookmark_count = models.IntegerField(
        default=0,
        help_text="북마크 수"
    )
    view_count = models.IntegerField(
        default=0,
        help_text="조회 수"
    )
    comment_count = models.IntegerField(
        default=0,
        help_text="댓글 수"
    )
    
    # 타임스탬프
    shared_at = models.DateTimeField(
        auto_now_add=True,
        help_text="공유 일시"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="최종 수정 일시 (댓글·수정 시 갱신)"
    )
    
    # 상태
    is_hidden = models.BooleanField(
        default=False,
        help_text="숨김 여부 (신고 등으로 숨김 처리)"
    )
    
    class Meta:
        db_table = 'shared_plans'
        verbose_name = '공유 커리어 패스'
        verbose_name_plural = '공유 커리어 패스 목록'
        ordering = ['-shared_at']
        indexes = [
            models.Index(fields=['user', '-shared_at'], name='idx_shared_plans_user_shared'),
            models.Index(fields=['career_plan'], name='idx_shared_plans_career_plan'),
            models.Index(fields=['school'], name='idx_shared_plans_school'),
            models.Index(fields=['share_type'], name='idx_shared_plans_share_type'),
            models.Index(fields=['-like_count'], name='idx_shared_plans_likes'),
            models.Index(fields=['-shared_at'], name='idx_shared_plans_shared'),
            models.Index(fields=['is_hidden'], name='idx_shared_plans_hidden'),
        ]
    
    def __str__(self):
        return f"Shared: {self.career_plan.title} ({self.share_type})"
```

### 3.12 SharedPlanGroup (공유 패스 - 그룹 연결)

```python
# apps/career_plans/models.py
class SharedPlanGroup(models.Model):
    """
    공유 패스 - 그룹 연결 (M:N)
    
    - 한 공유 패스를 여러 그룹에 동시 공유 가능
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    shared_plan = models.ForeignKey(
        SharedPlan,
        on_delete=models.CASCADE,
        related_name='group_links',
        help_text="공유 패스"
    )
    
    group = models.ForeignKey(
        'groups.Group',
        on_delete=models.CASCADE,
        related_name='shared_plan_links',
        help_text="그룹"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'shared_plan_groups'
        verbose_name = '공유 패스-그룹 연결'
        verbose_name_plural = '공유 패스-그룹 연결 목록'
        unique_together = ['shared_plan', 'group']
        indexes = [
            models.Index(fields=['shared_plan'], name='idx_spg_shared_plan'),
            models.Index(fields=['group'], name='idx_spg_group'),
        ]
    
    def __str__(self):
        return f"{self.shared_plan.career_plan.title} → {self.group.name}"
```

### 3.13 Comment (댓글)

```python
# apps/comments/models.py
from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
import uuid

class Comment(models.Model):
    """
    범용 댓글 모델 (GenericForeignKey 활용)
    
    - SharedPlan, Resource 등 여러 모델에 댓글 가능
    - 대댓글 지원 (parent 필드)
    - 운영자(선생님) vs 동료(학생) 구분
    """
    
    AUTHOR_ROLE_CHOICES = [
        ('operator', '운영자'),
        ('peer', '동료'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='comments',
        help_text="작성자"
    )
    
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name='replies',
        help_text="부모 댓글 (대댓글인 경우)"
    )
    
    # GenericForeignKey로 다양한 모델 참조
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        help_text="댓글 대상 모델 (SharedPlan, Resource 등)"
    )
    object_id = models.UUIDField(
        help_text="댓글 대상 ID"
    )
    content_object = GenericForeignKey('content_type', 'object_id')
    
    content = models.TextField(
        help_text="댓글 내용"
    )
    
    author_role = models.CharField(
        max_length=20,
        choices=AUTHOR_ROLE_CHOICES,
        default='peer',
        help_text="작성자 역할 (운영자 vs 동료)"
    )
    
    is_hidden = models.BooleanField(
        default=False,
        help_text="숨김 여부 (신고 등으로 숨김 처리)"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'comments'
        verbose_name = '댓글'
        verbose_name_plural = '댓글 목록'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['content_type', 'object_id'], name='idx_comments_target'),
            models.Index(fields=['user'], name='idx_comments_user'),
            models.Index(fields=['parent'], name='idx_comments_parent'),
            models.Index(fields=['created_at'], name='idx_comments_created'),
        ]
    
    def __str__(self):
        return f"Comment by {self.user.name} on {self.content_type}"
    
    @property
    def is_reply(self):
        """대댓글 여부"""
        return self.parent is not None
```

### 3.14 Reaction (좋아요·북마크)

```python
# apps/reactions/models.py
from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
import uuid

class Reaction(models.Model):
    """
    범용 반응 모델 (좋아요·북마크)
    
    - SharedPlan, Resource 등 여러 모델에 반응 가능
    - 한 사용자당 한 번만 반응 가능 (UNIQUE 제약)
    """
    
    REACTION_TYPE_CHOICES = [
        ('like', '좋아요'),
        ('bookmark', '북마크'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='reactions',
        help_text="반응한 사용자"
    )
    
    reaction_type = models.CharField(
        max_length=20,
        choices=REACTION_TYPE_CHOICES,
        help_text="반응 유형"
    )
    
    # GenericForeignKey로 다양한 모델 참조
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        help_text="반응 대상 모델"
    )
    object_id = models.UUIDField(
        help_text="반응 대상 ID"
    )
    content_object = GenericForeignKey('content_type', 'object_id')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'reactions'
        verbose_name = '반응'
        verbose_name_plural = '반응 목록'
        unique_together = ['user', 'content_type', 'object_id', 'reaction_type']
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'reaction_type'], name='idx_reactions_user_type'),
            models.Index(fields=['content_type', 'object_id'], name='idx_reactions_target'),
        ]
    
    def __str__(self):
        return f"{self.user.name} {self.reaction_type} on {self.content_type}"
```

### 3.15 Report (신고)

```python
# apps/reports/models.py
from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
import uuid

class Report(models.Model):
    """
    범용 신고 모델
    
    - SharedPlan, Resource, Comment 등 여러 모델 신고 가능
    - 관리자가 검토 후 처리
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
        related_name='reports',
        help_text="신고자"
    )
    
    # GenericForeignKey로 다양한 모델 참조
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        help_text="신고 대상 모델"
    )
    object_id = models.UUIDField(
        help_text="신고 대상 ID"
    )
    content_object = GenericForeignKey('content_type', 'object_id')
    
    reason_id = models.CharField(
        max_length=50,
        help_text="신고 사유 ID (예: spam, inappropriate)"
    )
    reason_label = models.CharField(
        max_length=200,
        help_text="신고 사유 라벨"
    )
    detail = models.TextField(
        blank=True,
        null=True,
        help_text="상세 설명"
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        help_text="처리 상태"
    )
    
    reviewed_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='reviewed_reports',
        help_text="검토자 (관리자)"
    )
    reviewed_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="검토 일시"
    )
    resolution_note = models.TextField(
        blank=True,
        null=True,
        help_text="검토 결과 메모"
    )
    
    reported_at = models.DateTimeField(
        auto_now_add=True,
        help_text="신고 일시"
    )
    
    class Meta:
        db_table = 'reports'
        verbose_name = '신고'
        verbose_name_plural = '신고 목록'
        ordering = ['-reported_at']
        indexes = [
            models.Index(fields=['reporter'], name='idx_reports_reporter'),
            models.Index(fields=['content_type', 'object_id'], name='idx_reports_target'),
            models.Index(fields=['status'], name='idx_reports_status'),
            models.Index(fields=['-reported_at'], name='idx_reports_reported'),
        ]
    
    def __str__(self):
        return f"Report by {self.reporter.name} on {self.content_type}"
```

### 3.16 Notification (알림)

```python
# apps/notifications/models.py
from django.db import models
import uuid

class Notification(models.Model):
    """
    알림 모델
    
    - 댓글·좋아요·북마크 등 이벤트 발생 시 생성
    - 읽음 여부 추적
    """
    
    TYPE_CHOICES = [
        ('comment', '댓글'),
        ('reply', '답글'),
        ('like', '좋아요'),
        ('bookmark', '북마크'),
        ('mention', '멘션'),
        ('group_invite', '그룹 초대'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='notifications',
        help_text="알림 수신자"
    )
    
    type = models.CharField(
        max_length=50,
        choices=TYPE_CHOICES,
        help_text="알림 유형"
    )
    
    title = models.CharField(
        max_length=200,
        help_text="알림 제목"
    )
    
    message = models.TextField(
        blank=True,
        null=True,
        help_text="알림 메시지"
    )
    
    link_url = models.TextField(
        blank=True,
        null=True,
        help_text="알림 클릭 시 이동할 URL"
    )
    
    is_read = models.BooleanField(
        default=False,
        help_text="읽음 여부"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notifications'
        verbose_name = '알림'
        verbose_name_plural = '알림 목록'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read'], name='idx_notifications_user_read'),
            models.Index(fields=['-created_at'], name='idx_notifications_created'),
        ]
    
    def __str__(self):
        return f"{self.title} → {self.user.name}"
```

---

## 4. 인덱스 및 쿼리 최적화

### 4.1 복합 인덱스 전략

#### 4.1.1 사용자 조회 최적화

```python
# apps/accounts/models.py
class User(AbstractUser):
    class Meta:
        indexes = [
            # 이메일 로그인
            models.Index(fields=['email'], name='idx_users_email'),
            
            # 학교별 학생 조회
            models.Index(fields=['school', 'grade_id'], name='idx_users_school_grade'),
            
            # 역할별 조회
            models.Index(fields=['role'], name='idx_users_role'),
            
            # 최신 가입자 조회
            models.Index(fields=['-created_at'], name='idx_users_created'),
        ]
```

**쿼리 예시**:

```python
# 특정 학교의 중2 학생 조회
User.objects.filter(school_id='school-uuid', grade_id='mid2')
# → idx_users_school_grade 인덱스 사용

# 선생님 목록 조회
User.objects.filter(role='teacher')
# → idx_users_role 인덱스 사용
```

#### 4.1.2 커리어 패스 조회 최적화

```python
# apps/career_plans/models.py
class CareerPlan(models.Model):
    class Meta:
        indexes = [
            # 사용자별 최신 패스 조회
            models.Index(fields=['user', '-created_at'], name='idx_career_plans_user_created'),
            
            # 직업별 패스 조회
            models.Index(fields=['job_id'], name='idx_career_plans_job'),
            
            # 적성별 패스 조회
            models.Index(fields=['star_id'], name='idx_career_plans_star'),
            
            # 템플릿 조회
            models.Index(fields=['is_template'], name='idx_career_plans_template'),
        ]
```

**쿼리 예시**:

```python
# 사용자의 최신 패스 조회
CareerPlan.objects.filter(user=user).order_by('-created_at')
# → idx_career_plans_user_created 인덱스 사용

# 의사 직업 템플릿 조회
CareerPlan.objects.filter(job_id='doctor', is_template=True)
# → idx_career_plans_job, idx_career_plans_template 인덱스 사용
```

#### 4.1.3 공유 패스 조회 최적화

```python
# apps/career_plans/models.py
class SharedPlan(models.Model):
    class Meta:
        indexes = [
            # 사용자별 공유 패스
            models.Index(fields=['user', '-shared_at'], name='idx_shared_plans_user_shared'),
            
            # 학교별 공유 패스
            models.Index(fields=['school'], name='idx_shared_plans_school'),
            
            # 공유 유형별 조회
            models.Index(fields=['share_type'], name='idx_shared_plans_share_type'),
            
            # 인기순 정렬
            models.Index(fields=['-like_count'], name='idx_shared_plans_likes'),
            
            # 최신순 정렬
            models.Index(fields=['-shared_at'], name='idx_shared_plans_shared'),
            
            # 숨김 필터
            models.Index(fields=['is_hidden'], name='idx_shared_plans_hidden'),
        ]
```

**쿼리 예시**:

```python
# 전체 공유 패스 (최신순)
SharedPlan.objects.filter(share_type='public', is_hidden=False).order_by('-shared_at')
# → idx_shared_plans_share_type, idx_shared_plans_shared 인덱스 사용

# 학교 공유 패스 (좋아요순)
SharedPlan.objects.filter(school_id='school-uuid', is_hidden=False).order_by('-like_count')
# → idx_shared_plans_school, idx_shared_plans_likes 인덱스 사용
```

### 4.2 N+1 문제 해결

#### 4.2.1 select_related (1:1, N:1 관계)

```python
# apps/career_plans/views.py
from rest_framework import viewsets

class CareerPlanViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        """N+1 문제 해결: select_related"""
        return CareerPlan.objects.select_related(
            'user',  # 소유자 정보
        ).filter(user=self.request.user)

# SQL 쿼리 예시 (1번만 실행)
# SELECT * FROM career_plans
# INNER JOIN users ON career_plans.user_id = users.id
# WHERE career_plans.user_id = 'user-uuid';
```

#### 4.2.2 prefetch_related (1:N, M:N 관계)

```python
# apps/career_plans/views.py
from django.db.models import Prefetch

class CareerPlanViewSet(viewsets.ModelViewSet):
    def retrieve(self, request, *args, **kwargs):
        """상세 조회: prefetch_related로 하위 데이터 한 번에 로드"""
        queryset = CareerPlan.objects.select_related('user').prefetch_related(
            Prefetch(
                'years',
                queryset=PlanYear.objects.prefetch_related(
                    Prefetch(
                        'goal_groups',
                        queryset=GoalGroup.objects.prefetch_related(
                            Prefetch(
                                'items',
                                queryset=PlanItem.objects.prefetch_related(
                                    'sub_items',
                                    'links',
                                )
                            )
                        )
                    )
                )
            ),
        )
        
        career_plan = queryset.get(pk=kwargs['pk'])
        serializer = CareerPlanDetailSerializer(career_plan)
        return Response(serializer.data)

# SQL 쿼리 예시 (총 6번 실행)
# 1. SELECT * FROM career_plans WHERE id = 'plan-uuid';
# 2. SELECT * FROM users WHERE id = 'user-uuid';
# 3. SELECT * FROM plan_years WHERE career_plan_id = 'plan-uuid';
# 4. SELECT * FROM goal_groups WHERE plan_year_id IN ('year-1', 'year-2', ...);
# 5. SELECT * FROM plan_items WHERE goal_group_id IN ('goal-1', 'goal-2', ...);
# 6. SELECT * FROM sub_items WHERE plan_item_id IN ('item-1', 'item-2', ...);
# 7. SELECT * FROM item_links WHERE plan_item_id IN ('item-1', 'item-2', ...);
```

### 4.3 Full-Text Search (전문 검색)

#### 4.3.1 PostgreSQL Full-Text Search

```python
# apps/career_plans/models.py
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank

class SharedPlan(models.Model):
    # ...
    
    @classmethod
    def search(cls, query_text):
        """전문 검색 (제목·설명·태그)"""
        search_vector = SearchVector('career_plan__title', weight='A') + \
                        SearchVector('description', weight='B') + \
                        SearchVector('tags', weight='C')
        search_query = SearchQuery(query_text, search_type='websearch')
        
        return cls.objects.annotate(
            rank=SearchRank(search_vector, search_query)
        ).filter(
            rank__gte=0.1
        ).order_by('-rank')

# 사용 예시
results = SharedPlan.search('소프트웨어 개발자')
```

#### 4.3.2 Django-filter 활용

```python
# apps/career_plans/filters.py
import django_filters
from .models import SharedPlan

class SharedPlanFilter(django_filters.FilterSet):
    """공유 패스 필터"""
    
    search = django_filters.CharFilter(method='filter_search')
    share_type = django_filters.ChoiceFilter(choices=SharedPlan.SHARE_TYPE_CHOICES)
    school = django_filters.UUIDFilter(field_name='school__id')
    tags = django_filters.CharFilter(method='filter_tags')
    sort_by = django_filters.OrderingFilter(
        fields=(
            ('shared_at', 'recent'),
            ('updated_at', 'updated'),
            ('like_count', 'likes'),
            ('bookmark_count', 'bookmarks'),
        )
    )
    
    class Meta:
        model = SharedPlan
        fields = ['share_type', 'school', 'tags']
    
    def filter_search(self, queryset, name, value):
        """검색 필터 (제목·설명·작성자 이름)"""
        return queryset.filter(
            models.Q(career_plan__title__icontains=value) |
            models.Q(description__icontains=value) |
            models.Q(user__name__icontains=value)
        )
    
    def filter_tags(self, queryset, name, value):
        """태그 필터 (쉼표 구분)"""
        tags = [tag.strip() for tag in value.split(',')]
        return queryset.filter(tags__overlap=tags)

# ViewSet에서 사용
class SharedPlanViewSet(viewsets.ModelViewSet):
    filterset_class = SharedPlanFilter
```

---

## 5. 마이그레이션 전략

### 5.1 초기 마이그레이션

```bash
# 1. 마이그레이션 파일 생성
python manage.py makemigrations

# 2. 마이그레이션 SQL 확인
python manage.py sqlmigrate career_plans 0001

# 3. 마이그레이션 적용
python manage.py migrate

# 4. 특정 앱만 마이그레이션
python manage.py migrate career_plans
```

### 5.2 마이그레이션 파일 예시

```python
# apps/career_plans/migrations/0001_initial.py
from django.db import migrations, models
import django.db.models.deletion
import uuid

class Migration(migrations.Migration):
    initial = True
    
    dependencies = [
        ('accounts', '0001_initial'),
    ]
    
    operations = [
        migrations.CreateModel(
            name='CareerPlan',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True, null=True)),
                ('job_id', models.CharField(max_length=100)),
                ('job_name', models.CharField(max_length=100)),
                ('job_emoji', models.CharField(blank=True, max_length=10, null=True)),
                ('star_id', models.CharField(max_length=100)),
                ('star_name', models.CharField(blank=True, max_length=100, null=True)),
                ('star_emoji', models.CharField(blank=True, max_length=10, null=True)),
                ('star_color', models.CharField(default='#6C5CE7', max_length=20)),
                ('is_template', models.BooleanField(default=False)),
                ('template_category', models.CharField(blank=True, max_length=50, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='career_plans', to='accounts.user')),
            ],
            options={
                'db_table': 'career_plans',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='careerplan',
            index=models.Index(fields=['user', '-created_at'], name='idx_career_plans_user_created'),
        ),
        # ... 추가 인덱스
    ]
```

### 5.3 데이터 마이그레이션

#### 5.3.1 기존 데이터 변환

```python
# apps/career_plans/migrations/0002_migrate_legacy_data.py
from django.db import migrations

def migrate_legacy_share_type(apps, schema_editor):
    """
    하위 호환: 기존 'operator' 값을 'school'로 변환
    """
    SharedPlan = apps.get_model('career_plans', 'SharedPlan')
    SharedPlan.objects.filter(share_type='operator').update(share_type='school')

class Migration(migrations.Migration):
    dependencies = [
        ('career_plans', '0001_initial'),
    ]
    
    operations = [
        migrations.RunPython(migrate_legacy_share_type),
    ]
```

### 5.4 롤백 전략

```bash
# 마이그레이션 롤백
python manage.py migrate career_plans 0001

# 전체 롤백
python manage.py migrate career_plans zero

# 마이그레이션 상태 확인
python manage.py showmigrations
```

---

## 6. 데이터 무결성 및 제약조건

### 6.1 UNIQUE 제약조건

```python
# 1. 이메일 중복 방지
class User(AbstractUser):
    email = models.EmailField(unique=True)

# 2. 학교 코드 중복 방지
class School(models.Model):
    code = models.CharField(max_length=50, unique=True)

# 3. 그룹 초대 코드 중복 방지
class Group(models.Model):
    invite_code = models.CharField(max_length=50, unique=True)

# 4. 그룹 멤버 중복 방지
class GroupMember(models.Model):
    class Meta:
        unique_together = ['group', 'user']

# 5. 공유 패스-그룹 중복 방지
class SharedPlanGroup(models.Model):
    class Meta:
        unique_together = ['shared_plan', 'group']

# 6. 반응 중복 방지 (한 사용자당 한 번만)
class Reaction(models.Model):
    class Meta:
        unique_together = ['user', 'content_type', 'object_id', 'reaction_type']
```

### 6.2 CHECK 제약조건

```python
# apps/career_plans/models.py
from django.core.validators import MinValueValidator, MaxValueValidator

class PlanItem(models.Model):
    difficulty = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="난이도 (1~5)"
    )
    
    months = ArrayField(
        models.IntegerField(
            validators=[MinValueValidator(1), MaxValueValidator(12)]
        ),
        default=list,
        help_text="실행 월 (1~12)"
    )
```

### 6.3 Foreign Key 삭제 규칙

| 모델 | 외래 키 | 삭제 규칙 | 이유 |
|------|---------|-----------|------|
| User.school | School | SET NULL | 학교 삭제 시 사용자는 유지 |
| CareerPlan.user | User | CASCADE | 사용자 삭제 시 패스도 삭제 |
| PlanYear.career_plan | CareerPlan | CASCADE | 패스 삭제 시 학년도 삭제 |
| GoalGroup.plan_year | PlanYear | CASCADE | 학년 삭제 시 목표도 삭제 |
| PlanItem.goal_group | GoalGroup | SET NULL | 목표 삭제 시 활동은 유지 |
| SubItem.plan_item | PlanItem | CASCADE | 활동 삭제 시 하위 항목도 삭제 |
| SharedPlan.career_plan | CareerPlan | CASCADE | 패스 삭제 시 공유도 삭제 |
| Comment.user | User | CASCADE | 사용자 삭제 시 댓글도 삭제 |
| Comment.parent | Comment | CASCADE | 부모 댓글 삭제 시 대댓글도 삭제 |
| Reaction.user | User | CASCADE | 사용자 삭제 시 반응도 삭제 |
| Report.reporter | User | CASCADE | 신고자 삭제 시 신고도 삭제 |
| Report.reviewed_by | User | SET NULL | 검토자 삭제 시 NULL 처리 |

### 6.4 데이터 검증 (Validators)

```python
# apps/career_plans/validators.py
from django.core.exceptions import ValidationError

def validate_grade_id(value):
    """학년 ID 검증"""
    valid_grades = [
        'elem3', 'elem4', 'elem5', 'elem6',
        'mid1', 'mid2', 'mid3',
        'high1', 'high2', 'high3',
        'univ', 'general',
    ]
    if value not in valid_grades:
        raise ValidationError(f'{value} is not a valid grade ID')

def validate_months(value):
    """월 배열 검증"""
    if not value:
        return
    if not all(1 <= month <= 12 for month in value):
        raise ValidationError('Months must be between 1 and 12')

# 모델에 적용
class PlanYear(models.Model):
    grade_id = models.CharField(
        max_length=20,
        validators=[validate_grade_id]
    )

class PlanItem(models.Model):
    months = ArrayField(
        models.IntegerField(),
        default=list,
        validators=[validate_months]
    )
```

---

## 7. 성능 최적화

### 7.1 Django ORM 최적화

#### 7.1.1 only() / defer() - 필요한 필드만 조회

```python
# 목록 조회 시 요약 정보만 로드
CareerPlan.objects.only(
    'id', 'title', 'job_name', 'star_color', 'created_at'
).filter(user=user)

# SQL: SELECT id, title, job_name, star_color, created_at FROM career_plans WHERE user_id = 'uuid';
```

#### 7.1.2 values() / values_list() - 딕셔너리/튜플로 조회

```python
# 딕셔너리로 조회 (모델 인스턴스 생성 안 함)
plans = CareerPlan.objects.filter(user=user).values('id', 'title', 'job_name')
# [{'id': 'uuid-1', 'title': '...', 'job_name': '...'}, ...]

# 튜플로 조회
plan_ids = CareerPlan.objects.filter(user=user).values_list('id', flat=True)
# ['uuid-1', 'uuid-2', ...]
```

#### 7.1.3 annotate() - 집계 쿼리

```python
from django.db.models import Count, Q

# 학년별 활동 수 집계
years_with_counts = PlanYear.objects.filter(career_plan=plan).annotate(
    item_count=Count('items'),
    completed_sub_item_count=Count('items__sub_items', filter=Q(items__sub_items__is_done=True)),
    total_sub_item_count=Count('items__sub_items'),
)

# SQL:
# SELECT plan_years.*,
#        COUNT(plan_items.id) AS item_count,
#        COUNT(sub_items.id) FILTER (WHERE sub_items.is_done = TRUE) AS completed_sub_item_count,
#        COUNT(sub_items.id) AS total_sub_item_count
# FROM plan_years
# LEFT JOIN plan_items ON plan_years.id = plan_items.plan_year_id
# LEFT JOIN sub_items ON plan_items.id = sub_items.plan_item_id
# WHERE plan_years.career_plan_id = 'plan-uuid'
# GROUP BY plan_years.id;
```

### 7.2 Redis 캐싱

#### 7.2.1 캐시 설정

```python
# config/settings/base.py
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'PARSER_CLASS': 'redis.connection.HiredisParser',
            'PICKLE_VERSION': -1,
        },
        'KEY_PREFIX': 'career',
        'TIMEOUT': 300,  # 5분
    }
}
```

#### 7.2.2 캐시 데코레이터

```python
# apps/career_plans/views.py
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator

class CareerPlanViewSet(viewsets.ModelViewSet):
    @method_decorator(cache_page(60 * 5))  # 5분 캐싱
    def retrieve(self, request, *args, **kwargs):
        """상세 조회 (캐싱)"""
        return super().retrieve(request, *args, **kwargs)
```

#### 7.2.3 수동 캐싱

```python
# apps/career_plans/views.py
from django.core.cache import cache

class CareerPlanViewSet(viewsets.ModelViewSet):
    def retrieve(self, request, *args, **kwargs):
        """상세 조회 (수동 캐싱)"""
        plan_id = kwargs['pk']
        cache_key = f"career_plan:{plan_id}"
        
        # 캐시 조회
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)
        
        # DB 조회
        career_plan = self.get_object()
        serializer = CareerPlanDetailSerializer(career_plan)
        
        # 캐시 저장 (5분)
        cache.set(cache_key, serializer.data, 300)
        
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        """수정 (캐시 무효화)"""
        response = super().update(request, *args, **kwargs)
        
        # 캐시 삭제
        plan_id = kwargs['pk']
        cache.delete(f"career_plan:{plan_id}")
        
        return response
```

### 7.3 데이터베이스 연결 풀링

```python
# config/settings/production.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'careerpath',
        'USER': 'careerpath',
        'PASSWORD': 'password',
        'HOST': 'localhost',
        'PORT': '5432',
        'CONN_MAX_AGE': 600,  # 연결 재사용 (10분)
        'OPTIONS': {
            'connect_timeout': 10,
            'options': '-c statement_timeout=30000',  # 30초 타임아웃
        },
    }
}

# PgBouncer 사용 (연결 풀링)
# DATABASES['default']['OPTIONS']['pool'] = True
```

### 7.4 쿼리 최적화 팁

```python
# ❌ 나쁜 예: N+1 문제
plans = CareerPlan.objects.filter(user=user)
for plan in plans:
    print(plan.user.name)  # N번 쿼리 발생

# ✅ 좋은 예: select_related
plans = CareerPlan.objects.select_related('user').filter(user=user)
for plan in plans:
    print(plan.user.name)  # 1번 쿼리

# ❌ 나쁜 예: 반복문 안에서 쿼리
for plan in plans:
    items = PlanItem.objects.filter(plan_year__career_plan=plan)  # N번 쿼리

# ✅ 좋은 예: prefetch_related
plans = CareerPlan.objects.prefetch_related('years__items').filter(user=user)
for plan in plans:
    for year in plan.years.all():
        for item in year.items.all():  # 추가 쿼리 없음
            print(item.title)
```

---

## 8. 백업 및 복구

### 8.1 데이터베이스 백업

#### 8.1.1 pg_dump (전체 백업)

```bash
# 전체 백업
pg_dump -U careerpath -h localhost careerpath > backup_$(date +%Y%m%d_%H%M%S).sql

# 압축 백업
pg_dump -U careerpath -h localhost careerpath | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# 특정 테이블만 백업
pg_dump -U careerpath -h localhost -t career_plans -t plan_years careerpath > backup_career_plans.sql
```

#### 8.1.2 Django dumpdata (JSON 백업)

```bash
# 전체 데이터 백업
python manage.py dumpdata > backup.json

# 특정 앱만 백업
python manage.py dumpdata career_plans > backup_career_plans.json

# 압축 백업
python manage.py dumpdata | gzip > backup.json.gz
```

### 8.2 데이터 복구

#### 8.2.1 pg_restore

```bash
# SQL 파일 복구
psql -U careerpath -h localhost careerpath < backup_20260327_100000.sql

# 압축 파일 복구
gunzip -c backup_20260327_100000.sql.gz | psql -U careerpath -h localhost careerpath
```

#### 8.2.2 Django loaddata

```bash
# JSON 파일 복구
python manage.py loaddata backup.json

# 압축 파일 복구
gunzip -c backup.json.gz | python manage.py loaddata --format=json -
```

### 8.3 자동 백업 (Cron)

```bash
# /etc/cron.d/postgres-backup
# 매일 새벽 3시 백업
0 3 * * * postgres pg_dump -U careerpath careerpath | gzip > /backups/careerpath_$(date +\%Y\%m\%d).sql.gz

# 30일 이상 된 백업 삭제
0 4 * * * find /backups -name "careerpath_*.sql.gz" -mtime +30 -delete
```

---

## 9. 부록

### 9.1 Django 관리자 (Admin)

```python
# apps/career_plans/admin.py
from django.contrib import admin
from .models import CareerPlan, PlanYear, GoalGroup, PlanItem, SubItem

@admin.register(CareerPlan)
class CareerPlanAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'job_name', 'star_name', 'is_template', 'created_at']
    list_filter = ['is_template', 'job_id', 'star_id', 'created_at']
    search_fields = ['title', 'user__name', 'job_name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = [
        ('기본 정보', {
            'fields': ['id', 'user', 'title', 'description']
        }),
        ('직업·적성', {
            'fields': ['job_id', 'job_name', 'job_emoji', 'star_id', 'star_name', 'star_emoji', 'star_color']
        }),
        ('템플릿', {
            'fields': ['is_template', 'template_category']
        }),
        ('타임스탬프', {
            'fields': ['created_at', 'updated_at']
        }),
    ]

@admin.register(SharedPlan)
class SharedPlanAdmin(admin.ModelAdmin):
    list_display = ['career_plan', 'user', 'share_type', 'like_count', 'comment_count', 'shared_at']
    list_filter = ['share_type', 'is_hidden', 'shared_at']
    search_fields = ['career_plan__title', 'user__name']
    readonly_fields = ['id', 'like_count', 'bookmark_count', 'view_count', 'comment_count', 'shared_at']
```

### 9.2 Django Signals (자동 카운터 업데이트)

```python
# apps/reactions/signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Reaction
from apps.career_plans.models import SharedPlan

@receiver(post_save, sender=Reaction)
def increment_reaction_count(sender, instance, created, **kwargs):
    """반응 생성 시 카운터 증가"""
    if not created:
        return
    
    if instance.content_type.model == 'sharedplan':
        shared_plan = SharedPlan.objects.get(id=instance.object_id)
        if instance.reaction_type == 'like':
            shared_plan.like_count += 1
        elif instance.reaction_type == 'bookmark':
            shared_plan.bookmark_count += 1
        shared_plan.save(update_fields=['like_count', 'bookmark_count'])

@receiver(post_delete, sender=Reaction)
def decrement_reaction_count(sender, instance, **kwargs):
    """반응 삭제 시 카운터 감소"""
    if instance.content_type.model == 'sharedplan':
        shared_plan = SharedPlan.objects.get(id=instance.object_id)
        if instance.reaction_type == 'like':
            shared_plan.like_count = max(0, shared_plan.like_count - 1)
        elif instance.reaction_type == 'bookmark':
            shared_plan.bookmark_count = max(0, shared_plan.bookmark_count - 1)
        shared_plan.save(update_fields=['like_count', 'bookmark_count'])
```

### 9.3 Django Management Commands

```python
# apps/career_plans/management/commands/create_templates.py
from django.core.management.base import BaseCommand
from apps.career_plans.models import CareerPlan
import json

class Command(BaseCommand):
    help = '템플릿 커리어 패스 생성'
    
    def handle(self, *args, **options):
        with open('data/career-path-templates.json', 'r', encoding='utf-8') as f:
            templates = json.load(f)
        
        for template_data in templates:
            # 템플릿 생성 로직
            plan = CareerPlan.objects.create(
                user_id='admin-uuid',
                title=template_data['title'],
                is_template=True,
                # ...
            )
            self.stdout.write(self.style.SUCCESS(f'Created template: {plan.title}'))
```

```bash
# 실행
python manage.py create_templates
```

---

## 10. 결론

### 10.1 핵심 요약

1. **Django 모델 16개**:
   - User, School, Group, GroupMember
   - CareerPlan, PlanYear, GoalGroup, PlanItem, SubItem, ItemLink
   - SharedPlan, SharedPlanGroup
   - Comment, Reaction, Report, Notification

2. **데이터베이스 특징**:
   - PostgreSQL ArrayField (태그·월·공유 채널)
   - GenericForeignKey (댓글·반응·신고)
   - 복합 인덱스 (쿼리 최적화)
   - CASCADE 삭제 규칙

3. **성능 최적화**:
   - select_related / prefetch_related
   - Redis 캐싱
   - 연결 풀링 (CONN_MAX_AGE)

4. **데이터 무결성**:
   - UNIQUE 제약조건
   - CHECK 제약조건 (Validators)
   - Foreign Key 삭제 규칙

### 10.2 다음 단계

1. **Phase 1**: User, School, Group 모델 구현
2. **Phase 2**: CareerPlan, PlanYear, PlanItem 모델 구현
3. **Phase 3**: SharedPlan, Comment, Reaction 모델 구현
4. **Phase 4**: Report, Notification 모델 구현

---

**문서 버전**: 2.0.0  
**최종 수정일**: 2026-03-27  
**작성자**: AI Assistant
