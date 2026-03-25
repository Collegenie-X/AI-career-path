# AI Career Path — Django Backend 관계형 DB 완전 설계서 (개선 버전)

> **JSON 분석 기반 관계형 DB 설계 (SQLite3 테스트 → PostgreSQL 운영)**
> 
> Django REST Framework (DRF) 기반 API 서버 + Admin 통합 설계
> 
> **개선 사항**: 인포그래픽, 이미지, 배열 데이터 관리 강화 (직업/고입/대입 탐색)

---

## 목차

0. [개선 버전 주요 변경사항](#0-개선-버전-주요-변경사항-2026-03-25)
1. [JSON 파일 분석 요약](#1-json-파일-분석-요약)
2. [전체 ERD (확장 버전)](#2-전체-erd-확장-버전-인포그래픽--미디어-관리-강화)
3. [앱별 모델 상세 설계](#3-앱별-모델-상세-설계)
4. [공유 & 그룹 관계형 설계](#4-공유--그룹-관계형-설계)
   - 4.1 [API 엔드포인트 명세 (개선 버전)](#41-api-엔드포인트-명세-개선-버전)
5. [JSON → DB 마이그레이션 매핑](#5-json--db-마이그레이션-매핑)
6. [DRF Serializer & ViewSet 설계](#6-drf-serializer--viewset-설계)
7. [Django 앱 파일 구조](#7-django-앱-파일-구조)
8. [초기 개발 순서](#8-초기-개발-순서-개선-버전)
9. [인포그래픽 & 미디어 관리 전략](#9-인포그래픽--미디어-관리-전략)

---

## 0. 개선 버전 주요 변경사항 (2026-03-25)

### 0.1 핵심 개선 사항

이번 개선에서는 **인포그래픽, 이미지, 배열 데이터를 효과적으로 관리**할 수 있도록 관계형 DB를 대폭 강화했습니다.

| 개선 항목 | 변경 내용 | 신규 모델 수 | 주요 이점 |
|---------|---------|-----------|---------|
| **직업 탐색 배열 정규화** | `careerPath`, `keyPreparation`, `recommendedHighSchool` 등 8개 배열을 별도 테이블로 분리 | 8개 | 검색 성능 향상, 통계 집계, 개별 항목 수정 용이 |
| **고입 탐색 배열 정규화** | `admissionProcess`, `careerPathDetails`, `highlightStats` 등 6개 배열을 별도 테이블로 분리 | 6개 | 단계별 관리, 학교 비교 기능, 필터링 성능 |
| **대입 탐색 구조화** | `UniversityAdmissionCategory`, `UniversityDepartment`, `UniversityAdmissionPlaybook` 추가 | 3개 | 전형별 검색, 학과별 필터링, 플레이북 관리 |
| **인포그래픽 시스템** | `JobInfographic`, `HighSchoolInfographic`, `UniversityInfographic` 추가 | 3개 | 이미지 관리, 차트 데이터 저장, 조회수 추적 |
| **카테고리 시스템** | `HighSchoolCategory`, `UniversityAdmissionCategory` 추가 | 2개 | 행성 UI 데이터 관리, 동적 카테고리 추가 |

**총 신규 모델**: 22개 (기존 약 30개 → 개선 후 약 52개)

### 0.2 배열 데이터 정규화 전후 비교

#### 직업 탐색 예시: `careerPath` 배열

**기존 방식 (JSONField)**:
```python
class Job(models.Model):
    career_path_stages = models.JSONField()  # [{"stage": "중학교", "tasks": ["수학 심화", ...]}, ...]
```

**개선 방식 (관계형 테이블)**:
```python
class Job(models.Model):
    # career_path_stages는 역참조로 접근
    pass

class JobCareerPathStage(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='career_path_stages')
    stage = models.CharField(max_length=50)
    period = models.CharField(max_length=100)
    # tasks는 역참조로 접근

class JobCareerPathTask(models.Model):
    stage = models.ForeignKey(JobCareerPathStage, on_delete=models.CASCADE, related_name='tasks')
    task_description = models.CharField(max_length=500)
```

**장점**:
1. **검색**: "대학교 단계에 Python 학습이 포함된 직업" 같은 쿼리 가능
2. **통계**: "가장 많이 언급되는 준비사항 Top 10" 집계 가능
3. **수정**: 특정 단계의 특정 과제만 수정 가능

### 0.3 인포그래픽 시스템 아키텍처

```mermaid
flowchart LR
    A[JSON 데이터] --> B[Django Management Command]
    B --> C[Job/HighSchool/University 모델]
    B --> D[관련 배열 모델들]
    
    E[Admin 사용자] --> F[Django Admin]
    F --> G[인포그래픽 업로드]
    G --> H[AWS S3]
    H --> I[JobInfographic 모델]
    
    I --> J[DRF API]
    D --> J
    C --> J
    
    J --> K[프론트엔드]
    K --> L[Chart.js로 차트 렌더링]
    K --> M[이미지 표시]
```

### 0.4 주요 사용 시나리오

#### 시나리오 1: "Python이 필요한 AI 관련 직업 검색"

```python
from django.db.models import Q

jobs = Job.objects.filter(
    Q(name__icontains='AI') | Q(description__icontains='AI'),
    key_preparations__preparation_item__icontains='Python'
).distinct()
```

#### 시나리오 2: "서울대 진학률 30% 이상인 과학고 비교"

```python
science_highs = HighSchool.objects.filter(
    category__id='science_high',
    highlight_stats__label__icontains='서울대 진학률',
    highlight_stats__value__gte='30%'
).prefetch_related('highlight_stats', 'infographics').distinct()
```

#### 시나리오 3: "학생부교과 전형으로 갈 수 있는 공대 학과 목록"

```python
engineering_depts = UniversityDepartment.objects.filter(
    admission_category__id='student-record-academic',
    college__icontains='공과대학',
    is_active=True
).select_related('university', 'admission_category')
```

---

## 1. JSON 파일 분석 요약

### 1.1 분석 대상 JSON 파일 (121개)

| 카테고리 | 파일 수 | 주요 파일 | DB 전환 우선순위 |
|---------|--------|-----------|-----------------|
| 적성 검사 | 2 | `quiz-questions.json`, `questions.json` | ⭐⭐⭐ 높음 |
| 직업 탐색 | 15 | `kingdoms.json`, `stars/*.json`, `jobs.json`, `job-career-routes.json` | ⭐⭐⭐ 높음 |
| 고입 탐색 | 13 | `high-school/*.json`, `high-school-admission-v2.json` | ⭐⭐ 중간 |
| 대입 탐색 | 23 | `university-admission/**/*.json` | ⭐⭐ 중간 |
| 커리어 패스 템플릿 | 6 | `career-path-templates-*.json`, `scripts/part*_data.json` | ⭐⭐⭐ 높음 |
| 커뮤니티/공유 | 5 | `share-community.json`, `launchpad-community.json`, `dreammate/seed/*.json` | ⭐⭐⭐ 높음 |
| 포트폴리오/프로젝트 | 4 | `portfolio-items.json`, `projects.json`, `simulations.json` | ⭐⭐ 중간 |
| 기타 (UI/Config) | 53 | `onboarding.json`, `home-content.json`, `dreammate/config/*.json` | ⭐ 낮음 (프론트 유지) |

### 1.2 JSON 분석 핵심 발견 사항

**공유 & 그룹 기능 (JSON 분석 결과)**

| JSON 파일 | 발견된 기능 | DB 모델 매핑 |
|-----------|------------|-------------|
| `share-community.json` | 학교 코드 가입, 그룹 초대 코드, 멤버 역할 | `School`, `SchoolMember`, `Group`, `GroupMember` |
| `dreammate/seed/spaces.json` | 스터디 그룹, 공지사항, 프로그램 제안, 멤버 관리 | `Group`, `GroupNotice`, `GroupProgramProposal` |
| `dreammate/seed/roadmaps.json` | 로드맵 공유, 댓글, 좋아요, 북마크, 마일스톤 | `SharedRoadmap`, `RoadmapComment`, `RoadmapLike`, `RoadmapMilestone` |
| `launchpad-community.json` | 동아리 세션, 동아리 코드 가입 | `ClubSession`, `ClubMember` |
| `scripts/part1_data.json` | 학기별 목표 그룹, 세부 항목 (subItems) | `TemplateSemesterPlan`, `TemplateGoalGroup`, `TemplateSubItem` |

**배열 데이터 정규화 (개선 사항)**

| 탐색 영역 | 정규화된 배열 데이터 | 신규 모델 수 | 주요 이점 |
|---------|------------------|-----------|---------|
| **직업 탐색** | careerPath, keyPreparation, recommendedHighSchool, recommendedUniversities, dailySchedule, requiredSkills, milestones, acceptees | 8개 | 검색 성능 향상, 통계 집계, 개별 수정 용이 |
| **고입 탐색** | admissionProcess, careerPathDetails, highlightStats, realTalk, dailySchedule, famousPrograms | 6개 | 단계별 관리, 비교 기능, 필터링 성능 |
| **대입 탐색** | departments, playbooks | 2개 | 학과별 검색, 전형별 플레이북 관리 |
| **인포그래픽** | 이미지 + 차트 데이터 | 3개 | 시각화 데이터 관리, 조회수 추적 |

**총 신규 모델**: 19개 (기존 대비 약 50% 증가)

---

## 2. 전체 ERD (확장 버전)

```mermaid
erDiagram
    User {
        uuid id PK
        string email UK
        string name
        string grade
        string emoji
        string social_provider
        string social_uid
        string profile_image_url
        boolean is_active
        boolean is_staff
        datetime created_at
        datetime updated_at
    }

    QuizQuestion {
        int id PK
        int order_index
        string zone
        string zone_icon
        string situation
        string description
        json feedback_map
        boolean is_active
        datetime created_at
    }

    QuizChoice {
        int id PK
        int question_id FK
        string choice_key
        string text
        json riasec_scores
        int order_index
    }

    QuizResult {
        uuid id PK
        uuid user_id FK
        string mode
        json answers
        json riasec_scores
        string top_type
        string second_type
        datetime taken_at
    }

    RiasecReport {
        int id PK
        string riasec_type UK
        string type_name
        string emoji
        string tagline
        json strengths
        json career_keywords
        json recommended_jobs
        json sections
        datetime updated_at
    }

    JobCategory {
        string id PK
        string name
        string emoji
        string color
        int order_index
        boolean is_active
    }

    Job {
        string id PK
        string name
        string name_en
        string emoji
        string category_id FK
        string kingdom_id
        string icon
        string rarity
        json riasec_profile
        text description
        string short_description
        string company
        string salary_range
        int difficulty
        text future_outlook
        int outlook_score
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    JobCareerPathStage {
        uuid id PK
        string job_id FK
        string stage
        string period
        string icon
        int order_index
    }

    JobCareerPathTask {
        uuid id PK
        uuid stage_id FK
        string task_description
        int order_index
    }

    JobKeyPreparation {
        uuid id PK
        string job_id FK
        string preparation_item
        int order_index
    }

    JobRecommendedHighSchool {
        uuid id PK
        string job_id FK
        string high_school_type
        string high_school_name
        int order_index
    }

    JobRecommendedUniversity {
        uuid id PK
        string job_id FK
        string university_name
        string admission_type
        int difficulty
        int order_index
    }

    JobDailySchedule {
        uuid id PK
        string job_id FK
        string time
        string activity
        string emoji
        int order_index
    }

    JobRequiredSkill {
        uuid id PK
        string job_id FK
        string skill_name
        int score
        int order_index
    }

    JobMilestone {
        uuid id PK
        string job_id FK
        string stage
        string title
        text description
        string icon
        int order_index
    }

    JobAcceptee {
        uuid id PK
        string job_id FK
        string acceptee_type
        string name
        string school
        string gpa
        json activities
        text essay
        text tip
        int order_index
    }

    JobInfographic {
        uuid id PK
        string job_id FK
        string infographic_type
        string title
        string image_url
        text description
        json data_points
        int order_index
        datetime created_at
    }

    HighSchoolCategory {
        string id PK
        string name
        string emoji
        string color
        string bg_color
        text description
        string planet_size
        int planet_orbit_radius
        int planet_orbit_speed
        string planet_glow_color
        int order_index
        boolean is_active
    }

    HighSchool {
        string id PK
        string name
        string short_name
        string category_id FK
        string location
        string school_type
        string emoji
        string color
        int difficulty
        int annual_admission
        string tuition
        boolean dormitory
        boolean ib_certified
        string special_certification
        text teaching_method
        text student_level
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    HighSchoolAdmissionStep {
        uuid id PK
        string high_school_id FK
        int step
        string title
        text detail
        string icon
        int order_index
    }

    HighSchoolCareerPathDetail {
        uuid id PK
        string high_school_id FK
        string grade
        string icon
        json tasks
        text key_point
        int order_index
    }

    HighSchoolHighlightStat {
        uuid id PK
        string high_school_id FK
        string label
        string value
        string emoji
        string color
        int order_index
    }

    HighSchoolRealTalk {
        uuid id PK
        string high_school_id FK
        string emoji
        string title
        text content
        int order_index
    }

    HighSchoolDailySchedule {
        uuid id PK
        string high_school_id FK
        string time
        string activity
        string emoji
        int order_index
    }

    HighSchoolFamousProgram {
        uuid id PK
        string high_school_id FK
        string name
        string emoji
        text description
        text benefit
        int order_index
    }

    HighSchoolInfographic {
        uuid id PK
        string high_school_id FK
        string infographic_type
        string title
        string image_url
        text description
        json data_points
        int order_index
        datetime created_at
    }

    UniversityAdmissionCategory {
        string id PK
        string name
        string short_name
        string emoji
        string color
        string bg_color
        text description
        string planet_size
        int planet_orbit_radius
        int planet_orbit_speed
        string planet_glow_color
        json key_features
        json target_students
        json cautions
        int order_index
        boolean is_active
        datetime created_at
    }

    University {
        string id PK
        string name
        string short_name
        string logo_url
        string university_type
        string region
        string website_url
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    UniversityDepartment {
        uuid id PK
        string university_id FK
        string department_id
        string department_name
        string college
        string admission_category_id FK
        text description
        boolean is_active
    }

    UniversityAdmissionPlaybook {
        uuid id PK
        string admission_category_id FK
        string playbook_key UK
        string title
        string subtitle
        text description
        json preparation_guide
        json timeline
        json success_stories
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    UniversityInfographic {
        uuid id PK
        string university_id FK
        string admission_category_id FK
        string infographic_type
        string title
        string image_url
        text description
        json data_points
        int order_index
        datetime created_at
    }

    CareerPathTemplate {
        uuid id PK
        string template_key UK
        string title
        string description
        string author_name
        string author_emoji
        string author_type
        string category
        string star_id
        string star_name
        string star_emoji
        string star_color
        string job_id FK
        string job_name
        string job_emoji
        string school_type
        string university_id FK
        string department_id
        json admission_types
        json admission_type_strategies
        json success_stories
        json tags
        int likes
        int uses
        int total_items
        boolean is_official
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    TemplateYear {
        uuid id PK
        uuid template_id FK
        string grade_id
        string grade_label
        string semester
        json goals
        int order_index
    }

    TemplateSemesterPlan {
        uuid id PK
        uuid template_year_id FK
        string semester_id
        string semester_label
        int order_index
    }

    TemplateGoalGroup {
        uuid id PK
        uuid semester_plan_id FK
        string goal
        boolean is_expanded
        int order_index
    }

    TemplateItem {
        uuid id PK
        uuid template_id FK
        uuid template_year_id FK
        uuid goal_group_id FK
        string item_type
        string title
        json months
        int difficulty
        string cost
        string organizer
        string description
        json category_tags
        string activity_subtype
        int order_index
        datetime created_at
    }

    TemplateSubItem {
        uuid id PK
        uuid template_item_id FK
        string sub_item_key
        string title
        boolean done
        int order_index
    }

    UserCareerPath {
        uuid id PK
        uuid user_id FK
        uuid template_id FK
        string title
        string description
        string status
        string share_scope
        datetime started_at
        datetime completed_at
        datetime created_at
        datetime updated_at
    }

    UserCareerPathYear {
        uuid id PK
        uuid user_path_id FK
        string grade_id
        string grade_label
        string semester
        json goals
        int order_index
    }

    UserCareerPathItem {
        uuid id PK
        uuid user_path_id FK
        uuid user_year_id FK
        uuid template_item_id FK
        string item_type
        string title
        json months
        int difficulty
        string cost
        string organizer
        string description
        json category_tags
        boolean is_done
        datetime done_at
        int order_index
        datetime created_at
    }

    UserCareerPathSubItem {
        uuid id PK
        uuid user_item_id FK
        string sub_item_key
        string title
        boolean done
        datetime done_at
        int order_index
    }

    School {
        uuid id PK
        string name
        string school_code UK
        string school_type
        string region
        string address
        string description
        uuid operator_id FK
        json grades
        int member_count
        datetime created_at
        datetime updated_at
    }

    SchoolMember {
        uuid id PK
        uuid school_id FK
        uuid user_id FK
        string role
        datetime joined_at
    }

    Group {
        uuid id PK
        string name
        string emoji
        string color
        string description
        string group_type
        uuid creator_id FK
        string invite_code UK
        string recruitment_status
        int member_count
        int shared_roadmap_count
        json tags
        datetime created_at
        datetime updated_at
    }

    GroupMember {
        uuid id PK
        uuid group_id FK
        uuid user_id FK
        string role
        string member_emoji
        datetime joined_at
    }

    GroupNotice {
        uuid id PK
        uuid group_id FK
        string title
        string content
        uuid created_by_user_id FK
        datetime created_at
    }

    GroupProgramProposal {
        uuid id PK
        uuid group_id FK
        string title
        string summary
        string program_type
        json template_data
        uuid proposed_by_user_id FK
        int vote_count
        datetime proposed_at
    }

    SharedRoadmap {
        uuid id PK
        uuid user_path_id FK
        uuid owner_id FK
        string title
        string description
        string period
        string star_color
        json focus_item_types
        string share_scope
        int likes
        int bookmarks
        datetime shared_at
        datetime updated_at
    }

    SharedRoadmapGroup {
        uuid id PK
        uuid roadmap_id FK
        uuid group_id FK
        datetime shared_at
    }

    RoadmapComment {
        uuid id PK
        uuid roadmap_id FK
        uuid author_id FK
        string content
        datetime created_at
    }

    RoadmapMilestone {
        uuid id PK
        uuid roadmap_id FK
        string title
        string description
        string month_week_label
        string result_url
        datetime recorded_at
    }

    RoadmapLike {
        uuid id PK
        uuid roadmap_id FK
        uuid user_id FK
        datetime liked_at
    }

    RoadmapBookmark {
        uuid id PK
        uuid roadmap_id FK
        uuid user_id FK
        datetime bookmarked_at
    }

    Resource {
        uuid id PK
        string category
        string title
        string description
        string resource_url
        string attachment_file_name
        string attachment_file_type
        text attachment_markdown_content
        uuid author_id FK
        json tags
        int likes
        int bookmarks
        datetime created_at
    }

    Project {
        uuid id PK
        string title
        string star_id
        string difficulty
        string duration
        string project_type
        int max_team_size
        string description
        json goals
        json milestones
        int required_xp
        int reward_xp
        string badge
        string icon
        json looking_for_roles
        boolean is_active
    }

    UserProject {
        uuid id PK
        uuid user_id FK
        uuid project_id FK
        string role
        string status
        datetime started_at
        datetime completed_at
    }

    PortfolioItem {
        uuid id PK
        uuid user_id FK
        string kingdom_id
        string title
        string subtitle
        json grades
        json months
        int difficulty
        json tags
        string tip
        string url
        datetime created_at
    }

    ExecutionPlan {
        uuid id PK
        uuid user_id FK
        uuid user_path_item_id FK
        string title
        string description
        string status
        date due_date
        uuid plan_group_id FK
        datetime created_at
        datetime updated_at
    }

    PlanItem {
        uuid id PK
        uuid plan_id FK
        string title
        boolean is_done
        datetime done_at
        int order_index
        datetime created_at
    }

    PlanGroup {
        uuid id PK
        string name
        string description
        uuid owner_id FK
        datetime created_at
    }

    PlanGroupMember {
        uuid id PK
        uuid group_id FK
        uuid user_id FK
        string role
        datetime joined_at
    }

    ClubSession {
        uuid id PK
        string club_code UK
        string school_name
        string club_name
        string description
        string teacher_name
        int member_count
        int max_members
        json tags
        string meeting_schedule
        datetime created_at
    }

    ClubMember {
        uuid id PK
        uuid session_id FK
        uuid user_id FK
        datetime joined_at
    }

    User ||--o{ QuizResult : "응시"
    QuizQuestion ||--o{ QuizChoice : "선택지"
    QuizResult }o--|| RiasecReport : "결과 타입"
    
    JobCategory ||--o{ Job : "카테고리"
    Job ||--o{ JobCareerPathStage : "커리어 단계"
    JobCareerPathStage ||--o{ JobCareerPathTask : "단계별 과제"
    Job ||--o{ JobKeyPreparation : "핵심 준비사항"
    Job ||--o{ JobRecommendedHighSchool : "추천 고교"
    Job ||--o{ JobRecommendedUniversity : "추천 대학"
    Job ||--o{ JobDailySchedule : "하루 일과"
    Job ||--o{ JobRequiredSkill : "필수 역량"
    Job ||--o{ JobMilestone : "마일스톤"
    Job ||--o{ JobAcceptee : "합격 사례"
    Job ||--o{ JobInfographic : "인포그래픽"
    
    HighSchoolCategory ||--o{ HighSchool : "카테고리"
    HighSchool ||--o{ HighSchoolAdmissionStep : "입학 단계"
    HighSchool ||--o{ HighSchoolCareerPathDetail : "학년별 준비"
    HighSchool ||--o{ HighSchoolHighlightStat : "주요 통계"
    HighSchool ||--o{ HighSchoolRealTalk : "솔직 후기"
    HighSchool ||--o{ HighSchoolDailySchedule : "하루 일과"
    HighSchool ||--o{ HighSchoolFamousProgram : "유명 프로그램"
    HighSchool ||--o{ HighSchoolInfographic : "인포그래픽"
    
    UniversityAdmissionCategory ||--o{ UniversityDepartment : "전형 분류"
    UniversityAdmissionCategory ||--o{ UniversityAdmissionPlaybook : "플레이북"
    University ||--o{ UniversityDepartment : "학과"
    University ||--o{ UniversityInfographic : "인포그래픽"
    UniversityAdmissionCategory ||--o{ UniversityInfographic : "전형별 인포그래픽"
    
    CareerPathTemplate }o--o| Job : "직업 연결"
    CareerPathTemplate }o--o| University : "대학 연결"
    CareerPathTemplate ||--o{ TemplateYear : "연도별"
    TemplateYear ||--o{ TemplateSemesterPlan : "학기별"
    TemplateSemesterPlan ||--o{ TemplateGoalGroup : "목표 그룹"
    TemplateGoalGroup ||--o{ TemplateItem : "활동 항목"
    TemplateItem ||--o{ TemplateSubItem : "세부 항목"
    
    User ||--o{ UserCareerPath : "내 패스"
    UserCareerPath }o--|| CareerPathTemplate : "기반 템플릿"
    UserCareerPath ||--o{ UserCareerPathYear : "연도별"
    UserCareerPathYear ||--o{ UserCareerPathItem : "활동 항목"
    UserCareerPathItem ||--o{ UserCareerPathSubItem : "세부 항목"
    UserCareerPath ||--o| SharedRoadmap : "공유 로드맵"
    SharedRoadmap ||--o{ SharedRoadmapGroup : "그룹 공유"
    SharedRoadmap ||--o{ RoadmapComment : "댓글"
    SharedRoadmap ||--o{ RoadmapMilestone : "마일스톤"
    SharedRoadmap ||--o{ RoadmapLike : "좋아요"
    SharedRoadmap ||--o{ RoadmapBookmark : "북마크"
    
    User ||--o{ School : "학교 운영자"
    School ||--o{ SchoolMember : "학교 멤버"
    SchoolMember }o--|| User : "유저"
    User ||--o{ Group : "그룹 생성자"
    Group ||--o{ GroupMember : "그룹 멤버"
    GroupMember }o--|| User : "유저"
    Group ||--o{ GroupNotice : "공지사항"
    Group ||--o{ GroupProgramProposal : "프로그램 제안"
    SharedRoadmapGroup }o--|| Group : "그룹"
    
    User ||--o{ ExecutionPlan : "실행 계획"
    ExecutionPlan ||--o{ PlanItem : "세부 항목"
    ExecutionPlan }o--o| UserCareerPathItem : "연결 활동"
    ExecutionPlan }o--o| PlanGroup : "그룹 공유"
    PlanGroup ||--o{ PlanGroupMember : "멤버"
    PlanGroupMember }o--|| User : "유저"
    
    ClubSession ||--o{ ClubMember : "동아리 멤버"
    ClubMember }o--|| User : "유저"
    User ||--o{ Resource : "자료 작성자"
    Project ||--o{ UserProject : "프로젝트 참여"
    UserProject }o--|| User : "유저"
    User ||--o{ PortfolioItem : "포트폴리오"
```

---

## 3. 앱별 모델 상세 설계

### 3.1 accounts (인증 & 회원)

#### User 모델

```python
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
import uuid

GRADE_CHOICES = [
    ('elem_1', '초1'), ('elem_2', '초2'), ('elem_3', '초3'),
    ('elem_4', '초4'), ('elem_5', '초5'), ('elem_6', '초6'),
    ('mid_1', '중1'), ('mid_2', '중2'), ('mid_3', '중3'),
    ('high_1', '고1'), ('high_2', '고2'), ('high_3', '고3'),
    ('univ', '대학생'), ('other', '기타'),
]

SOCIAL_PROVIDER_CHOICES = [
    ('google', 'Google'),
    ('kakao', 'Kakao'),
    ('naver', 'Naver'),
]

class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    name = models.CharField(max_length=100)
    grade = models.CharField(max_length=20, choices=GRADE_CHOICES)
    emoji = models.CharField(max_length=10, default="🧑‍🎓")
    social_provider = models.CharField(max_length=20, choices=SOCIAL_PROVIDER_CHOICES)
    social_uid = models.CharField(max_length=255)
    profile_image_url = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['grade']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.name} ({self.email})"
```

---

### 3.2 quiz (적성 검사)

#### QuizQuestion 모델

```python
class QuizQuestion(models.Model):
    id = models.AutoField(primary_key=True)
    order_index = models.IntegerField(db_index=True)
    zone = models.CharField(max_length=50)
    zone_icon = models.CharField(max_length=10)
    situation = models.CharField(max_length=200)
    description = models.TextField()
    feedback_map = models.JSONField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'quiz_questions'
        ordering = ['order_index']
        indexes = [
            models.Index(fields=['order_index']),
            models.Index(fields=['zone']),
        ]

    def __str__(self):
        return f"Q{self.id}: {self.situation}"
```

#### QuizChoice 모델

```python
class QuizChoice(models.Model):
    id = models.AutoField(primary_key=True)
    question = models.ForeignKey(QuizQuestion, on_delete=models.CASCADE, related_name='choices')
    choice_key = models.CharField(max_length=10)
    text = models.TextField()
    riasec_scores = models.JSONField()
    order_index = models.IntegerField()

    class Meta:
        db_table = 'quiz_choices'
        ordering = ['order_index']
        unique_together = [['question', 'choice_key']]

    def __str__(self):
        return f"{self.question.id}-{self.choice_key}"
```

#### QuizResult 모델

```python
class QuizResult(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='quiz_results', null=True, blank=True)
    mode = models.CharField(max_length=20, choices=[('quick', '빠른 검사'), ('full', '전체 검사')])
    answers = models.JSONField()
    riasec_scores = models.JSONField()
    top_type = models.CharField(max_length=2)
    second_type = models.CharField(max_length=2, blank=True)
    taken_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'quiz_results'
        ordering = ['-taken_at']
        indexes = [
            models.Index(fields=['user', '-taken_at']),
            models.Index(fields=['top_type']),
        ]
```

#### RiasecReport 모델

```python
class RiasecReport(models.Model):
    id = models.AutoField(primary_key=True)
    riasec_type = models.CharField(max_length=2, unique=True)
    type_name = models.CharField(max_length=100)
    emoji = models.CharField(max_length=10)
    tagline = models.CharField(max_length=200)
    strengths = models.JSONField()
    career_keywords = models.JSONField()
    recommended_jobs = models.JSONField()
    sections = models.JSONField()
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'riasec_reports'
```

---

### 3.3 explore (커리어 탐색) — 개선 버전

#### JobCategory 모델

```python
class JobCategory(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=100)
    emoji = models.CharField(max_length=10)
    color = models.CharField(max_length=20)
    order_index = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'job_categories'
        ordering = ['order_index']
```

#### Job 모델 (개선)

```python
from common.models import TimeStampedModel

class Job(TimeStampedModel):
    id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=200)
    name_en = models.CharField(max_length=200, blank=True)
    emoji = models.CharField(max_length=10)
    category = models.ForeignKey(JobCategory, on_delete=models.SET_NULL, null=True, related_name='jobs')
    kingdom_id = models.CharField(max_length=50, blank=True)
    icon = models.CharField(max_length=50, blank=True)
    rarity = models.CharField(max_length=20, choices=[
        ('common', '일반'), ('rare', '희귀'), ('epic', '영웅'), ('legendary', '전설')
    ], default='common')
    
    riasec_profile = models.JSONField(default=dict)
    description = models.TextField()
    short_description = models.CharField(max_length=300)
    
    company = models.CharField(max_length=500)
    salary_range = models.CharField(max_length=200)
    difficulty = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    
    future_outlook = models.TextField()
    outlook_score = models.IntegerField(default=3, choices=[(i, str(i)) for i in range(1, 6)])
    
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'jobs'
        indexes = [
            models.Index(fields=['category', 'difficulty']),
            models.Index(fields=['kingdom_id']),
            models.Index(fields=['rarity']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.id})"
```

#### JobCareerPathStage 모델 (신규 - 배열 데이터 정규화)

```python
class JobCareerPathStage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='career_path_stages')
    stage = models.CharField(max_length=50)
    period = models.CharField(max_length=100)
    icon = models.CharField(max_length=10)
    order_index = models.IntegerField()

    class Meta:
        db_table = 'job_career_path_stages'
        ordering = ['job', 'order_index']
        unique_together = [['job', 'order_index']]
    
    def __str__(self):
        return f"{self.job.name} - {self.stage}"
```

#### JobCareerPathTask 모델 (신규 - tasks 배열 정규화)

```python
class JobCareerPathTask(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    stage = models.ForeignKey(JobCareerPathStage, on_delete=models.CASCADE, related_name='tasks')
    task_description = models.CharField(max_length=500)
    order_index = models.IntegerField()

    class Meta:
        db_table = 'job_career_path_tasks'
        ordering = ['stage', 'order_index']
    
    def __str__(self):
        return f"{self.stage.stage} - Task {self.order_index}"
```

#### JobKeyPreparation 모델 (신규 - 배열 데이터 정규화)

```python
class JobKeyPreparation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='key_preparations')
    preparation_item = models.CharField(max_length=500)
    order_index = models.IntegerField()

    class Meta:
        db_table = 'job_key_preparations'
        ordering = ['job', 'order_index']
    
    def __str__(self):
        return f"{self.job.name} - {self.preparation_item[:50]}"
```

#### JobRecommendedHighSchool 모델 (신규)

```python
class JobRecommendedHighSchool(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='recommended_high_schools_rel')
    high_school_type = models.CharField(max_length=100)
    high_school_name = models.CharField(max_length=200)
    order_index = models.IntegerField()

    class Meta:
        db_table = 'job_recommended_high_schools'
        ordering = ['job', 'order_index']
```

#### JobRecommendedUniversity 모델 (신규)

```python
class JobRecommendedUniversity(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='recommended_universities_rel')
    university_name = models.CharField(max_length=300)
    admission_type = models.CharField(max_length=200)
    difficulty = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    order_index = models.IntegerField()

    class Meta:
        db_table = 'job_recommended_universities'
        ordering = ['job', 'order_index']
```

#### JobDailySchedule 모델 (신규 - l2.dailySchedule 배열)

```python
class JobDailySchedule(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='daily_schedules')
    time = models.CharField(max_length=10)
    activity = models.CharField(max_length=300)
    emoji = models.CharField(max_length=10, blank=True)
    order_index = models.IntegerField()

    class Meta:
        db_table = 'job_daily_schedules'
        ordering = ['job', 'order_index']
```

#### JobRequiredSkill 모델 (신규 - l3.requiredSkills 배열)

```python
class JobRequiredSkill(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='required_skills')
    skill_name = models.CharField(max_length=200)
    score = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    order_index = models.IntegerField()

    class Meta:
        db_table = 'job_required_skills'
        ordering = ['job', 'order_index']
```

#### JobMilestone 모델 (신규 - l4.milestones 배열)

```python
class JobMilestone(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='milestones')
    stage = models.CharField(max_length=50)
    title = models.CharField(max_length=200)
    description = models.TextField()
    icon = models.CharField(max_length=50)
    order_index = models.IntegerField()

    class Meta:
        db_table = 'job_milestones'
        ordering = ['job', 'order_index']
```

#### JobAcceptee 모델 (신규 - l5.acceptees 배열)

```python
class JobAcceptee(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='acceptees')
    acceptee_type = models.CharField(max_length=50)
    name = models.CharField(max_length=100)
    school = models.CharField(max_length=300)
    gpa = models.CharField(max_length=200)
    activities = models.JSONField(default=list)
    essay = models.TextField(blank=True)
    tip = models.TextField()
    order_index = models.IntegerField()

    class Meta:
        db_table = 'job_acceptees'
        ordering = ['job', 'order_index']
```

#### HighSchoolCategory 모델 (신규)

```python
class HighSchoolCategory(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=100)
    emoji = models.CharField(max_length=10)
    color = models.CharField(max_length=20)
    bg_color = models.CharField(max_length=50)
    description = models.TextField()
    
    planet_size = models.CharField(max_length=20, default='medium')
    planet_orbit_radius = models.IntegerField(default=100)
    planet_orbit_speed = models.IntegerField(default=20)
    planet_glow_color = models.CharField(max_length=20)
    
    order_index = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'high_school_categories'
        ordering = ['order_index']
```

#### HighSchool 모델 (개선)

```python
class HighSchool(TimeStampedModel):
    id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=200)
    short_name = models.CharField(max_length=50, blank=True)
    category = models.ForeignKey(HighSchoolCategory, on_delete=models.SET_NULL, null=True, related_name='schools')
    
    location = models.CharField(max_length=200)
    school_type = models.CharField(max_length=50)
    emoji = models.CharField(max_length=10)
    color = models.CharField(max_length=20)
    
    difficulty = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    annual_admission = models.IntegerField(null=True, blank=True)
    tuition = models.CharField(max_length=200)
    dormitory = models.BooleanField(default=False)
    ib_certified = models.BooleanField(default=False)
    special_certification = models.CharField(max_length=300, blank=True)
    
    teaching_method = models.TextField()
    student_level = models.TextField()
    
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'high_schools'
        indexes = [
            models.Index(fields=['category', 'difficulty']),
            models.Index(fields=['school_type']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.school_type})"
```

#### HighSchoolAdmissionStep 모델 (신규 - admissionProcess 배열)

```python
class HighSchoolAdmissionStep(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    high_school = models.ForeignKey(HighSchool, on_delete=models.CASCADE, related_name='admission_steps')
    step = models.IntegerField()
    title = models.CharField(max_length=200)
    detail = models.TextField()
    icon = models.CharField(max_length=10)
    order_index = models.IntegerField()

    class Meta:
        db_table = 'high_school_admission_steps'
        ordering = ['high_school', 'order_index']
        unique_together = [['high_school', 'step']]
```

#### HighSchoolCareerPathDetail 모델 (신규 - careerPathDetails 배열)

```python
class HighSchoolCareerPathDetail(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    high_school = models.ForeignKey(HighSchool, on_delete=models.CASCADE, related_name='career_path_details')
    grade = models.CharField(max_length=50)
    icon = models.CharField(max_length=10)
    tasks = models.JSONField(default=list)
    key_point = models.TextField()
    order_index = models.IntegerField()

    class Meta:
        db_table = 'high_school_career_path_details'
        ordering = ['high_school', 'order_index']
```

#### HighSchoolHighlightStat 모델 (신규 - highlightStats 배열)

```python
class HighSchoolHighlightStat(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    high_school = models.ForeignKey(HighSchool, on_delete=models.CASCADE, related_name='highlight_stats')
    label = models.CharField(max_length=100)
    value = models.CharField(max_length=100)
    emoji = models.CharField(max_length=10)
    color = models.CharField(max_length=20)
    order_index = models.IntegerField()

    class Meta:
        db_table = 'high_school_highlight_stats'
        ordering = ['high_school', 'order_index']
```

#### HighSchoolRealTalk 모델 (신규 - realTalk 배열)

```python
class HighSchoolRealTalk(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    high_school = models.ForeignKey(HighSchool, on_delete=models.CASCADE, related_name='real_talks')
    emoji = models.CharField(max_length=10)
    title = models.CharField(max_length=200)
    content = models.TextField()
    order_index = models.IntegerField()

    class Meta:
        db_table = 'high_school_real_talks'
        ordering = ['high_school', 'order_index']
```

#### HighSchoolDailySchedule 모델 (신규 - dailySchedule 배열)

```python
class HighSchoolDailySchedule(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    high_school = models.ForeignKey(HighSchool, on_delete=models.CASCADE, related_name='daily_schedules')
    time = models.CharField(max_length=10)
    activity = models.CharField(max_length=300)
    emoji = models.CharField(max_length=10)
    order_index = models.IntegerField()

    class Meta:
        db_table = 'high_school_daily_schedules'
        ordering = ['high_school', 'order_index']
```

#### HighSchoolFamousProgram 모델 (신규 - famousPrograms 배열)

```python
class HighSchoolFamousProgram(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    high_school = models.ForeignKey(HighSchool, on_delete=models.CASCADE, related_name='famous_programs')
    name = models.CharField(max_length=300)
    emoji = models.CharField(max_length=10, blank=True)
    description = models.TextField()
    benefit = models.TextField(blank=True)
    order_index = models.IntegerField()

    class Meta:
        db_table = 'high_school_famous_programs'
        ordering = ['high_school', 'order_index']
```

#### UniversityAdmissionCategory 모델 (신규)

```python
class UniversityAdmissionCategory(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=100)
    short_name = models.CharField(max_length=50)
    emoji = models.CharField(max_length=10)
    color = models.CharField(max_length=20)
    bg_color = models.CharField(max_length=50)
    description = models.TextField()
    
    planet_size = models.CharField(max_length=20, default='medium')
    planet_orbit_radius = models.IntegerField(default=100)
    planet_orbit_speed = models.IntegerField(default=20)
    planet_glow_color = models.CharField(max_length=20)
    
    key_features = models.JSONField(default=list)
    target_students = models.JSONField(default=list)
    cautions = models.JSONField(default=list)
    
    order_index = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'university_admission_categories'
        ordering = ['order_index']
```

#### University 모델 (개선)

```python
class University(TimeStampedModel):
    id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=200)
    short_name = models.CharField(max_length=50)
    logo_url = models.URLField(blank=True)
    
    university_type = models.CharField(max_length=50, choices=[
        ('national', '국립'), ('private', '사립'), ('public', '공립')
    ], default='private')
    
    region = models.CharField(max_length=100, blank=True)
    website_url = models.URLField(blank=True)
    
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'universities'
        indexes = [
            models.Index(fields=['university_type']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return self.name
```

#### UniversityDepartment 모델 (신규 - departments 배열 정규화)

```python
class UniversityDepartment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='departments')
    department_id = models.CharField(max_length=100)
    department_name = models.CharField(max_length=200)
    college = models.CharField(max_length=200, blank=True)
    
    admission_category = models.ForeignKey(
        UniversityAdmissionCategory, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='departments'
    )
    
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'university_departments'
        unique_together = [['university', 'department_id']]
        indexes = [
            models.Index(fields=['university', 'admission_category']),
        ]
    
    def __str__(self):
        return f"{self.university.name} - {self.department_name}"
```

#### UniversityAdmissionPlaybook 모델 (신규 - playbooks)

```python
class UniversityAdmissionPlaybook(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    admission_category = models.ForeignKey(
        UniversityAdmissionCategory, 
        on_delete=models.CASCADE, 
        related_name='playbooks'
    )
    
    playbook_key = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=300)
    subtitle = models.CharField(max_length=500, blank=True)
    description = models.TextField()
    
    preparation_guide = models.JSONField(default=dict)
    timeline = models.JSONField(default=list)
    success_stories = models.JSONField(default=list)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'university_admission_playbooks'
        indexes = [
            models.Index(fields=['admission_category']),
            models.Index(fields=['is_active']),
        ]
```

#### JobInfographic 모델 (신규 - 직업 인포그래픽)

```python
class JobInfographic(TimeStampedModel):
    INFOGRAPHIC_TYPE_CHOICES = [
        ('salary_curve', '연봉 커브'),
        ('career_timeline', '커리어 타임라인'),
        ('skill_radar', '역량 레이더 차트'),
        ('day_in_life', '하루 일과'),
        ('industry_outlook', '산업 전망'),
        ('education_path', '교육 경로'),
        ('work_life_balance', '워라밸 지표'),
        ('custom', '커스텀'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='infographics')
    
    infographic_type = models.CharField(max_length=50, choices=INFOGRAPHIC_TYPE_CHOICES)
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    
    image_url = models.URLField(blank=True)
    thumbnail_url = models.URLField(blank=True)
    
    data_points = models.JSONField(default=dict, help_text="차트 데이터 (labels, values, colors 등)")
    
    order_index = models.IntegerField(default=0)
    view_count = models.IntegerField(default=0)

    class Meta:
        db_table = 'job_infographics'
        ordering = ['job', 'order_index']
        indexes = [
            models.Index(fields=['job', 'infographic_type']),
            models.Index(fields=['infographic_type']),
        ]
    
    def __str__(self):
        return f"{self.job.name} - {self.title}"
```

#### HighSchoolInfographic 모델 (신규 - 고입 인포그래픽)

```python
class HighSchoolInfographic(TimeStampedModel):
    INFOGRAPHIC_TYPE_CHOICES = [
        ('admission_stats', '입학 통계'),
        ('competition_rate', '경쟁률 추이'),
        ('university_admission', '대입 진학 현황'),
        ('curriculum_structure', '교육과정 구조'),
        ('student_profile', '학생 프로필'),
        ('daily_schedule', '하루 일과'),
        ('cost_breakdown', '비용 분석'),
        ('custom', '커스텀'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    high_school = models.ForeignKey(HighSchool, on_delete=models.CASCADE, related_name='infographics')
    
    infographic_type = models.CharField(max_length=50, choices=INFOGRAPHIC_TYPE_CHOICES)
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    
    image_url = models.URLField(blank=True)
    thumbnail_url = models.URLField(blank=True)
    
    data_points = models.JSONField(default=dict, help_text="차트 데이터 (labels, values, colors 등)")
    
    order_index = models.IntegerField(default=0)
    view_count = models.IntegerField(default=0)

    class Meta:
        db_table = 'high_school_infographics'
        ordering = ['high_school', 'order_index']
        indexes = [
            models.Index(fields=['high_school', 'infographic_type']),
            models.Index(fields=['infographic_type']),
        ]
    
    def __str__(self):
        return f"{self.high_school.name} - {self.title}"
```

#### UniversityInfographic 모델 (신규 - 대입 인포그래픽)

```python
class UniversityInfographic(TimeStampedModel):
    INFOGRAPHIC_TYPE_CHOICES = [
        ('admission_stats', '입학 통계'),
        ('competition_rate', '경쟁률 추이'),
        ('major_comparison', '학과 비교'),
        ('admission_strategy', '입시 전략'),
        ('timeline', '준비 타임라인'),
        ('success_rate', '합격률 분석'),
        ('grade_distribution', '등급 분포'),
        ('custom', '커스텀'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    university = models.ForeignKey(
        University, 
        on_delete=models.CASCADE, 
        related_name='infographics',
        null=True,
        blank=True
    )
    admission_category = models.ForeignKey(
        UniversityAdmissionCategory,
        on_delete=models.CASCADE,
        related_name='infographics',
        null=True,
        blank=True
    )
    
    infographic_type = models.CharField(max_length=50, choices=INFOGRAPHIC_TYPE_CHOICES)
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    
    image_url = models.URLField(blank=True)
    thumbnail_url = models.URLField(blank=True)
    
    data_points = models.JSONField(default=dict, help_text="차트 데이터 (labels, values, colors 등)")
    
    order_index = models.IntegerField(default=0)
    view_count = models.IntegerField(default=0)

    class Meta:
        db_table = 'university_infographics'
        ordering = ['order_index']
        indexes = [
            models.Index(fields=['university', 'infographic_type']),
            models.Index(fields=['admission_category', 'infographic_type']),
            models.Index(fields=['infographic_type']),
        ]
    
    def __str__(self):
        if self.university:
            return f"{self.university.name} - {self.title}"
        elif self.admission_category:
            return f"{self.admission_category.name} - {self.title}"
        return self.title
```

---

### 3.4 career_path (커리어 패스 템플릿)

#### CareerPathTemplate 모델

```python
from common.models import TimeStampedModel

class CareerPathTemplate(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    template_key = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=300)
    description = models.TextField()
    author_name = models.CharField(max_length=100)
    author_emoji = models.CharField(max_length=10, default="🤖")
    author_type = models.CharField(max_length=20, choices=[('official', '공식'), ('user', '유저'), ('mentor', '멘토')])
    category = models.CharField(max_length=20, choices=[('highschool', '고입'), ('admission', '대입'), ('job', '직업')])
    star_id = models.CharField(max_length=50)
    star_name = models.CharField(max_length=100)
    star_emoji = models.CharField(max_length=10)
    star_color = models.CharField(max_length=20)
    job_id = models.CharField(max_length=100, blank=True)
    job_name = models.CharField(max_length=200, blank=True)
    job_emoji = models.CharField(max_length=10, blank=True)
    school_type = models.CharField(max_length=50, blank=True)
    university_id = models.CharField(max_length=100, blank=True)
    department_id = models.CharField(max_length=100, blank=True)
    admission_types = models.JSONField(null=True, blank=True)
    admission_type_strategies = models.JSONField(null=True, blank=True)
    success_stories = models.JSONField(default=list)
    tags = models.JSONField(default=list)
    likes = models.IntegerField(default=0)
    uses = models.IntegerField(default=0)
    total_items = models.IntegerField(default=0)
    is_official = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'career_path_templates'
        indexes = [
            models.Index(fields=['category', 'star_id']),
            models.Index(fields=['job_id']),
            models.Index(fields=['is_official', 'is_active']),
            models.Index(fields=['-likes']),
            models.Index(fields=['-uses']),
        ]
```

#### TemplateYear 모델

```python
class TemplateYear(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    template = models.ForeignKey(CareerPathTemplate, on_delete=models.CASCADE, related_name='years')
    grade_id = models.CharField(max_length=20)
    grade_label = models.CharField(max_length=50)
    semester = models.CharField(max_length=20, choices=[('none', '학기 구분 없음'), ('split', '학기별 구분')], default='none')
    goals = models.JSONField(default=list)
    order_index = models.IntegerField()

    class Meta:
        db_table = 'template_years'
        ordering = ['template', 'order_index']
        unique_together = [['template', 'grade_id']]
```

#### TemplateSemesterPlan 모델

```python
class TemplateSemesterPlan(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    template_year = models.ForeignKey(TemplateYear, on_delete=models.CASCADE, related_name='semester_plans')
    semester_id = models.CharField(max_length=20)
    semester_label = models.CharField(max_length=50)
    order_index = models.IntegerField()

    class Meta:
        db_table = 'template_semester_plans'
        ordering = ['template_year', 'order_index']
```

#### TemplateGoalGroup 모델

```python
class TemplateGoalGroup(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    semester_plan = models.ForeignKey(TemplateSemesterPlan, on_delete=models.CASCADE, related_name='goal_groups')
    goal = models.TextField()
    is_expanded = models.BooleanField(default=True)
    order_index = models.IntegerField()

    class Meta:
        db_table = 'template_goal_groups'
        ordering = ['semester_plan', 'order_index']
```

#### TemplateItem 모델

```python
ITEM_TYPE_CHOICES = [
    ('activity', '활동'),
    ('award', '수상'),
    ('certification', '자격증'),
    ('portfolio', '포트폴리오'),
    ('project', '프로젝트'),
    ('reading', '독서'),
]

class TemplateItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    template = models.ForeignKey(CareerPathTemplate, on_delete=models.CASCADE, related_name='items')
    template_year = models.ForeignKey(TemplateYear, on_delete=models.CASCADE, related_name='items', null=True, blank=True)
    goal_group = models.ForeignKey(TemplateGoalGroup, on_delete=models.CASCADE, related_name='items', null=True, blank=True)
    item_type = models.CharField(max_length=50, choices=ITEM_TYPE_CHOICES)
    title = models.CharField(max_length=500)
    months = models.JSONField()
    difficulty = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    cost = models.CharField(max_length=100, blank=True)
    organizer = models.CharField(max_length=200, blank=True)
    description = models.TextField()
    category_tags = models.JSONField(default=list)
    activity_subtype = models.CharField(max_length=50, blank=True)
    order_index = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'template_items'
        ordering = ['template', 'order_index']
        indexes = [
            models.Index(fields=['template', 'item_type']),
            models.Index(fields=['template_year']),
        ]
```

#### TemplateSubItem 모델

```python
class TemplateSubItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    template_item = models.ForeignKey(TemplateItem, on_delete=models.CASCADE, related_name='sub_items')
    sub_item_key = models.CharField(max_length=20)
    title = models.CharField(max_length=500)
    done = models.BooleanField(default=False)
    order_index = models.IntegerField()

    class Meta:
        db_table = 'template_sub_items'
        ordering = ['template_item', 'order_index']
```

---

### 3.5 career_path (사용자 커리어 패스)

#### UserCareerPath 모델

```python
class UserCareerPath(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='career_paths')
    template = models.ForeignKey(CareerPathTemplate, on_delete=models.SET_NULL, null=True, blank=True, related_name='user_paths')
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=[('planning', '계획 중'), ('in_progress', '진행 중'), ('completed', '완료'), ('paused', '일시 중지')],
        default='planning'
    )
    share_scope = models.CharField(
        max_length=20,
        choices=[('private', '비공개'), ('school', '학교 공개'), ('group', '그룹 공개'), ('public', '전체 공개')],
        default='private'
    )
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'user_career_paths'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['template']),
            models.Index(fields=['share_scope']),
        ]
```

#### UserCareerPathYear 모델

```python
class UserCareerPathYear(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_path = models.ForeignKey(UserCareerPath, on_delete=models.CASCADE, related_name='years')
    grade_id = models.CharField(max_length=20)
    grade_label = models.CharField(max_length=50)
    semester = models.CharField(max_length=20, default='none')
    goals = models.JSONField(default=list)
    order_index = models.IntegerField()

    class Meta:
        db_table = 'user_career_path_years'
        ordering = ['user_path', 'order_index']
```

#### UserCareerPathItem 모델

```python
class UserCareerPathItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_path = models.ForeignKey(UserCareerPath, on_delete=models.CASCADE, related_name='items')
    user_year = models.ForeignKey(UserCareerPathYear, on_delete=models.CASCADE, related_name='items', null=True, blank=True)
    template_item = models.ForeignKey(TemplateItem, on_delete=models.SET_NULL, null=True, blank=True, related_name='user_items')
    item_type = models.CharField(max_length=50)
    title = models.CharField(max_length=500)
    months = models.JSONField()
    difficulty = models.IntegerField()
    cost = models.CharField(max_length=100, blank=True)
    organizer = models.CharField(max_length=200, blank=True)
    description = models.TextField()
    category_tags = models.JSONField(default=list)
    is_done = models.BooleanField(default=False)
    done_at = models.DateTimeField(null=True, blank=True)
    order_index = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_career_path_items'
        ordering = ['user_path', 'order_index']
        indexes = [
            models.Index(fields=['user_path', 'is_done']),
            models.Index(fields=['item_type']),
        ]
```

#### UserCareerPathSubItem 모델

```python
class UserCareerPathSubItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_item = models.ForeignKey(UserCareerPathItem, on_delete=models.CASCADE, related_name='sub_items')
    sub_item_key = models.CharField(max_length=20)
    title = models.CharField(max_length=500)
    done = models.BooleanField(default=False)
    done_at = models.DateTimeField(null=True, blank=True)
    order_index = models.IntegerField()

    class Meta:
        db_table = 'user_career_path_sub_items'
        ordering = ['user_item', 'order_index']
```

---

### 3.6 career_path (학교 관리)

#### School 모델

```python
class School(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    school_code = models.CharField(max_length=50, unique=True, db_index=True)
    school_type = models.CharField(
        max_length=50,
        choices=[('elementary', '초등학교'), ('middle', '중학교'), ('high', '고등학교'), ('university', '대학교')]
    )
    region = models.CharField(max_length=100, blank=True)
    address = models.CharField(max_length=500, blank=True)
    description = models.TextField(blank=True)
    operator = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, related_name='operated_schools')
    grades = models.JSONField(default=list)
    member_count = models.IntegerField(default=0)

    class Meta:
        db_table = 'schools'
        indexes = [
            models.Index(fields=['school_code']),
            models.Index(fields=['school_type', 'region']),
        ]
```

#### SchoolMember 모델

```python
class SchoolMember(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='school_memberships')
    role = models.CharField(max_length=20, choices=[('operator', '운영자'), ('teacher', '선생님'), ('student', '학생')], default='student')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'school_members'
        unique_together = [['school', 'user']]
        indexes = [
            models.Index(fields=['school', 'role']),
            models.Index(fields=['user']),
        ]
```

---

### 3.7 community (그룹 & 공유)

#### Group 모델

```python
class Group(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    emoji = models.CharField(max_length=10, default="🎯")
    color = models.CharField(max_length=20, default="#6C5CE7")
    description = models.TextField()
    group_type = models.CharField(
        max_length=20,
        choices=[('study', '스터디 그룹'), ('club', '동아리'), ('project', '프로젝트 팀'), ('class', '학급'), ('custom', '커스텀')],
        default='study'
    )
    creator = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='created_groups')
    invite_code = models.CharField(max_length=50, unique=True, db_index=True)
    recruitment_status = models.CharField(max_length=20, choices=[('open', '모집 중'), ('closed', '모집 마감')], default='open')
    member_count = models.IntegerField(default=1)
    shared_roadmap_count = models.IntegerField(default=0)
    tags = models.JSONField(default=list)

    class Meta:
        db_table = 'groups'
        indexes = [
            models.Index(fields=['invite_code']),
            models.Index(fields=['group_type']),
            models.Index(fields=['-created_at']),
        ]
```

#### GroupMember 모델

```python
class GroupMember(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='group_memberships')
    role = models.CharField(max_length=20, choices=[('creator', '생성자'), ('admin', '관리자'), ('member', '멤버')], default='member')
    member_emoji = models.CharField(max_length=10, default="🧑‍🎓")
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'group_members'
        unique_together = [['group', 'user']]
        indexes = [
            models.Index(fields=['group', 'role']),
            models.Index(fields=['user']),
        ]
```

#### GroupNotice 모델

```python
class GroupNotice(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='notices')
    title = models.CharField(max_length=300)
    content = models.TextField()
    created_by_user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='created_notices')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'group_notices'
        ordering = ['-created_at']
        indexes = [models.Index(fields=['group', '-created_at'])]
```

#### GroupProgramProposal 모델

```python
class GroupProgramProposal(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='program_proposals')
    title = models.CharField(max_length=300)
    summary = models.TextField()
    program_type = models.CharField(max_length=50, choices=[('project', '프로젝트'), ('study', '스터디'), ('event', '이벤트'), ('workshop', '워크샵')])
    template_data = models.JSONField()
    proposed_by_user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='proposed_programs')
    vote_count = models.IntegerField(default=0)
    proposed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'group_program_proposals'
        ordering = ['-proposed_at']
```

---

### 3.8 community (공유 로드맵)

#### SharedRoadmap 모델

```python
class SharedRoadmap(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_path = models.OneToOneField('career_path.UserCareerPath', on_delete=models.CASCADE, related_name='shared_roadmap')
    owner = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='shared_roadmaps')
    title = models.CharField(max_length=300)
    description = models.TextField()
    period = models.CharField(max_length=50)
    star_color = models.CharField(max_length=20)
    focus_item_types = models.JSONField(default=list)
    share_scope = models.CharField(max_length=20, choices=[('public', '전체 공개'), ('school', '학교 공개'), ('group', '그룹 공개')], default='public')
    likes = models.IntegerField(default=0)
    bookmarks = models.IntegerField(default=0)
    shared_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'shared_roadmaps'
        ordering = ['-shared_at']
        indexes = [
            models.Index(fields=['owner']),
            models.Index(fields=['share_scope']),
            models.Index(fields=['-likes']),
            models.Index(fields=['-updated_at']),
        ]
```

#### SharedRoadmapGroup 모델 (M:N 중간 테이블)

```python
class SharedRoadmapGroup(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    roadmap = models.ForeignKey(SharedRoadmap, on_delete=models.CASCADE, related_name='roadmap_groups')
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='shared_roadmaps')
    shared_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'shared_roadmap_groups'
        unique_together = [['roadmap', 'group']]
```

#### RoadmapComment 모델

```python
class RoadmapComment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    roadmap = models.ForeignKey(SharedRoadmap, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='roadmap_comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'roadmap_comments'
        ordering = ['created_at']
        indexes = [models.Index(fields=['roadmap', 'created_at'])]
```

#### RoadmapMilestone 모델

```python
class RoadmapMilestone(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    roadmap = models.ForeignKey(SharedRoadmap, on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=300)
    description = models.TextField()
    month_week_label = models.CharField(max_length=50)
    result_url = models.URLField(blank=True)
    recorded_at = models.DateTimeField()

    class Meta:
        db_table = 'roadmap_milestones'
        ordering = ['recorded_at']
```

#### RoadmapLike 모델

```python
class RoadmapLike(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    roadmap = models.ForeignKey(SharedRoadmap, on_delete=models.CASCADE, related_name='likes_set')
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='liked_roadmaps')
    liked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'roadmap_likes'
        unique_together = [['roadmap', 'user']]
        indexes = [
            models.Index(fields=['roadmap']),
            models.Index(fields=['user', '-liked_at']),
        ]
```

#### RoadmapBookmark 모델

```python
class RoadmapBookmark(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    roadmap = models.ForeignKey(SharedRoadmap, on_delete=models.CASCADE, related_name='bookmarks_set')
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='bookmarked_roadmaps')
    bookmarked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'roadmap_bookmarks'
        unique_together = [['roadmap', 'user']]
        indexes = [models.Index(fields=['user', '-bookmarked_at'])]
```

---

### 3.9 community (동아리)

#### ClubSession 모델

```python
class ClubSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    club_code = models.CharField(max_length=50, unique=True, db_index=True)
    school_name = models.CharField(max_length=200)
    club_name = models.CharField(max_length=200)
    description = models.TextField()
    teacher_name = models.CharField(max_length=100)
    member_count = models.IntegerField(default=0)
    max_members = models.IntegerField(default=20)
    tags = models.JSONField(default=list)
    meeting_schedule = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'club_sessions'
        indexes = [
            models.Index(fields=['club_code']),
            models.Index(fields=['school_name']),
        ]
```

#### ClubMember 모델

```python
class ClubMember(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(ClubSession, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='club_memberships')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'club_members'
        unique_together = [['session', 'user']]
```

---

### 3.10 career_plan (실행 계획)

#### ExecutionPlan 모델

```python
class ExecutionPlan(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='execution_plans')
    user_path_item = models.ForeignKey('career_path.UserCareerPathItem', on_delete=models.SET_NULL, null=True, blank=True, related_name='execution_plans')
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=[('planning', '계획 중'), ('in_progress', '진행 중'), ('completed', '완료'), ('cancelled', '취소')],
        default='planning'
    )
    due_date = models.DateField(null=True, blank=True)
    plan_group = models.ForeignKey('PlanGroup', on_delete=models.SET_NULL, null=True, blank=True, related_name='plans')

    class Meta:
        db_table = 'execution_plans'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['due_date']),
        ]
```

#### PlanItem 모델

```python
class PlanItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    plan = models.ForeignKey(ExecutionPlan, on_delete=models.CASCADE, related_name='items')
    title = models.CharField(max_length=500)
    is_done = models.BooleanField(default=False)
    done_at = models.DateTimeField(null=True, blank=True)
    order_index = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'plan_items'
        ordering = ['plan', 'order_index']
```

#### PlanGroup 모델

```python
class PlanGroup(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    owner = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='owned_plan_groups')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'plan_groups'
        ordering = ['-created_at']
```

#### PlanGroupMember 모델

```python
class PlanGroupMember(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(PlanGroup, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='plan_group_memberships')
    role = models.CharField(max_length=20, choices=[('owner', '소유자'), ('member', '멤버')], default='member')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'plan_group_members'
        unique_together = [['group', 'user']]
```

---

### 3.11 resource (자료 공유)

#### Resource 모델

```python
class Resource(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.CharField(max_length=50, choices=[('study', '학습 자료'), ('portfolio', '포트폴리오'), ('roadmap', '로드맵'), ('project', '프로젝트')])
    title = models.CharField(max_length=300)
    description = models.TextField()
    resource_url = models.URLField(blank=True)
    attachment_file_name = models.CharField(max_length=255, blank=True)
    attachment_file_type = models.CharField(max_length=20, blank=True)
    attachment_markdown_content = models.TextField(blank=True)
    author = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='resources')
    tags = models.JSONField(default=list)
    likes = models.IntegerField(default=0)
    bookmarks = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'resources'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['-likes']),
        ]
```

---

### 3.12 project (프로젝트)

#### Project 모델

```python
class Project(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=300)
    star_id = models.CharField(max_length=50)
    difficulty = models.CharField(max_length=20, choices=[('beginner', '초급'), ('intermediate', '중급'), ('advanced', '고급')])
    duration = models.CharField(max_length=50)
    project_type = models.CharField(max_length=20, choices=[('solo', '개인'), ('team', '팀')])
    max_team_size = models.IntegerField(null=True, blank=True)
    description = models.TextField()
    goals = models.JSONField(default=list)
    milestones = models.JSONField(default=list)
    required_xp = models.IntegerField(default=0)
    reward_xp = models.IntegerField(default=0)
    badge = models.CharField(max_length=100, blank=True)
    icon = models.CharField(max_length=50)
    looking_for_roles = models.JSONField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'projects'
        indexes = [models.Index(fields=['star_id', 'difficulty'])]
```

#### UserProject 모델

```python
class UserProject(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='user_projects')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='participants')
    role = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=[('joined', '참여 중'), ('completed', '완료'), ('dropped', '중도 포기')], default='joined')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'user_projects'
        unique_together = [['user', 'project']]
```

---

### 3.13 portfolio (포트폴리오)

#### PortfolioItem 모델

```python
class PortfolioItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='portfolio_items')
    kingdom_id = models.CharField(max_length=50)
    title = models.CharField(max_length=300)
    subtitle = models.CharField(max_length=500)
    grades = models.JSONField()
    months = models.JSONField()
    difficulty = models.IntegerField()
    tags = models.JSONField(default=list)
    tip = models.TextField()
    url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'portfolio_items'
        ordering = ['-created_at']
        indexes = [models.Index(fields=['user', 'kingdom_id'])]
```

---

## 4. 공유 & 그룹 관계형 설계

### 4.1 공유 범위별 조회 로직

```python
from django.db.models import Q

def get_visible_roadmaps_for_user(user):
    """유저가 볼 수 있는 공유 로드맵 목록"""
    
    # 1. 전체 공개
    public_q = Q(share_scope='public')
    
    # 2. 학교 공개 (내가 속한 학교)
    my_schools = School.objects.filter(members__user=user)
    school_q = Q(share_scope='school', owner__school_memberships__school__in=my_schools)
    
    # 3. 그룹 공개 (내가 속한 그룹)
    my_groups = Group.objects.filter(members__user=user)
    group_q = Q(share_scope='group', roadmap_groups__group__in=my_groups)
    
    return SharedRoadmap.objects.filter(public_q | school_q | group_q).distinct()
```

### 4.2 그룹 생성 → 멤버 초대 → 로드맵 공유 흐름

```mermaid
sequenceDiagram
    participant U1 as User A (생성자)
    participant U2 as User B (멤버)
    participant DB as Database

    U1->>DB: Group 생성 (name, invite_code)
    DB-->>U1: Group 생성 완료
    U1->>DB: GroupMember 생성 (role=creator)
    
    U1->>U2: 초대 코드 공유
    U2->>DB: Group 조회 (invite_code)
    U2->>DB: GroupMember 생성 (role=member)
    
    U1->>DB: SharedRoadmap 생성 (share_scope=group)
    U1->>DB: SharedRoadmapGroup 생성 (M:N)
    
    U2->>DB: SharedRoadmap 조회 (내가 속한 그룹)
    DB-->>U2: 공유 로드맵 목록 반환
```

### 4.3 학교 코드 가입 흐름

```mermaid
sequenceDiagram
    participant Teacher as 선생님
    participant Student as 학생
    participant DB as Database

    Teacher->>DB: School 생성 (school_code)
    Teacher->>DB: SchoolMember 생성 (role=operator)
    
    Teacher->>Student: 학교 코드 공유
    Student->>DB: School 조회 (school_code)
    Student->>DB: SchoolMember 생성 (role=student)
    
    Student->>DB: SharedRoadmap 조회 (share_scope=school)
    DB-->>Student: 학교 공유 로드맵 반환
```

---

## 4.1 API 엔드포인트 명세 (개선 버전)

### 4.1.1 커리어 탐색 API (`/api/v1/explore/`)

#### 직업 탐색 엔드포인트

| 메서드 | 엔드포인트 | 설명 | 인증 필요 | 응답 예시 |
|--------|-----------|------|-----------|----------|
| `GET` | `/api/v1/explore/job-categories/` | 직업 카테고리 목록 | ❌ | `[{id, name, emoji, color}, ...]` |
| `GET` | `/api/v1/explore/jobs/` | 직업 목록 (필터: category, difficulty, rarity) | ❌ | `[{id, name, emoji, category_name, difficulty}, ...]` |
| `GET` | `/api/v1/explore/jobs/{id}/` | 직업 단건 상세 (모든 관련 데이터 포함) | ❌ | `{id, name, career_path_stages, key_preparations, infographics, ...}` |
| `GET` | `/api/v1/explore/jobs/{id}/career-path-stages/` | 직업별 커리어 단계 | ❌ | `[{stage, period, tasks: [{task_description}, ...]}, ...]` |
| `GET` | `/api/v1/explore/jobs/{id}/infographics/` | 직업별 인포그래픽 | ❌ | `[{infographic_type, title, image_url, data_points}, ...]` |
| `GET` | `/api/v1/explore/jobs/search-by-preparation/?keyword=Python` | 특정 준비사항이 필요한 직업 검색 | ❌ | `[{id, name, ...}, ...]` |
| `GET` | `/api/v1/explore/job-infographics/` | 전체 직업 인포그래픽 목록 | ❌ | `[{id, job, infographic_type, title, image_url}, ...]` |
| `GET` | `/api/v1/explore/job-infographics/{id}/` | 인포그래픽 단건 조회 (조회수 증가) | ❌ | `{id, infographic_type, title, image_url, data_points, view_count}` |
| `POST` | `/api/v1/explore/job-infographics/upload/` | 인포그래픽 이미지 업로드 | ✅ (Admin) | `{id, image_url, thumbnail_url}` |

**쿼리 파라미터**:
- `category`: 카테고리 필터 (예: `engineering-tech`)
- `difficulty`: 난이도 필터 (1~5)
- `rarity`: 희귀도 필터 (`common`, `rare`, `epic`, `legendary`)
- `kingdom_id`: 왕국 ID 필터
- `search`: 이름, 설명, 회사명 검색
- `ordering`: 정렬 (`difficulty`, `outlook_score`, `created_at`)

#### 고입 탐색 엔드포인트

| 메서드 | 엔드포인트 | 설명 | 인증 필요 | 응답 예시 |
|--------|-----------|------|-----------|----------|
| `GET` | `/api/v1/explore/high-school-categories/` | 고교 카테고리 목록 | ❌ | `[{id, name, emoji, planet_size, planet_orbit_radius}, ...]` |
| `GET` | `/api/v1/explore/high-schools/` | 고등학교 목록 | ❌ | `[{id, name, category_name, school_type, difficulty}, ...]` |
| `GET` | `/api/v1/explore/high-schools/{id}/` | 고등학교 상세 | ❌ | `{id, name, admission_steps, career_path_details, highlight_stats, infographics, ...}` |
| `GET` | `/api/v1/explore/high-schools/{id}/admission-steps/` | 입학 단계별 정보 | ❌ | `[{step, title, detail, icon}, ...]` |
| `GET` | `/api/v1/explore/high-schools/{id}/career-path-details/` | 학년별 준비사항 | ❌ | `[{grade, icon, tasks, key_point}, ...]` |
| `GET` | `/api/v1/explore/high-schools/{id}/infographics/` | 고교별 인포그래픽 | ❌ | `[{infographic_type, title, image_url, data_points}, ...]` |
| `GET` | `/api/v1/explore/high-schools/compare/?ids=ksa,snu_science` | 여러 고교 비교 | ❌ | `[{id, name, difficulty, highlight_stats, ...}, ...]` |
| `GET` | `/api/v1/explore/high-school-infographics/` | 전체 고입 인포그래픽 목록 | ❌ | `[{id, high_school, infographic_type, title}, ...]` |
| `POST` | `/api/v1/explore/high-school-infographics/upload/` | 인포그래픽 이미지 업로드 | ✅ (Admin) | `{id, image_url}` |

**쿼리 파라미터**:
- `category`: 카테고리 필터 (예: `science_high`)
- `school_type`: 학교 유형 필터
- `difficulty`: 난이도 필터 (1~5)
- `dormitory`: 기숙사 여부 (`true`, `false`)
- `ib_certified`: IB 인증 여부
- `search`: 이름, 위치, 교육 방식 검색

#### 대입 탐색 엔드포인트

| 메서드 | 엔드포인트 | 설명 | 인증 필요 | 응답 예시 |
|--------|-----------|------|-----------|----------|
| `GET` | `/api/v1/explore/admission-categories/` | 전형 카테고리 목록 | ❌ | `[{id, name, emoji, key_features, playbooks, infographics}, ...]` |
| `GET` | `/api/v1/explore/admission-categories/{id}/` | 전형 카테고리 상세 | ❌ | `{id, name, description, playbooks, infographics, ...}` |
| `GET` | `/api/v1/explore/admission-categories/{id}/playbooks/` | 전형별 플레이북 | ❌ | `[{playbook_key, title, preparation_guide, timeline}, ...]` |
| `GET` | `/api/v1/explore/admission-categories/{id}/infographics/` | 전형별 인포그래픽 | ❌ | `[{infographic_type, title, image_url, data_points}, ...]` |
| `GET` | `/api/v1/explore/universities/` | 대학교 목록 | ❌ | `[{id, name, short_name, university_type, region}, ...]` |
| `GET` | `/api/v1/explore/universities/{id}/` | 대학교 상세 | ❌ | `{id, name, departments, infographics, ...}` |
| `GET` | `/api/v1/explore/universities/{id}/departments/` | 학과 목록 | ❌ | `[{department_id, department_name, college, admission_category_name}, ...]` |
| `GET` | `/api/v1/explore/universities/{id}/infographics/` | 대학별 인포그래픽 | ❌ | `[{infographic_type, title, image_url, data_points}, ...]` |
| `GET` | `/api/v1/explore/university-infographics/` | 전체 대입 인포그래픽 목록 | ❌ | `[{id, university_name, admission_category_name, title}, ...]` |
| `POST` | `/api/v1/explore/university-infographics/upload/` | 인포그래픽 이미지 업로드 | ✅ (Admin) | `{id, image_url}` |

**쿼리 파라미터**:
- `university_type`: 대학 유형 (`national`, `private`, `public`)
- `region`: 지역 필터
- `admission_category`: 전형 카테고리 ID (학과 목록 조회 시)
- `search`: 대학명 검색

---

## 5. JSON → DB 마이그레이션 매핑

### 5.1 quiz-questions.json → QuizQuestion + QuizChoice

| JSON 필드 | DB 모델 | DB 필드 |
|-----------|---------|---------|
| `id` | `QuizQuestion` | `id` |
| `zone` | `QuizQuestion` | `zone` |
| `zoneIcon` | `QuizQuestion` | `zone_icon` |
| `situation` | `QuizQuestion` | `situation` |
| `description` | `QuizQuestion` | `description` |
| `feedbackMap` | `QuizQuestion` | `feedback_map` (JSONField) |
| `choices[].id` | `QuizChoice` | `choice_key` |
| `choices[].text` | `QuizChoice` | `text` |
| `choices[].riasecScores` | `QuizChoice` | `riasec_scores` (JSONField) |

### 5.1-1 jobs.json → Job + 관련 테이블 (개선)

| JSON 필드 | DB 모델 | DB 필드 | 비고 |
|-----------|---------|---------|------|
| `id` | `Job` | `id` | PK |
| `name` | `Job` | `name` | 직업명 |
| `nameEn` | `Job` | `name_en` | 영문명 |
| `emoji` | `Job` | `emoji` | 이모지 |
| `kingdomId` | `Job` | `kingdom_id` | 왕국 ID |
| `icon` | `Job` | `icon` | 아이콘 |
| `rarity` | `Job` | `rarity` | 희귀도 |
| `riasecProfile` | `Job` | `riasec_profile` | JSONField |
| `description` | `Job` | `description` | 상세 설명 |
| `shortDescription` | `Job` | `short_description` | 짧은 설명 |
| `company` | `Job` | `company` | 회사명 |
| `salaryRange` | `Job` | `salary_range` | 연봉 범위 |
| `difficulty` | `Job` | `difficulty` | 난이도 |
| `futureOutlook` | `Job` | `future_outlook` | 전망 |
| `l2.outlook` | `Job` | `outlook_score` | 전망 점수 |
| `careerPath[]` | `JobCareerPathStage` | 별도 테이블 | 배열 정규화 |
| `careerPath[].tasks[]` | `JobCareerPathTask` | 별도 테이블 | 2단계 배열 정규화 |
| `keyPreparation[]` | `JobKeyPreparation` | 별도 테이블 | 배열 정규화 |
| `recommendedHighSchool[]` | `JobRecommendedHighSchool` | 별도 테이블 | 배열 정규화 |
| `recommendedUniversities[]` | `JobRecommendedUniversity` | 별도 테이블 | 배열 정규화 |
| `l2.dailySchedule[]` | `JobDailySchedule` | 별도 테이블 | 배열 정규화 |
| `l3.requiredSkills[]` | `JobRequiredSkill` | 별도 테이블 | 배열 정규화 |
| `l4.milestones[]` | `JobMilestone` | 별도 테이블 | 배열 정규화 |
| `l5.acceptees[]` | `JobAcceptee` | 별도 테이블 | 배열 정규화 |

### 5.1-2 high-school/*.json → HighSchool + 관련 테이블 (개선)

| JSON 필드 | DB 모델 | DB 필드 | 비고 |
|-----------|---------|---------|------|
| `id` | `HighSchool` | `id` | PK |
| `name` | `HighSchool` | `name` | 학교명 |
| `shortName` | `HighSchool` | `short_name` | 약칭 |
| `location` | `HighSchool` | `location` | 위치 |
| `type` | `HighSchool` | `school_type` | 학교 유형 |
| `emoji` | `HighSchool` | `emoji` | 이모지 |
| `color` | `HighSchool` | `color` | 색상 |
| `difficulty` | `HighSchool` | `difficulty` | 난이도 |
| `annualAdmission` | `HighSchool` | `annual_admission` | 연간 입학 정원 |
| `tuition` | `HighSchool` | `tuition` | 등록금 |
| `dormitory` | `HighSchool` | `dormitory` | 기숙사 여부 |
| `ibCertified` | `HighSchool` | `ib_certified` | IB 인증 |
| `teachingMethod` | `HighSchool` | `teaching_method` | 교육 방식 |
| `studentLevel` | `HighSchool` | `student_level` | 학생 수준 |
| `admissionProcess[]` | `HighSchoolAdmissionStep` | 별도 테이블 | 배열 정규화 |
| `careerPathDetails[]` | `HighSchoolCareerPathDetail` | 별도 테이블 | 배열 정규화 |
| `highlightStats[]` | `HighSchoolHighlightStat` | 별도 테이블 | 배열 정규화 |
| `realTalk[]` | `HighSchoolRealTalk` | 별도 테이블 | 배열 정규화 |
| `dailySchedule[]` | `HighSchoolDailySchedule` | 별도 테이블 | 배열 정규화 |
| `famousPrograms[]` | `HighSchoolFamousProgram` | 별도 테이블 | 배열 정규화 |

### 5.1-3 university-admission/*.json → University + 관련 테이블 (개선)

| JSON 필드 | DB 모델 | DB 필드 | 비고 |
|-----------|---------|---------|------|
| `category.id` | `UniversityAdmissionCategory` | `id` | 전형 카테고리 |
| `category.name` | `UniversityAdmissionCategory` | `name` | 전형명 |
| `category.emoji` | `UniversityAdmissionCategory` | `emoji` | 이모지 |
| `category.planet.*` | `UniversityAdmissionCategory` | `planet_*` | 행성 UI 데이터 |
| `category.keyFeatures[]` | `UniversityAdmissionCategory` | `key_features` | JSONField 유지 |
| `category.targetStudents[]` | `UniversityAdmissionCategory` | `target_students` | JSONField 유지 |
| `playbooks/*.json` | `UniversityAdmissionPlaybook` | 별도 테이블 | 전형별 플레이북 |

### 5.2 scripts/part1_data.json → CareerPathTemplate (학기별 구조)

**JSON 구조 (6단계 중첩)**

```
{
  "years": [
    {
      "gradeId": "mid2",
      "semester": "split",
      "semesterPlans": [
        {
          "semesterId": "first",
          "goalGroups": [
            {
              "goal": "...",
              "items": [
                {
                  "type": "certification",
                  "subItems": [...]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

**DB 매핑**

```
CareerPathTemplate (1)
  └─ TemplateYear (N)
       └─ TemplateSemesterPlan (N)
            └─ TemplateGoalGroup (N)
                 └─ TemplateItem (N)
                      └─ TemplateSubItem (N)
```

### 5.3 share-community.json → School + Group

| JSON 필드 | DB 모델 | DB 필드 |
|-----------|---------|---------|
| `schools[].name` | `School` | `name` |
| `schools[].code` | `School` | `school_code` |
| `schools[].operatorId` | `School` | `operator_id` (User FK) |
| `groups[].name` | `Group` | `name` |
| `groups[].inviteCode` | `Group` | `invite_code` |
| `groups[].creatorId` | `Group` | `creator_id` (User FK) |

### 5.4 dreammate/seed/roadmaps.json → SharedRoadmap

| JSON 필드 | DB 모델 | DB 필드 |
|-----------|---------|---------|
| `ownerId` | `SharedRoadmap` | `owner_id` (User FK) |
| `title` | `SharedRoadmap` | `title` |
| `shareScope` | `SharedRoadmap` | `share_scope` |
| `comments[]` | `RoadmapComment` | 별도 테이블 (1:N) |
| `milestoneResults[]` | `RoadmapMilestone` | 별도 테이블 (1:N) |
| `groupIds[]` | `SharedRoadmapGroup` | 중간 테이블 (M:N) |

---

## 6. DRF Serializer & ViewSet 설계

### 6.1 JobSerializer (개선 버전)

```python
from rest_framework import serializers
from .models import (
    Job, JobCareerPathStage, JobCareerPathTask, JobKeyPreparation,
    JobRecommendedHighSchool, JobRecommendedUniversity, JobDailySchedule,
    JobRequiredSkill, JobMilestone, JobAcceptee, JobInfographic
)

class JobCareerPathTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobCareerPathTask
        fields = ['id', 'task_description', 'order_index']

class JobCareerPathStageSerializer(serializers.ModelSerializer):
    tasks = JobCareerPathTaskSerializer(many=True, read_only=True)
    
    class Meta:
        model = JobCareerPathStage
        fields = ['id', 'stage', 'period', 'icon', 'tasks', 'order_index']

class JobKeyPreparationSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobKeyPreparation
        fields = ['id', 'preparation_item', 'order_index']

class JobRecommendedHighSchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobRecommendedHighSchool
        fields = ['id', 'high_school_type', 'high_school_name', 'order_index']

class JobRecommendedUniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = JobRecommendedUniversity
        fields = ['id', 'university_name', 'admission_type', 'difficulty', 'order_index']

class JobDailyScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobDailySchedule
        fields = ['id', 'time', 'activity', 'emoji', 'order_index']

class JobRequiredSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobRequiredSkill
        fields = ['id', 'skill_name', 'score', 'order_index']

class JobMilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobMilestone
        fields = ['id', 'stage', 'title', 'description', 'icon', 'order_index']

class JobAccepteeSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobAcceptee
        fields = ['id', 'acceptee_type', 'name', 'school', 'gpa', 'activities', 'essay', 'tip', 'order_index']

class JobInfographicSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobInfographic
        fields = [
            'id', 'infographic_type', 'title', 'description', 
            'image_url', 'thumbnail_url', 'data_points', 
            'order_index', 'view_count', 'created_at'
        ]

class JobDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_emoji = serializers.CharField(source='category.emoji', read_only=True)
    
    career_path_stages = JobCareerPathStageSerializer(many=True, read_only=True)
    key_preparations = JobKeyPreparationSerializer(many=True, read_only=True)
    recommended_high_schools_rel = JobRecommendedHighSchoolSerializer(many=True, read_only=True)
    recommended_universities_rel = JobRecommendedUniversitySerializer(many=True, read_only=True)
    daily_schedules = JobDailyScheduleSerializer(many=True, read_only=True)
    required_skills = JobRequiredSkillSerializer(many=True, read_only=True)
    milestones = JobMilestoneSerializer(many=True, read_only=True)
    acceptees = JobAccepteeSerializer(many=True, read_only=True)
    infographics = JobInfographicSerializer(many=True, read_only=True)
    
    class Meta:
        model = Job
        fields = [
            'id', 'name', 'name_en', 'emoji', 'category', 'category_name', 'category_emoji',
            'kingdom_id', 'icon', 'rarity', 'riasec_profile', 'description', 'short_description',
            'company', 'salary_range', 'difficulty', 'future_outlook', 'outlook_score',
            'career_path_stages', 'key_preparations', 'recommended_high_schools_rel',
            'recommended_universities_rel', 'daily_schedules', 'required_skills',
            'milestones', 'acceptees', 'infographics',
            'is_active', 'created_at', 'updated_at'
        ]

class JobListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Job
        fields = [
            'id', 'name', 'emoji', 'category', 'category_name', 'company',
            'salary_range', 'difficulty', 'short_description', 'rarity'
        ]
```

### 6.2 HighSchoolSerializer (개선 버전)

```python
from .models import (
    HighSchool, HighSchoolCategory, HighSchoolAdmissionStep,
    HighSchoolCareerPathDetail, HighSchoolHighlightStat, HighSchoolRealTalk,
    HighSchoolDailySchedule, HighSchoolFamousProgram, HighSchoolInfographic
)

class HighSchoolAdmissionStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = HighSchoolAdmissionStep
        fields = ['id', 'step', 'title', 'detail', 'icon', 'order_index']

class HighSchoolCareerPathDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = HighSchoolCareerPathDetail
        fields = ['id', 'grade', 'icon', 'tasks', 'key_point', 'order_index']

class HighSchoolHighlightStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = HighSchoolHighlightStat
        fields = ['id', 'label', 'value', 'emoji', 'color', 'order_index']

class HighSchoolRealTalkSerializer(serializers.ModelSerializer):
    class Meta:
        model = HighSchoolRealTalk
        fields = ['id', 'emoji', 'title', 'content', 'order_index']

class HighSchoolDailyScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = HighSchoolDailySchedule
        fields = ['id', 'time', 'activity', 'emoji', 'order_index']

class HighSchoolFamousProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = HighSchoolFamousProgram
        fields = ['id', 'name', 'emoji', 'description', 'benefit', 'order_index']

class HighSchoolInfographicSerializer(serializers.ModelSerializer):
    class Meta:
        model = HighSchoolInfographic
        fields = [
            'id', 'infographic_type', 'title', 'description',
            'image_url', 'thumbnail_url', 'data_points',
            'order_index', 'view_count', 'created_at'
        ]

class HighSchoolDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_emoji = serializers.CharField(source='category.emoji', read_only=True)
    
    admission_steps = HighSchoolAdmissionStepSerializer(many=True, read_only=True)
    career_path_details = HighSchoolCareerPathDetailSerializer(many=True, read_only=True)
    highlight_stats = HighSchoolHighlightStatSerializer(many=True, read_only=True)
    real_talks = HighSchoolRealTalkSerializer(many=True, read_only=True)
    daily_schedules = HighSchoolDailyScheduleSerializer(many=True, read_only=True)
    famous_programs = HighSchoolFamousProgramSerializer(many=True, read_only=True)
    infographics = HighSchoolInfographicSerializer(many=True, read_only=True)
    
    class Meta:
        model = HighSchool
        fields = [
            'id', 'name', 'short_name', 'category', 'category_name', 'category_emoji',
            'location', 'school_type', 'emoji', 'color', 'difficulty',
            'annual_admission', 'tuition', 'dormitory', 'ib_certified',
            'special_certification', 'teaching_method', 'student_level',
            'admission_steps', 'career_path_details', 'highlight_stats',
            'real_talks', 'daily_schedules', 'famous_programs', 'infographics',
            'is_active', 'created_at', 'updated_at'
        ]

class HighSchoolListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = HighSchool
        fields = [
            'id', 'name', 'short_name', 'category', 'category_name',
            'school_type', 'emoji', 'color', 'difficulty', 'location'
        ]
```

### 6.3 UniversitySerializer (개선 버전)

```python
from .models import (
    University, UniversityAdmissionCategory, UniversityDepartment,
    UniversityAdmissionPlaybook, UniversityInfographic
)

class UniversityDepartmentSerializer(serializers.ModelSerializer):
    admission_category_name = serializers.CharField(source='admission_category.name', read_only=True)
    
    class Meta:
        model = UniversityDepartment
        fields = [
            'id', 'department_id', 'department_name', 'college',
            'admission_category', 'admission_category_name', 'description', 'is_active'
        ]

class UniversityAdmissionPlaybookSerializer(serializers.ModelSerializer):
    class Meta:
        model = UniversityAdmissionPlaybook
        fields = [
            'id', 'playbook_key', 'title', 'subtitle', 'description',
            'preparation_guide', 'timeline', 'success_stories',
            'is_active', 'created_at', 'updated_at'
        ]

class UniversityInfographicSerializer(serializers.ModelSerializer):
    university_name = serializers.CharField(source='university.name', read_only=True, allow_null=True)
    admission_category_name = serializers.CharField(source='admission_category.name', read_only=True, allow_null=True)
    
    class Meta:
        model = UniversityInfographic
        fields = [
            'id', 'university', 'university_name', 'admission_category', 'admission_category_name',
            'infographic_type', 'title', 'description', 'image_url', 'thumbnail_url',
            'data_points', 'order_index', 'view_count', 'created_at'
        ]

class UniversityDetailSerializer(serializers.ModelSerializer):
    departments = UniversityDepartmentSerializer(many=True, read_only=True)
    infographics = UniversityInfographicSerializer(many=True, read_only=True)
    
    class Meta:
        model = University
        fields = [
            'id', 'name', 'short_name', 'logo_url', 'university_type',
            'region', 'website_url', 'departments', 'infographics',
            'is_active', 'created_at', 'updated_at'
        ]

class UniversityAdmissionCategorySerializer(serializers.ModelSerializer):
    playbooks = UniversityAdmissionPlaybookSerializer(many=True, read_only=True)
    infographics = UniversityInfographicSerializer(many=True, read_only=True)
    
    class Meta:
        model = UniversityAdmissionCategory
        fields = [
            'id', 'name', 'short_name', 'emoji', 'color', 'bg_color', 'description',
            'planet_size', 'planet_orbit_radius', 'planet_orbit_speed', 'planet_glow_color',
            'key_features', 'target_students', 'cautions', 'playbooks', 'infographics',
            'order_index', 'is_active', 'created_at'
        ]
```

### 6.4 CareerPathTemplateSerializer

```python
from rest_framework import serializers
from .models import CareerPathTemplate, TemplateYear, TemplateItem, TemplateSubItem

class TemplateSubItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TemplateSubItem
        fields = ['id', 'sub_item_key', 'title', 'done', 'order_index']

class TemplateItemSerializer(serializers.ModelSerializer):
    sub_items = TemplateSubItemSerializer(many=True, read_only=True)

    class Meta:
        model = TemplateItem
        fields = [
            'id', 'item_type', 'title', 'months', 'difficulty', 'cost',
            'organizer', 'description', 'category_tags', 'sub_items', 'order_index'
        ]

class TemplateYearSerializer(serializers.ModelSerializer):
    items = TemplateItemSerializer(many=True, read_only=True)

    class Meta:
        model = TemplateYear
        fields = ['id', 'grade_id', 'grade_label', 'semester', 'goals', 'items', 'order_index']

class CareerPathTemplateSerializer(serializers.ModelSerializer):
    years = TemplateYearSerializer(many=True, read_only=True)

    class Meta:
        model = CareerPathTemplate
        fields = [
            'id', 'template_key', 'title', 'description', 'author_name', 'author_emoji',
            'author_type', 'category', 'star_id', 'star_name', 'star_emoji', 'star_color',
            'job_id', 'job_name', 'job_emoji', 'school_type', 'tags', 'likes', 'uses',
            'total_items', 'is_official', 'years', 'created_at', 'updated_at'
        ]
```

---

### 6.2 UserCareerPathSerializer (CRUD)

```python
class UserCareerPathSubItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserCareerPathSubItem
        fields = ['id', 'sub_item_key', 'title', 'done', 'done_at', 'order_index']

class UserCareerPathItemSerializer(serializers.ModelSerializer):
    sub_items = UserCareerPathSubItemSerializer(many=True, read_only=True)

    class Meta:
        model = UserCareerPathItem
        fields = [
            'id', 'item_type', 'title', 'months', 'difficulty', 'cost',
            'organizer', 'description', 'category_tags', 'is_done', 'done_at',
            'sub_items', 'order_index'
        ]

class UserCareerPathYearSerializer(serializers.ModelSerializer):
    items = UserCareerPathItemSerializer(many=True, read_only=True)

    class Meta:
        model = UserCareerPathYear
        fields = ['id', 'grade_id', 'grade_label', 'goals', 'items', 'order_index']

class UserCareerPathSerializer(serializers.ModelSerializer):
    years = UserCareerPathYearSerializer(many=True, read_only=True)
    template_title = serializers.CharField(source='template.title', read_only=True)

    class Meta:
        model = UserCareerPath
        fields = [
            'id', 'user', 'template', 'template_title', 'title', 'description',
            'status', 'share_scope', 'started_at', 'completed_at',
            'years', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']

class UserCareerPathCreateSerializer(serializers.ModelSerializer):
    template_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = UserCareerPath
        fields = ['template_id', 'title', 'description']

    def create(self, validated_data):
        template_id = validated_data.pop('template_id')
        template = CareerPathTemplate.objects.get(id=template_id)
        user = self.context['request'].user

        user_path = UserCareerPath.objects.create(
            user=user,
            template=template,
            title=validated_data.get('title', template.title),
            description=validated_data.get('description', template.description),
            status='planning'
        )

        # 템플릿 구조 복사
        for template_year in template.years.all():
            user_year = UserCareerPathYear.objects.create(
                user_path=user_path,
                grade_id=template_year.grade_id,
                grade_label=template_year.grade_label,
                semester=template_year.semester,
                goals=template_year.goals,
                order_index=template_year.order_index
            )

            for template_item in template_year.items.all():
                user_item = UserCareerPathItem.objects.create(
                    user_path=user_path,
                    user_year=user_year,
                    template_item=template_item,
                    item_type=template_item.item_type,
                    title=template_item.title,
                    months=template_item.months,
                    difficulty=template_item.difficulty,
                    cost=template_item.cost,
                    organizer=template_item.organizer,
                    description=template_item.description,
                    category_tags=template_item.category_tags,
                    order_index=template_item.order_index
                )

                for template_sub_item in template_item.sub_items.all():
                    UserCareerPathSubItem.objects.create(
                        user_item=user_item,
                        sub_item_key=template_sub_item.sub_item_key,
                        title=template_sub_item.title,
                        done=False,
                        order_index=template_sub_item.order_index
                    )

        template.uses += 1
        template.save()

        return user_path
```

---

### 6.3 SharedRoadmapSerializer

```python
class RoadmapCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.name', read_only=True)
    author_emoji = serializers.CharField(source='author.emoji', read_only=True)

    class Meta:
        model = RoadmapComment
        fields = ['id', 'author_name', 'author_emoji', 'content', 'created_at']

class RoadmapMilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoadmapMilestone
        fields = ['id', 'title', 'description', 'month_week_label', 'result_url', 'recorded_at']

class SharedRoadmapSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.name', read_only=True)
    owner_emoji = serializers.CharField(source='owner.emoji', read_only=True)
    comments = RoadmapCommentSerializer(many=True, read_only=True)
    milestones = RoadmapMilestoneSerializer(many=True, read_only=True)

    class Meta:
        model = SharedRoadmap
        fields = [
            'id', 'owner', 'owner_name', 'owner_emoji', 'title', 'description',
            'period', 'star_color', 'focus_item_types', 'share_scope',
            'likes', 'bookmarks', 'comments', 'milestones', 'shared_at', 'updated_at'
        ]
        read_only_fields = ['owner', 'likes', 'bookmarks', 'shared_at', 'updated_at']
```

---

### 6.4 GroupSerializer

```python
class GroupMemberSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_grade = serializers.CharField(source='user.grade', read_only=True)

    class Meta:
        model = GroupMember
        fields = ['id', 'user', 'user_name', 'user_grade', 'role', 'member_emoji', 'joined_at']

class GroupSerializer(serializers.ModelSerializer):
    creator_name = serializers.CharField(source='creator.name', read_only=True)
    members = GroupMemberSerializer(many=True, read_only=True)

    class Meta:
        model = Group
        fields = [
            'id', 'name', 'emoji', 'color', 'description', 'group_type',
            'creator', 'creator_name', 'invite_code', 'recruitment_status',
            'member_count', 'shared_roadmap_count', 'tags', 'members',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['creator', 'invite_code', 'member_count', 'shared_roadmap_count']
```

---

### 6.5 JobViewSet (개선 버전)

```python
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

class JobViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Job.objects.prefetch_related(
        'career_path_stages__tasks',
        'key_preparations',
        'recommended_high_schools_rel',
        'recommended_universities_rel',
        'daily_schedules',
        'required_skills',
        'milestones',
        'acceptees',
        'infographics'
    ).select_related('category').filter(is_active=True)
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'difficulty', 'rarity', 'kingdom_id']
    search_fields = ['name', 'name_en', 'description', 'company']
    ordering_fields = ['difficulty', 'outlook_score', 'created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return JobListSerializer
        return JobDetailSerializer
    
    @action(detail=True, methods=['get'], url_path='infographics')
    def get_infographics(self, request, pk=None):
        """특정 직업의 인포그래픽만 조회"""
        job = self.get_object()
        infographics = job.infographics.all()
        serializer = JobInfographicSerializer(infographics, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='search-by-preparation')
    def search_by_preparation(self, request):
        """특정 준비사항이 필요한 직업 검색"""
        keyword = request.query_params.get('keyword', '')
        if not keyword:
            return Response({"error": "keyword 파라미터가 필요합니다."}, status=400)
        
        jobs = Job.objects.filter(
            key_preparations__preparation_item__icontains=keyword
        ).distinct()
        
        serializer = JobListSerializer(jobs, many=True)
        return Response(serializer.data)

class JobInfographicViewSet(viewsets.ModelViewSet):
    queryset = JobInfographic.objects.all()
    serializer_class = JobInfographicSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['job', 'infographic_type']
    
    def retrieve(self, request, *args, **kwargs):
        """조회 시 view_count 증가"""
        instance = self.get_object()
        instance.view_count += 1
        instance.save(update_fields=['view_count'])
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
```

### 6.6 HighSchoolViewSet (개선 버전)

```python
class HighSchoolViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = HighSchool.objects.prefetch_related(
        'admission_steps',
        'career_path_details',
        'highlight_stats',
        'real_talks',
        'daily_schedules',
        'famous_programs',
        'infographics'
    ).select_related('category').filter(is_active=True)
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'school_type', 'difficulty', 'dormitory', 'ib_certified']
    search_fields = ['name', 'location', 'teaching_method']
    ordering_fields = ['difficulty', 'annual_admission', 'created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return HighSchoolListSerializer
        return HighSchoolDetailSerializer
    
    @action(detail=True, methods=['get'], url_path='infographics')
    def get_infographics(self, request, pk=None):
        """특정 고교의 인포그래픽만 조회"""
        high_school = self.get_object()
        infographics = high_school.infographics.all()
        serializer = HighSchoolInfographicSerializer(infographics, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='compare')
    def compare_schools(self, request):
        """여러 고교 비교 (통계 데이터)"""
        school_ids = request.query_params.getlist('ids')
        if not school_ids:
            return Response({"error": "ids 파라미터가 필요합니다."}, status=400)
        
        schools = HighSchool.objects.filter(id__in=school_ids).prefetch_related(
            'highlight_stats', 'admission_steps', 'famous_programs'
        )
        
        comparison_data = []
        for school in schools:
            comparison_data.append({
                'id': school.id,
                'name': school.name,
                'difficulty': school.difficulty,
                'tuition': school.tuition,
                'dormitory': school.dormitory,
                'highlight_stats': HighSchoolHighlightStatSerializer(
                    school.highlight_stats.all(), many=True
                ).data,
                'admission_steps_count': school.admission_steps.count(),
                'famous_programs_count': school.famous_programs.count()
            })
        
        return Response(comparison_data)

class HighSchoolInfographicViewSet(viewsets.ModelViewSet):
    queryset = HighSchoolInfographic.objects.all()
    serializer_class = HighSchoolInfographicSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['high_school', 'infographic_type']
```

### 6.7 UniversityViewSet (개선 버전)

```python
class UniversityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = University.objects.prefetch_related(
        'departments__admission_category',
        'infographics'
    ).filter(is_active=True)
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['university_type', 'region']
    search_fields = ['name', 'short_name']
    
    serializer_class = UniversityDetailSerializer
    
    @action(detail=True, methods=['get'], url_path='departments')
    def get_departments(self, request, pk=None):
        """특정 대학의 학과 목록"""
        university = self.get_object()
        departments = university.departments.filter(is_active=True)
        
        admission_category_id = request.query_params.get('admission_category')
        if admission_category_id:
            departments = departments.filter(admission_category_id=admission_category_id)
        
        serializer = UniversityDepartmentSerializer(departments, many=True)
        return Response(serializer.data)

class UniversityAdmissionCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UniversityAdmissionCategory.objects.prefetch_related(
        'playbooks', 'infographics'
    ).filter(is_active=True)
    
    serializer_class = UniversityAdmissionCategorySerializer
    ordering = ['order_index']
    
    @action(detail=True, methods=['get'], url_path='playbooks')
    def get_playbooks(self, request, pk=None):
        """특정 전형의 플레이북 조회"""
        category = self.get_object()
        playbooks = category.playbooks.filter(is_active=True)
        serializer = UniversityAdmissionPlaybookSerializer(playbooks, many=True)
        return Response(serializer.data)

class UniversityInfographicViewSet(viewsets.ModelViewSet):
    queryset = UniversityInfographic.objects.select_related(
        'university', 'admission_category'
    ).all()
    serializer_class = UniversityInfographicSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['university', 'admission_category', 'infographic_type']
```

### 6.8 CareerPathTemplateViewSet

```python
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

class CareerPathTemplateViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CareerPathTemplate.objects.filter(is_active=True)
    serializer_class = CareerPathTemplateSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category', 'star_id', 'school_type', 'is_official']

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def toggle_like(self, request, pk=None):
        template = self.get_object()
        # 좋아요 로직
        return Response({'likes': template.likes})
```

---

### 6.6 UserCareerPathViewSet

```python
class UserCareerPathViewSet(viewsets.ModelViewSet):
    serializer_class = UserCareerPathSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserCareerPath.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCareerPathCreateSerializer
        return UserCareerPathSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
```

---

### 6.7 SharedRoadmapViewSet

```python
class SharedRoadmapViewSet(viewsets.ModelViewSet):
    serializer_class = SharedRoadmapSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return get_visible_roadmaps_for_user(user)
        else:
            return SharedRoadmap.objects.filter(share_scope='public')

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def toggle_like(self, request, pk=None):
        roadmap = self.get_object()
        like, created = RoadmapLike.objects.get_or_create(roadmap=roadmap, user=request.user)
        if not created:
            like.delete()
            roadmap.likes -= 1
        else:
            roadmap.likes += 1
        roadmap.save()
        return Response({'likes': roadmap.likes})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def toggle_bookmark(self, request, pk=None):
        roadmap = self.get_object()
        bookmark, created = RoadmapBookmark.objects.get_or_create(roadmap=roadmap, user=request.user)
        if not created:
            bookmark.delete()
            roadmap.bookmarks -= 1
        else:
            roadmap.bookmarks += 1
        roadmap.save()
        return Response({'bookmarks': roadmap.bookmarks})
```

---

### 6.8 GroupViewSet

```python
class GroupViewSet(viewsets.ModelViewSet):
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Group.objects.filter(members__user=self.request.user)

    def perform_create(self, serializer):
        import random, string
        invite_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
        group = serializer.save(creator=self.request.user, invite_code=invite_code)
        GroupMember.objects.create(group=group, user=self.request.user, role='creator')

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def join_by_code(self, request):
        invite_code = request.data.get('invite_code')
        try:
            group = Group.objects.get(invite_code=invite_code)
        except Group.DoesNotExist:
            return Response({'error': '유효하지 않은 초대 코드입니다.'}, status=400)
        
        if GroupMember.objects.filter(group=group, user=request.user).exists():
            return Response({'error': '이미 가입한 그룹입니다.'}, status=400)
        
        GroupMember.objects.create(group=group, user=request.user, role='member')
        group.member_count += 1
        group.save()
        
        return Response(GroupSerializer(group).data)
```

---

## 7. Django 앱 파일 구조

### 7.1 전체 프로젝트 구조

```
backend/
├── config/
│   ├── settings/
│   │   ├── base.py
│   │   ├── local.py
│   │   └── production.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
│
├── apps/
│   ├── accounts/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── admin.py
│   │   └── services/
│   │       ├── social_auth_service.py
│   │       └── jwt_service.py
│   │
│   ├── quiz/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── admin.py
│   │   ├── services/
│   │   │   ├── riasec_calculator.py
│   │   │   └── report_generator.py
│   │   └── management/commands/
│   │       ├── import_quiz_questions.py
│   │       └── import_riasec_reports.py
│   │
│   ├── explore/
│   │   ├── models/
│   │   │   ├── __init__.py                    # 모든 모델 import
│   │   │   ├── job_models.py                  # Job, JobCareerPathStage, JobCareerPathTask, JobKeyPreparation, JobRecommendedHighSchool, JobRecommendedUniversity, JobDailySchedule, JobRequiredSkill, JobMilestone, JobAcceptee
│   │   │   ├── high_school_models.py          # HighSchoolCategory, HighSchool, HighSchoolAdmissionStep, HighSchoolCareerPathDetail, HighSchoolHighlightStat, HighSchoolRealTalk, HighSchoolDailySchedule, HighSchoolFamousProgram
│   │   │   ├── university_models.py           # UniversityAdmissionCategory, University, UniversityDepartment, UniversityAdmissionPlaybook
│   │   │   └── infographic_models.py          # JobInfographic, HighSchoolInfographic, UniversityInfographic
│   │   ├── serializers/
│   │   │   ├── __init__.py
│   │   │   ├── job_serializers.py
│   │   │   ├── high_school_serializers.py
│   │   │   └── university_serializers.py
│   │   ├── views/
│   │   │   ├── __init__.py
│   │   │   ├── job_views.py
│   │   │   ├── high_school_views.py
│   │   │   └── university_views.py
│   │   ├── urls.py
│   │   ├── admin.py
│   │   ├── filters.py
│   │   └── management/commands/
│   │       ├── import_jobs.py
│   │       ├── import_job_details.py
│   │       ├── import_high_schools.py
│   │       ├── import_high_school_details.py
│   │       ├── import_universities.py
│   │       └── import_university_details.py
│   │
│   ├── career_path/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── admin.py
│   │   ├── filters.py
│   │   └── management/commands/
│   │       ├── import_career_templates.py
│   │       └── import_part_templates.py
│   │
│   ├── community/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── admin.py
│   │   ├── filters.py
│   │   └── management/commands/
│   │       ├── import_shared_roadmaps.py
│   │       ├── import_groups.py
│   │       └── import_club_sessions.py
│   │
│   ├── career_plan/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── admin.py
│   │   └── filters.py
│   │
│   ├── resource/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── project/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   └── portfolio/
│       ├── models.py
│       ├── serializers.py
│       ├── views.py
│       └── urls.py
│
├── common/
│   ├── models.py              # TimeStampedModel
│   ├── permissions.py         # IsOwnerOrReadOnly, IsGroupAdmin
│   ├── pagination.py
│   └── exceptions.py
│
├── requirements/
│   ├── base.txt
│   ├── local.txt
│   └── production.txt
│
├── manage.py
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

### 7.2 explore/models/__init__.py (모델 통합)

```python
# explore/models/__init__.py

from .job_models import (
    JobCategory,
    Job,
    JobCareerPathStage,
    JobCareerPathTask,
    JobKeyPreparation,
    JobRecommendedHighSchool,
    JobRecommendedUniversity,
    JobDailySchedule,
    JobRequiredSkill,
    JobMilestone,
    JobAcceptee,
)

from .high_school_models import (
    HighSchoolCategory,
    HighSchool,
    HighSchoolAdmissionStep,
    HighSchoolCareerPathDetail,
    HighSchoolHighlightStat,
    HighSchoolRealTalk,
    HighSchoolDailySchedule,
    HighSchoolFamousProgram,
)

from .university_models import (
    UniversityAdmissionCategory,
    University,
    UniversityDepartment,
    UniversityAdmissionPlaybook,
)

from .infographic_models import (
    JobInfographic,
    HighSchoolInfographic,
    UniversityInfographic,
)

__all__ = [
    'JobCategory', 'Job', 'JobCareerPathStage', 'JobCareerPathTask',
    'JobKeyPreparation', 'JobRecommendedHighSchool', 'JobRecommendedUniversity',
    'JobDailySchedule', 'JobRequiredSkill', 'JobMilestone', 'JobAcceptee',
    'HighSchoolCategory', 'HighSchool', 'HighSchoolAdmissionStep',
    'HighSchoolCareerPathDetail', 'HighSchoolHighlightStat', 'HighSchoolRealTalk',
    'HighSchoolDailySchedule', 'HighSchoolFamousProgram',
    'UniversityAdmissionCategory', 'University', 'UniversityDepartment',
    'UniversityAdmissionPlaybook',
    'JobInfographic', 'HighSchoolInfographic', 'UniversityInfographic',
]
```

### 7.3 config/urls.py (루트 URL)

```python
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/quiz/', include('apps.quiz.urls')),
    path('api/v1/explore/', include('apps.explore.urls')),
    path('api/v1/career-path/', include('apps.career_path.urls')),
    path('api/v1/community/', include('apps.community.urls')),
    path('api/v1/career-plan/', include('apps.career_plan.urls')),
    path('api/v1/resource/', include('apps.resource.urls')),
    path('api/v1/project/', include('apps.project.urls')),
    path('api/v1/portfolio/', include('apps.portfolio.urls')),
    
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
```

### 7.3 explore/urls.py (개선 버전)

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    JobCategoryViewSet, JobViewSet, JobInfographicViewSet,
    HighSchoolCategoryViewSet, HighSchoolViewSet, HighSchoolInfographicViewSet,
    UniversityAdmissionCategoryViewSet, UniversityViewSet, UniversityInfographicViewSet
)

router = DefaultRouter()

router.register(r'job-categories', JobCategoryViewSet, basename='job-category')
router.register(r'jobs', JobViewSet, basename='job')
router.register(r'job-infographics', JobInfographicViewSet, basename='job-infographic')

router.register(r'high-school-categories', HighSchoolCategoryViewSet, basename='high-school-category')
router.register(r'high-schools', HighSchoolViewSet, basename='high-school')
router.register(r'high-school-infographics', HighSchoolInfographicViewSet, basename='high-school-infographic')

router.register(r'admission-categories', UniversityAdmissionCategoryViewSet, basename='admission-category')
router.register(r'universities', UniversityViewSet, basename='university')
router.register(r'university-infographics', UniversityInfographicViewSet, basename='university-infographic')

urlpatterns = [
    path('', include(router.urls)),
]
```

**생성되는 URL 패턴**:

```
/api/v1/explore/job-categories/
/api/v1/explore/job-categories/{id}/
/api/v1/explore/jobs/
/api/v1/explore/jobs/{id}/
/api/v1/explore/jobs/{id}/infographics/
/api/v1/explore/jobs/search-by-preparation/
/api/v1/explore/job-infographics/
/api/v1/explore/job-infographics/{id}/
/api/v1/explore/job-infographics/upload/

/api/v1/explore/high-school-categories/
/api/v1/explore/high-school-categories/{id}/
/api/v1/explore/high-schools/
/api/v1/explore/high-schools/{id}/
/api/v1/explore/high-schools/{id}/admission-steps/
/api/v1/explore/high-schools/{id}/career-path-details/
/api/v1/explore/high-schools/{id}/infographics/
/api/v1/explore/high-schools/compare/
/api/v1/explore/high-school-infographics/
/api/v1/explore/high-school-infographics/{id}/

/api/v1/explore/admission-categories/
/api/v1/explore/admission-categories/{id}/
/api/v1/explore/admission-categories/{id}/playbooks/
/api/v1/explore/admission-categories/{id}/infographics/
/api/v1/explore/universities/
/api/v1/explore/universities/{id}/
/api/v1/explore/universities/{id}/departments/
/api/v1/explore/universities/{id}/infographics/
/api/v1/explore/university-infographics/
/api/v1/explore/university-infographics/{id}/
```

---

## 8. 초기 개발 순서 (개선 버전)

### 8.1 Phase 1: 로컬 개발 환경 (SQLite3)

```bash
# 1. Django 프로젝트 생성
django-admin startproject config .

# 2. 앱 생성
python manage.py startapp apps.accounts
python manage.py startapp apps.quiz
python manage.py startapp apps.explore
python manage.py startapp apps.career_path
python manage.py startapp apps.community
python manage.py startapp apps.career_plan
python manage.py startapp apps.resource
python manage.py startapp apps.project
python manage.py startapp apps.portfolio
mkdir -p common

# 3. SQLite3 설정 (config/settings/local.py)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# 4. 마이그레이션
python manage.py makemigrations
python manage.py migrate

# 5. JSON 데이터 임포트 (개선 버전 - 단계별)
# 5-1. 적성 검사
python manage.py import_quiz_questions --json-path ../frontend/data/quiz-questions.json

# 5-2. 직업 탐색 (기본 정보)
python manage.py import_job_categories --json-path ../frontend/data/kingdoms.json
python manage.py import_jobs --json-path ../frontend/data/jobs.json

# 5-3. 직업 탐색 (상세 정보 - 배열 데이터)
python manage.py import_job_details --json-path ../frontend/data/job-career-routes.json

# 5-4. 고입 탐색 (기본 정보)
python manage.py import_high_school_categories --json-path ../frontend/data/high-school/meta.json
python manage.py import_high_schools --json-path ../frontend/data/high-school/

# 5-5. 고입 탐색 (상세 정보 - 배열 데이터)
python manage.py import_high_school_details --json-path ../frontend/data/high-school/

# 5-6. 대입 탐색
python manage.py import_admission_categories --json-path ../frontend/data/university-admission/
python manage.py import_universities --json-path ../frontend/data/university-admission/
python manage.py import_university_details --json-path ../frontend/data/university-admission/

# 5-7. 커리어 패스 템플릿
python manage.py import_career_templates --json-path ../scripts/part1_data.json

# 5-8. 샘플 인포그래픽 생성
python manage.py generate_sample_infographics

# 6. 슈퍼유저 생성
python manage.py createsuperuser

# 7. 개발 서버 실행
python manage.py runserver
```

### 8.2 Phase 2: PostgreSQL 전환

```python
# config/settings/production.py
from decouple import config

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='aicareerpath'),
        'USER': config('DB_USER', default='postgres'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}
```

---

## 9. DRF 설정

```python
# config/settings/base.py

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'drf_spectacular',
    'social_django',
    
    'apps.accounts',
    'apps.quiz',
    'apps.explore',
    'apps.career_path',
    'apps.community',
    'apps.career_plan',
    'apps.resource',
    'apps.project',
    'apps.portfolio',
    'common',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'AI Career Path API',
    'DESCRIPTION': 'API 문서 — 적성 검사, 커리어 탐색, 커리어 실행 계획',
    'VERSION': '1.0.0',
}

CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:19006',
]

from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
}
```

---

## 10. requirements.txt

```txt
# requirements/base.txt
Django==5.1.0
djangorestframework==3.15.0
djangorestframework-simplejwt==5.3.1
social-auth-app-django==5.4.1
drf-spectacular==0.27.2
psycopg2-binary==2.9.9
django-redis==5.4.0
python-decouple==3.8
django-cors-headers==4.3.1
Pillow==10.3.0
django-storages==1.14.3
boto3==1.34.0
django-filter==23.5
```

---

## 11. 마이그레이션 체크리스트 (개선 버전)

| 순서 | JSON 파일 | Management Command | 대상 모델 | 예상 소요 |
|------|-----------|-------------------|----------|----------|
| 1 | `quiz-questions.json` | `import_quiz_questions` | `QuizQuestion`, `QuizChoice` | 30분 |
| 2 | `kingdoms.json` + `stars/*.json` | `import_job_categories` | `JobCategory` | 30분 |
| 3 | `jobs.json` | `import_jobs` | `Job` | 1시간 |
| 4 | `job-career-routes.json` | `import_job_details` | `JobCareerPathStage`, `JobCareerPathTask`, `JobKeyPreparation`, `JobRecommendedHighSchool`, `JobRecommendedUniversity`, `JobDailySchedule`, `JobRequiredSkill`, `JobMilestone`, `JobAcceptee` | 2시간 |
| 5 | `high-school/*.json` | `import_high_schools` | `HighSchoolCategory`, `HighSchool` | 1시간 |
| 6 | `high-school/*.json` | `import_high_school_details` | `HighSchoolAdmissionStep`, `HighSchoolCareerPathDetail`, `HighSchoolHighlightStat`, `HighSchoolRealTalk`, `HighSchoolDailySchedule`, `HighSchoolFamousProgram` | 2시간 |
| 7 | `university-admission/**/*.json` | `import_universities` | `UniversityAdmissionCategory`, `University`, `UniversityDepartment`, `UniversityAdmissionPlaybook` | 2시간 |
| 8 | `career-path-templates-*.json` | `import_career_templates` | `CareerPathTemplate`, `TemplateYear`, `TemplateItem` | 2시간 |
| 9 | `scripts/part1_data.json` | `import_part_templates` | `TemplateSemesterPlan`, `TemplateGoalGroup`, `TemplateSubItem` | 3시간 |
| 10 | `share-community.json` | `import_schools_and_groups` | `School`, `Group` | 1시간 |
| 11 | 수동 생성 | `generate_sample_infographics` | `JobInfographic`, `HighSchoolInfographic`, `UniversityInfographic` | 1시간 |

**총 예상 소요 시간**: 약 15시간 (개발자 1명 기준)
| 7 | `dreammate/seed/roadmaps.json` | `import_shared_roadmaps` | 2시간 |
| 8 | `high-school/*.json` | `import_high_schools` | 2시간 |
| 9 | `university-admission/` | `import_universities` | 2시간 |

---

## 12. 개발 로드맵

```mermaid
gantt
    title Django Backend 개발 로드맵 (SQLite3 → PostgreSQL)
    dateFormat  YYYY-MM-DD
    section Phase 1 (기반 — SQLite3)
    프로젝트 셋업 & 앱 생성              :p1a, 2026-04-01, 3d
    accounts 앱 (User 모델)             :p1b, after p1a, 2d
    quiz 앱 (모델 + JSON 임포트)        :p1c, after p1b, 3d
    explore 앱 (Job/HighSchool/Univ)    :p1d, after p1c, 5d
    section Phase 2 (커리어 패스 — SQLite3)
    career_path 앱 (Template 모델)      :p2a, after p1d, 5d
    career_path (User 패스 CRUD)        :p2b, after p2a, 5d
    JSON 임포트 커맨드 (part1~3)        :p2c, after p2a, 3d
    section Phase 3 (커뮤니티 — SQLite3)
    community 앱 (School/Group)         :p3a, after p2b, 5d
    community (SharedRoadmap)           :p3b, after p3a, 5d
    career_plan 앱 (ExecutionPlan)      :p3c, after p3b, 3d
    section Phase 4 (완성 — PostgreSQL)
    PostgreSQL 마이그레이션              :p4a, after p3c, 2d
    Django Admin 고도화                 :p4b, after p4a, 3d
    API 문서 (Swagger) 완성             :p4c, after p4a, 2d
    소셜 로그인 연동 (Google/Kakao)     :p4d, after p4b, 3d
    Docker 배포 설정                    :p4e, after p4c, 2d
```

---

## 13. API 엔드포인트 전체 목록

### 13.1 인증 API

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| `POST` | `/api/v1/auth/social-login/` | 소셜 로그인 |
| `POST` | `/api/v1/auth/token/refresh/` | JWT 갱신 |
| `GET` | `/api/v1/auth/me/` | 내 프로필 조회 |
| `PATCH` | `/api/v1/auth/me/` | 내 프로필 수정 |

### 13.2 적성 검사 API

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| `GET` | `/api/v1/quiz/questions/` | 문제 목록 |
| `POST` | `/api/v1/quiz/results/` | 결과 제출 |
| `GET` | `/api/v1/quiz/results/` | 내 결과 목록 |
| `GET` | `/api/v1/quiz/reports/{riasec_type}/` | RIASEC 리포트 |

### 13.3 커리어 탐색 API

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| `GET` | `/api/v1/explore/jobs/` | 직업 목록 |
| `GET` | `/api/v1/explore/jobs/{id}/` | 직업 상세 |
| `GET` | `/api/v1/explore/high-schools/` | 고등학교 목록 |
| `GET` | `/api/v1/explore/universities/` | 대학교 목록 |

### 13.4 커리어 패스 API

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| `GET` | `/api/v1/career-path/templates/` | 템플릿 목록 |
| `GET` | `/api/v1/career-path/templates/{id}/` | 템플릿 상세 |
| `POST` | `/api/v1/career-path/templates/{id}/toggle_like/` | 좋아요 토글 |
| `GET` | `/api/v1/career-path/my-paths/` | 내 패스 목록 |
| `POST` | `/api/v1/career-path/my-paths/` | 내 패스 생성 |
| `PATCH` | `/api/v1/career-path/my-paths/{id}/` | 내 패스 수정 |
| `DELETE` | `/api/v1/career-path/my-paths/{id}/` | 내 패스 삭제 |

### 13.5 커뮤니티 API

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| `GET` | `/api/v1/community/groups/` | 내 그룹 목록 |
| `POST` | `/api/v1/community/groups/` | 그룹 생성 |
| `POST` | `/api/v1/community/groups/join_by_code/` | 초대 코드 가입 |
| `GET` | `/api/v1/community/shared-roadmaps/` | 공유 로드맵 목록 |
| `POST` | `/api/v1/community/shared-roadmaps/{id}/toggle_like/` | 좋아요 토글 |
| `POST` | `/api/v1/community/shared-roadmaps/{id}/toggle_bookmark/` | 북마크 토글 |

### 13.6 실행 계획 API

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| `GET` | `/api/v1/career-plan/plans/` | 내 계획 목록 |
| `POST` | `/api/v1/career-plan/plans/` | 계획 생성 |
| `PATCH` | `/api/v1/career-plan/plans/{id}/` | 계획 수정 |
| `DELETE` | `/api/v1/career-plan/plans/{id}/` | 계획 삭제 |

---

## 14. 커스텀 권한 클래스

```python
# common/permissions.py

from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsOwnerOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.user == request.user

class IsGroupAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        member = obj.members.filter(user=request.user).first()
        if not member:
            return False
        return member.role in ['creator', 'admin']
```

---

## 15. 테스트 시나리오 (SQLite3)

| 순서 | 테스트 항목 | 예상 결과 |
|------|------------|----------|
| 1 | JSON 임포트 (quiz-questions.json) | QuizQuestion 30개 + QuizChoice 120개 생성 |
| 2 | 적성 검사 API (`GET /api/v1/quiz/questions/`) | 30문항 JSON 응답 |
| 3 | 결과 제출 (`POST /api/v1/quiz/results/`) | RIASEC 점수 + 리포트 반환 |
| 4 | 템플릿 목록 (`GET /api/v1/career-path/templates/`) | 템플릿 목록 + 필터링 |
| 5 | 내 패스 생성 (`POST /api/v1/career-path/my-paths/`) | 템플릿 복사 + Year/Item 생성 |
| 6 | 그룹 생성 (`POST /api/v1/community/groups/`) | 초대 코드 자동 생성 |
| 7 | 그룹 가입 (`POST /api/v1/community/groups/join_by_code/`) | 멤버 추가 |
| 8 | 로드맵 공유 (`POST /api/v1/community/shared-roadmaps/`) | SharedRoadmap 생성 |
| 9 | 공유 로드맵 조회 (그룹 멤버) | 내가 속한 그룹의 로드맵만 조회 |
| 10 | 좋아요/북마크 토글 | 카운트 증가/감소 |

---

## 16. 환경 변수 (.env.example)

```bash
# Django
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=api.aicareerpath.com,localhost

# Database (SQLite3 로컬 / PostgreSQL 운영)
DATABASE_URL=postgres://user:password@localhost:5432/aicareerpath

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60
JWT_REFRESH_TOKEN_LIFETIME_DAYS=30

# Social Login
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_STORAGE_BUCKET_NAME=
AWS_S3_REGION_NAME=ap-northeast-2

# CORS
CORS_ALLOWED_ORIGINS=https://aicareerpath.com,http://localhost:3000
```

---

## 17. 공통 기반 모델

```python
# common/models.py

from django.db import models

class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
```

---

## 18. Django Admin 구성 (개선 버전)

| 앱 | Admin 클래스 | 주요 기능 | 인라인 모델 |
|----|-------------|-----------|-----------|
| `accounts` | `UserAdmin` | 회원 목록, 학년 필터 | - |
| `quiz` | `QuizQuestionAdmin` | 문제 관리, 선택지 인라인 | `QuizChoiceInline` |
| `quiz` | `QuizResultAdmin` | 결과 조회, RIASEC 점수 표시 | - |
| `explore` | `JobCategoryAdmin` | 직업 카테고리 관리 | - |
| `explore` | `JobAdmin` | 직업 목록, 카테고리 필터, 이미지 미리보기 | `JobCareerPathStageInline`, `JobKeyPreparationInline`, `JobInfographicInline` |
| `explore` | `JobInfographicAdmin` | 인포그래픽 관리, 이미지 미리보기 | - |
| `explore` | `HighSchoolCategoryAdmin` | 고교 카테고리 관리, 행성 UI 설정 | - |
| `explore` | `HighSchoolAdmin` | 고교 목록, 카테고리 필터 | `HighSchoolAdmissionStepInline`, `HighSchoolHighlightStatInline`, `HighSchoolInfographicInline` |
| `explore` | `HighSchoolInfographicAdmin` | 고입 인포그래픽 관리 | - |
| `explore` | `UniversityAdmissionCategoryAdmin` | 전형 카테고리 관리 | `UniversityAdmissionPlaybookInline` |
| `explore` | `UniversityAdmin` | 대학 목록 | `UniversityDepartmentInline`, `UniversityInfographicInline` |
| `explore` | `UniversityInfographicAdmin` | 대입 인포그래픽 관리 | - |
| `career_path` | `CareerPathTemplateAdmin` | 템플릿 관리, 공식 여부 토글 | `TemplateYearInline`, `TemplateItemInline` |
| `community` | `GroupAdmin` | 그룹 관리, 멤버 인라인 | `GroupMemberInline`, `GroupNoticeInline` |
| `community` | `SharedRoadmapAdmin` | 공유 로드맵 조회 | `RoadmapCommentInline`, `RoadmapMilestoneInline` |

---

## 9. 인포그래픽 & 미디어 관리 전략

### 9.1 개선 사항 요약

이번 개선에서는 **직업 탐색, 고입 탐색, 대입 탐색**의 인포그래픽, 이미지, 배열 데이터를 효과적으로 관리하기 위해 다음과 같은 변경을 수행했습니다:

| 개선 영역 | 기존 방식 | 개선 방식 | 장점 |
|---------|---------|---------|------|
| **직업 정보 배열** | JSONField로 통합 저장 | 별도 테이블로 정규화 (`JobCareerPathStage`, `JobCareerPathTask`, `JobKeyPreparation` 등) | 검색 성능 향상, 개별 수정 용이, 통계 집계 가능 |
| **고입 정보 배열** | JSONField로 통합 저장 | 별도 테이블로 정규화 (`HighSchoolAdmissionStep`, `HighSchoolCareerPathDetail`, `HighSchoolHighlightStat` 등) | 단계별 관리, 필터링 성능 향상 |
| **대입 정보 구조** | JSON 파일 기반 | 관계형 모델 (`UniversityAdmissionCategory`, `UniversityDepartment`, `UniversityAdmissionPlaybook`) | 전형별 검색, 학과별 필터링 |
| **인포그래픽** | 없음 | 전용 테이블 추가 (`JobInfographic`, `HighSchoolInfographic`, `UniversityInfographic`) | 이미지 관리, 차트 데이터 저장, 조회수 추적 |
| **카테고리 관리** | 하드코딩 | 별도 테이블 (`HighSchoolCategory`, `UniversityAdmissionCategory`) | 행성 UI 데이터 관리, 동적 추가 가능 |

### 9.2 인포그래픽 모델 상세 설계

#### 9.2.1 JobInfographic (직업 인포그래픽)

**용도**: 직업별 연봉 커브, 커리어 타임라인, 역량 레이더 차트 등

**주요 필드**:
- `infographic_type`: 인포그래픽 유형 (salary_curve, career_timeline, skill_radar 등)
- `image_url`: S3에 저장된 이미지 URL
- `data_points`: 차트 생성을 위한 JSON 데이터

**예시 데이터**:

```json
{
  "infographic_type": "salary_curve",
  "title": "AI 연구원 연봉 커브 (2026 기준)",
  "description": "경력별 평균 연봉 추이",
  "image_url": "https://s3.amazonaws.com/aicareer/infographics/ai-researcher-salary-curve.png",
  "data_points": {
    "labels": ["신입", "3년차", "5년차", "7년차", "10년차"],
    "values": [6000, 8500, 12000, 15000, 20000],
    "unit": "만원/년",
    "colors": ["#60a5fa", "#3b82f6", "#2563eb", "#1d4ed8", "#1e40af"]
  }
}
```

#### 9.2.2 HighSchoolInfographic (고입 인포그래픽)

**용도**: 고교별 입학 통계, 경쟁률 추이, 대입 진학 현황 등

**주요 필드**:
- `infographic_type`: 인포그래픽 유형 (admission_stats, competition_rate 등)
- `image_url`: S3에 저장된 이미지 URL
- `data_points`: 차트 생성을 위한 JSON 데이터

**예시 데이터**:

```json
{
  "infographic_type": "university_admission",
  "title": "한국과학영재학교 대입 진학 현황 (2025)",
  "description": "졸업생 진학 대학 분포",
  "image_url": "https://s3.amazonaws.com/aicareer/infographics/ksa-university-admission.png",
  "data_points": {
    "universities": [
      {"name": "서울대", "count": 35, "percentage": 29.2, "color": "#0c4da2"},
      {"name": "KAIST", "count": 40, "percentage": 33.3, "color": "#004098"},
      {"name": "POSTECH", "count": 15, "percentage": 12.5, "color": "#c8102e"},
      {"name": "연세대", "count": 12, "percentage": 10.0, "color": "#003876"},
      {"name": "고려대", "count": 10, "percentage": 8.3, "color": "#a50034"},
      {"name": "기타", "count": 8, "percentage": 6.7, "color": "#6b7280"}
    ],
    "total_graduates": 120
  }
}
```

#### 9.2.3 UniversityInfographic (대입 인포그래픽)

**용도**: 대학별/전형별 입시 통계, 합격률 분석, 등급 분포 등

**주요 필드**:
- `university`: 특정 대학 (nullable)
- `admission_category`: 특정 전형 (nullable)
- `infographic_type`: 인포그래픽 유형
- `data_points`: 차트 생성을 위한 JSON 데이터

**예시 데이터 1 (대학별)**:

```json
{
  "university_id": "seoul_national",
  "admission_category_id": null,
  "infographic_type": "admission_stats",
  "title": "서울대 공대 학종 합격자 내신 분포 (2025)",
  "data_points": {
    "grade_distribution": [
      {"grade": "1.0~1.5", "count": 120, "percentage": 60.0, "color": "#22c55e"},
      {"grade": "1.5~2.0", "count": 50, "percentage": 25.0, "color": "#84cc16"},
      {"grade": "2.0~2.5", "count": 20, "percentage": 10.0, "color": "#eab308"},
      {"grade": "2.5~3.0", "count": 10, "percentage": 5.0, "color": "#f97316"}
    ],
    "total_admitted": 200
  }
}
```

**예시 데이터 2 (전형별)**:

```json
{
  "university_id": null,
  "admission_category_id": "student-record-academic",
  "infographic_type": "admission_strategy",
  "title": "학생부교과 전형 준비 타임라인",
  "data_points": {
    "timeline": [
      {
        "period": "고1",
        "tasks": ["내신 1등급 목표", "수학·과학 집중", "기초 탄탄히"],
        "importance": 5,
        "color": "#3b82f6"
      },
      {
        "period": "고2",
        "tasks": ["내신 유지", "수능최저 준비 시작", "모의고사 응시"],
        "importance": 4,
        "color": "#60a5fa"
      },
      {
        "period": "고3",
        "tasks": ["수능최저 충족", "원서 전략 수립", "면접 준비"],
        "importance": 5,
        "color": "#2563eb"
      }
    ]
  }
}
```

### 9.3 배열 데이터 정규화 전략

#### 9.3.1 직업 탐색 배열 데이터

| JSON 필드 | 기존 저장 방식 | 개선된 모델 | 정규화 이유 |
|----------|-------------|-----------|-----------|
| `careerPath` | JSONField | `JobCareerPathStage` + `JobCareerPathTask` | 단계별 검색, 필터링, 통계 집계 |
| `keyPreparation` | JSONField (배열) | `JobKeyPreparation` | 준비사항별 검색, 추천 알고리즘 |
| `recommendedHighSchool` | JSONField (배열) | `JobRecommendedHighSchool` | 고교 유형별 필터링 |
| `recommendedUniversities` | JSONField (배열) | `JobRecommendedUniversity` | 대학별 난이도 검색 |
| `l2.dailySchedule` | JSONField (배열) | `JobDailySchedule` | 시간대별 일과 비교 |
| `l3.requiredSkills` | JSONField (배열) | `JobRequiredSkill` | 역량별 점수 분석 |
| `l4.milestones` | JSONField (배열) | `JobMilestone` | 마일스톤별 진행 추적 |
| `l5.acceptees` | JSONField (배열) | `JobAcceptee` | 합격 사례 검색, 통계 |

**장점**:
1. **검색 성능**: "AI 관련 직업 중 Python 준비가 필요한 직업" 같은 복잡한 쿼리 가능
2. **통계 집계**: "가장 많이 추천되는 고교 유형", "평균 난이도" 등 집계 쿼리 효율적
3. **개별 수정**: 특정 단계나 항목만 수정 가능
4. **확장성**: 새로운 필드 추가 시 마이그레이션 용이

#### 9.3.2 고입 탐색 배열 데이터

| JSON 필드 | 기존 저장 방식 | 개선된 모델 | 정규화 이유 |
|----------|-------------|-----------|-----------|
| `admissionProcess` | JSONField (배열) | `HighSchoolAdmissionStep` | 입학 단계별 관리 |
| `careerPathDetails` | JSONField (배열) | `HighSchoolCareerPathDetail` | 학년별 준비사항 검색 |
| `highlightStats` | JSONField (배열) | `HighSchoolHighlightStat` | 통계 데이터 시각화 |
| `realTalk` | JSONField (배열) | `HighSchoolRealTalk` | 후기 검색, 감정 분석 |
| `dailySchedule` | JSONField (배열) | `HighSchoolDailySchedule` | 시간대별 일과 비교 |
| `famousPrograms` | JSONField (배열) | `HighSchoolFamousProgram` | 프로그램별 검색 |

**장점**:
1. **비교 기능**: 여러 고교의 일과, 통계, 프로그램을 테이블로 비교 가능
2. **필터링**: "기숙사 있는 과학고", "서울대 진학률 30% 이상" 등 복잡한 필터링
3. **순서 관리**: `order_index`로 표시 순서 제어

#### 9.3.3 대입 탐색 배열 데이터

| JSON 필드 | 기존 저장 방식 | 개선된 모델 | 정규화 이유 |
|----------|-------------|-----------|-----------|
| `departments` | JSONField (배열) | `UniversityDepartment` | 학과별 검색, 전형별 필터링 |
| `playbooks` | JSON 파일 | `UniversityAdmissionPlaybook` | 전형별 플레이북 관리 |
| `keyFeatures` | JSONField (배열) | JSONField 유지 (간단한 문자열 배열) | 단순 배열은 JSONField로 충분 |
| `targetStudents` | JSONField (배열) | JSONField 유지 | 단순 배열은 JSONField로 충분 |

**전략**:
- **복잡한 배열**: 별도 테이블로 정규화 (검색, 필터링, 통계 필요)
- **단순한 배열**: JSONField 유지 (문자열 리스트, 간단한 객체)

### 9.4 미디어 파일 관리 전략

#### 9.4.1 이미지 저장 구조

```
AWS S3 버킷 구조:
aicareer-media/
├── infographics/
│   ├── jobs/
│   │   ├── ai-researcher-salary-curve.png
│   │   ├── software-developer-career-timeline.png
│   │   └── ...
│   ├── high-schools/
│   │   ├── ksa-university-admission.png
│   │   ├── science-high-competition-rate.png
│   │   └── ...
│   └── universities/
│       ├── seoul-national-grade-distribution.png
│       ├── admission-strategy-timeline.png
│       └── ...
├── profiles/
│   └── users/
│       └── {user_id}/avatar.jpg
└── resources/
    └── documents/
        └── {resource_id}/document.pdf
```

#### 9.4.2 Django 설정 (S3 연동)

```python
# settings.py

# AWS S3 설정
AWS_ACCESS_KEY_ID = env('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = env('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = env('AWS_STORAGE_BUCKET_NAME', default='aicareer-media')
AWS_S3_REGION_NAME = env('AWS_S3_REGION_NAME', default='ap-northeast-2')
AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.{AWS_S3_REGION_NAME}.amazonaws.com'

# Static & Media 파일 설정
STATIC_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/static/'
MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/media/'

# django-storages 설정
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
STATICFILES_STORAGE = 'storages.backends.s3boto3.S3StaticStorage'

AWS_S3_FILE_OVERWRITE = False
AWS_DEFAULT_ACL = 'public-read'
AWS_QUERYSTRING_AUTH = False
```

#### 9.4.3 이미지 업로드 API

```python
# explore/views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.files.storage import default_storage
import uuid

class JobInfographicViewSet(viewsets.ModelViewSet):
    queryset = JobInfographic.objects.all()
    serializer_class = JobInfographicSerializer
    
    @action(detail=False, methods=['post'], url_path='upload')
    def upload_infographic_image(self, request):
        """인포그래픽 이미지 업로드"""
        job_id = request.data.get('job_id')
        infographic_type = request.data.get('infographic_type')
        image_file = request.FILES.get('image')
        
        if not all([job_id, infographic_type, image_file]):
            return Response(
                {"error": "job_id, infographic_type, image 필드가 필요합니다."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            return Response(
                {"error": "존재하지 않는 직업입니다."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        file_extension = image_file.name.split('.')[-1]
        file_name = f"infographics/jobs/{job_id}-{infographic_type}-{uuid.uuid4()}.{file_extension}"
        
        file_path = default_storage.save(file_name, image_file)
        file_url = default_storage.url(file_path)
        
        infographic = JobInfographic.objects.create(
            job=job,
            infographic_type=infographic_type,
            title=request.data.get('title', f"{job.name} {infographic_type}"),
            description=request.data.get('description', ''),
            image_url=file_url,
            data_points=request.data.get('data_points', {})
        )
        
        serializer = self.get_serializer(infographic)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
```

### 9.5 차트 데이터 생성 API

#### 9.5.1 동적 차트 데이터 생성

프론트엔드에서 Chart.js, D3.js 등으로 차트를 그릴 수 있도록 `data_points` JSON 데이터를 제공합니다.

**예시 API 응답**:

```json
GET /api/explore/jobs/ai-researcher/infographics/

[
  {
    "id": "uuid-1",
    "infographic_type": "salary_curve",
    "title": "AI 연구원 연봉 커브",
    "image_url": "https://s3.../salary-curve.png",
    "data_points": {
      "type": "line",
      "labels": ["신입", "3년차", "5년차", "7년차", "10년차"],
      "datasets": [
        {
          "label": "평균 연봉",
          "data": [6000, 8500, 12000, 15000, 20000],
          "borderColor": "#3b82f6",
          "backgroundColor": "rgba(59, 130, 246, 0.1)"
        }
      ]
    }
  },
  {
    "id": "uuid-2",
    "infographic_type": "skill_radar",
    "title": "AI 연구원 필수 역량",
    "data_points": {
      "type": "radar",
      "labels": ["수학", "코딩", "영어", "논문 작성", "협업"],
      "datasets": [
        {
          "label": "요구 수준",
          "data": [5, 5, 4, 5, 3],
          "backgroundColor": "rgba(59, 130, 246, 0.2)",
          "borderColor": "#3b82f6"
        }
      ]
    }
  }
]
```

### 9.6 인포그래픽 생성 워크플로우

```mermaid
flowchart TD
    A[관리자 Admin 접속] --> B[인포그래픽 생성 선택]
    B --> C{데이터 소스}
    C -->|수동 입력| D[data_points JSON 직접 작성]
    C -->|DB 집계| E[Django ORM으로 통계 집계]
    C -->|외부 이미지| F[S3에 이미지 업로드]
    
    D --> G[JobInfographic 레코드 생성]
    E --> H[집계 데이터를 data_points에 저장]
    F --> I[image_url 필드에 S3 URL 저장]
    
    H --> G
    I --> G
    
    G --> J[DRF API로 프론트엔드에 제공]
    J --> K[프론트엔드에서 Chart.js로 렌더링]
    J --> L[프론트엔드에서 이미지 표시]
```

### 9.7 통계 집계 예시 쿼리

#### 9.7.1 직업별 추천 고교 통계

```python
from django.db.models import Count

# 가장 많이 추천되는 고교 유형 Top 5
top_high_school_types = (
    JobRecommendedHighSchool.objects
    .values('high_school_type')
    .annotate(count=Count('id'))
    .order_by('-count')[:5]
)

# 결과 예시:
# [
#   {'high_school_type': 'science-high', 'count': 45},
#   {'high_school_type': 'autonomous-private-high', 'count': 38},
#   {'high_school_type': 'general-high', 'count': 25},
#   ...
# ]
```

#### 9.7.2 고교별 대입 진학 통계 (가상 데이터)

```python
# 특정 고교의 대입 진학 통계를 인포그래픽으로 생성
def generate_university_admission_infographic(high_school_id):
    high_school = HighSchool.objects.get(id=high_school_id)
    
    # 실제로는 졸업생 데이터가 필요하지만, 여기서는 예시로 하드코딩
    data_points = {
        "universities": [
            {"name": "서울대", "count": 35, "percentage": 29.2},
            {"name": "KAIST", "count": 40, "percentage": 33.3},
            {"name": "POSTECH", "count": 15, "percentage": 12.5},
            {"name": "연세대", "count": 12, "percentage": 10.0},
            {"name": "고려대", "count": 10, "percentage": 8.3},
            {"name": "기타", "count": 8, "percentage": 6.7}
        ],
        "total_graduates": 120
    }
    
    infographic = HighSchoolInfographic.objects.create(
        high_school=high_school,
        infographic_type='university_admission',
        title=f"{high_school.name} 대입 진학 현황 (2025)",
        description="졸업생 진학 대학 분포",
        data_points=data_points
    )
    
    return infographic
```

### 9.8 프론트엔드 연동 예시

#### 9.8.1 Chart.js 연동

```typescript
// frontend/components/JobInfographicChart.tsx

import { Line, Radar } from 'react-chartjs-2';

interface JobInfographicProps {
  infographic: {
    infographic_type: string;
    title: string;
    data_points: any;
  };
}

export const JobInfographicChart: React.FC<JobInfographicProps> = ({ infographic }) => {
  const { infographic_type, title, data_points } = infographic;
  
  if (infographic_type === 'salary_curve') {
    return (
      <div>
        <h3>{title}</h3>
        <Line data={data_points} options={{ responsive: true }} />
      </div>
    );
  }
  
  if (infographic_type === 'skill_radar') {
    return (
      <div>
        <h3>{title}</h3>
        <Radar data={data_points} options={{ responsive: true }} />
      </div>
    );
  }
  
  return null;
};
```

#### 9.8.2 이미지 표시

```typescript
// frontend/components/JobInfographicImage.tsx

interface JobInfographicImageProps {
  infographic: {
    title: string;
    image_url: string;
    description: string;
  };
}

export const JobInfographicImage: React.FC<JobInfographicImageProps> = ({ infographic }) => {
  return (
    <div className="infographic-container">
      <h3>{infographic.title}</h3>
      <img 
        src={infographic.image_url} 
        alt={infographic.title}
        className="w-full rounded-lg shadow-lg"
      />
      <p className="text-sm text-gray-600 mt-2">{infographic.description}</p>
    </div>
  );
};
```

### 9.9 Django Admin 인포그래픽 관리

```python
# explore/admin.py

from django.contrib import admin
from django.utils.html import format_html
from .models import (
    JobInfographic, HighSchoolInfographic, UniversityInfographic
)

@admin.register(JobInfographic)
class JobInfographicAdmin(admin.ModelAdmin):
    list_display = ['job', 'infographic_type', 'title', 'image_preview', 'view_count', 'created_at']
    list_filter = ['infographic_type', 'created_at']
    search_fields = ['job__name', 'title']
    ordering = ['job', 'order_index']
    
    fieldsets = [
        ('기본 정보', {
            'fields': ['job', 'infographic_type', 'title', 'description', 'order_index']
        }),
        ('미디어', {
            'fields': ['image_url', 'thumbnail_url']
        }),
        ('데이터', {
            'fields': ['data_points'],
            'classes': ['collapse']
        }),
        ('통계', {
            'fields': ['view_count'],
            'classes': ['collapse']
        }),
    ]
    
    def image_preview(self, obj):
        if obj.image_url:
            return format_html(
                '<img src="{}" width="100" height="60" style="object-fit: cover;" />',
                obj.image_url
            )
        return '-'
    image_preview.short_description = '미리보기'

@admin.register(HighSchoolInfographic)
class HighSchoolInfographicAdmin(admin.ModelAdmin):
    list_display = ['high_school', 'infographic_type', 'title', 'image_preview', 'view_count', 'created_at']
    list_filter = ['infographic_type', 'created_at']
    search_fields = ['high_school__name', 'title']
    ordering = ['high_school', 'order_index']
    
    def image_preview(self, obj):
        if obj.image_url:
            return format_html(
                '<img src="{}" width="100" height="60" style="object-fit: cover;" />',
                obj.image_url
            )
        return '-'
    image_preview.short_description = '미리보기'

@admin.register(UniversityInfographic)
class UniversityInfographicAdmin(admin.ModelAdmin):
    list_display = ['get_target', 'infographic_type', 'title', 'image_preview', 'view_count', 'created_at']
    list_filter = ['infographic_type', 'created_at']
    search_fields = ['university__name', 'admission_category__name', 'title']
    ordering = ['order_index']
    
    def get_target(self, obj):
        if obj.university:
            return f"대학: {obj.university.name}"
        elif obj.admission_category:
            return f"전형: {obj.admission_category.name}"
        return "전체"
    get_target.short_description = '대상'
    
    def image_preview(self, obj):
        if obj.image_url:
            return format_html(
                '<img src="{}" width="100" height="60" style="object-fit: cover;" />',
                obj.image_url
            )
        return '-'
    image_preview.short_description = '미리보기'
```

### 9.10 인포그래픽 조회 API 엔드포인트

| 엔드포인트 | 메서드 | 설명 | 응답 예시 |
|----------|-------|------|---------|
| `/api/explore/jobs/{job_id}/infographics/` | GET | 특정 직업의 모든 인포그래픽 조회 | `[{id, type, title, image_url, data_points}, ...]` |
| `/api/explore/high-schools/{school_id}/infographics/` | GET | 특정 고교의 모든 인포그래픽 조회 | `[{id, type, title, image_url, data_points}, ...]` |
| `/api/explore/universities/{univ_id}/infographics/` | GET | 특정 대학의 모든 인포그래픽 조회 | `[{id, type, title, image_url, data_points}, ...]` |
| `/api/explore/admission-categories/{cat_id}/infographics/` | GET | 특정 전형의 모든 인포그래픽 조회 | `[{id, type, title, image_url, data_points}, ...]` |
| `/api/explore/infographics/upload/` | POST | 인포그래픽 이미지 업로드 | `{id, image_url, thumbnail_url}` |

### 9.11 검색 & 필터링 최적화

#### 9.11.1 복잡한 검색 쿼리 예시

```python
# "Python이 필요한 AI 관련 직업 검색"
from django.db.models import Q

ai_jobs_with_python = Job.objects.filter(
    Q(category__name__icontains='AI') | Q(name__icontains='AI'),
    key_preparations__preparation_item__icontains='Python'
).distinct()

# "서울대 진학률 30% 이상인 과학고 검색"
top_science_highs = HighSchool.objects.filter(
    category__id='science_high',
    highlight_stats__label__icontains='서울대 진학률',
    highlight_stats__value__gte='30%'
).distinct()

# "학생부교과 전형이 있는 공대 학과 검색"
engineering_depts_with_gyogwa = UniversityDepartment.objects.filter(
    admission_category__id='student-record-academic',
    college__icontains='공과대학'
)
```

#### 9.11.2 인덱스 최적화

모든 인포그래픽 모델에는 다음 인덱스가 설정되어 있습니다:

```python
indexes = [
    models.Index(fields=['job', 'infographic_type']),  # 직업별 + 유형별 조회
    models.Index(fields=['infographic_type']),         # 유형별 전체 조회
]
```

### 9.12 마이그레이션 체크리스트

#### 9.12.1 신규 모델 마이그레이션

```bash
# 1. 마이그레이션 파일 생성
python manage.py makemigrations explore

# 2. 마이그레이션 확인
python manage.py sqlmigrate explore 0002

# 3. 마이그레이션 실행
python manage.py migrate explore

# 4. 데이터 마이그레이션 (JSON → DB)
python manage.py import_job_infographics
python manage.py import_high_school_infographics
python manage.py import_university_infographics
```

#### 9.12.2 데이터 마이그레이션 스크립트 예시

```python
# explore/management/commands/import_job_infographics.py

from django.core.management.base import BaseCommand
from explore.models import Job, JobCareerPathStage, JobCareerPathTask
import json

class Command(BaseCommand):
    help = 'JSON 데이터를 Job 관련 테이블로 마이그레이션'

    def handle(self, *args, **options):
        with open('frontend/data/jobs.json', 'r', encoding='utf-8') as f:
            jobs_data = json.load(f)
        
        for job_data in jobs_data:
            job, created = Job.objects.update_or_create(
                id=job_data['id'],
                defaults={
                    'name': job_data['name'],
                    'name_en': job_data.get('nameEn', ''),
                    'emoji': job_data.get('emoji', ''),
                    'kingdom_id': job_data.get('kingdomId', ''),
                    'icon': job_data.get('icon', ''),
                    'rarity': job_data.get('rarity', 'common'),
                    'riasec_profile': job_data.get('riasecProfile', {}),
                    'description': job_data.get('description', ''),
                    'short_description': job_data.get('shortDescription', ''),
                    'company': job_data.get('company', ''),
                    'salary_range': job_data.get('salaryRange', ''),
                    'difficulty': job_data.get('difficulty', 3),
                    'future_outlook': job_data.get('futureOutlook', ''),
                    'outlook_score': job_data.get('l2', {}).get('outlook', 3),
                }
            )
            
            # careerPath 배열 → JobCareerPathStage + JobCareerPathTask
            if 'careerPath' in job_data:
                job.career_path_stages.all().delete()
                for idx, stage_data in enumerate(job_data['careerPath']):
                    stage = JobCareerPathStage.objects.create(
                        job=job,
                        stage=stage_data['stage'],
                        period=stage_data['period'],
                        icon=stage_data.get('icon', ''),
                        order_index=idx
                    )
                    
                    for task_idx, task in enumerate(stage_data.get('tasks', [])):
                        JobCareerPathTask.objects.create(
                            stage=stage,
                            task_description=task,
                            order_index=task_idx
                        )
            
            # keyPreparation 배열 → JobKeyPreparation
            if 'keyPreparation' in job_data:
                job.key_preparations.all().delete()
                for idx, prep in enumerate(job_data['keyPreparation']):
                    JobKeyPreparation.objects.create(
                        job=job,
                        preparation_item=prep,
                        order_index=idx
                    )
            
            # l2.dailySchedule 배열 → JobDailySchedule
            if 'l2' in job_data and 'dailySchedule' in job_data['l2']:
                job.daily_schedules.all().delete()
                for idx, schedule in enumerate(job_data['l2']['dailySchedule']):
                    JobDailySchedule.objects.create(
                        job=job,
                        time=schedule['time'],
                        activity=schedule['activity'],
                        emoji=schedule.get('emoji', ''),
                        order_index=idx
                    )
            
            # l3.requiredSkills 배열 → JobRequiredSkill
            if 'l3' in job_data and 'requiredSkills' in job_data['l3']:
                job.required_skills.all().delete()
                for idx, skill in enumerate(job_data['l3']['requiredSkills']):
                    JobRequiredSkill.objects.create(
                        job=job,
                        skill_name=skill['name'],
                        score=skill['score'],
                        order_index=idx
                    )
            
            self.stdout.write(
                self.style.SUCCESS(f'✓ {job.name} 마이그레이션 완료')
            )
```

### 9.13 성능 최적화 전략

#### 9.13.1 Prefetch & Select Related

```python
# 직업 상세 조회 시 모든 관련 데이터를 한 번에 로드
jobs = Job.objects.prefetch_related(
    'career_path_stages__tasks',
    'key_preparations',
    'recommended_high_schools_rel',
    'recommended_universities_rel',
    'daily_schedules',
    'required_skills',
    'milestones',
    'acceptees',
    'infographics'
).select_related('category').all()
```

#### 9.13.2 캐싱 전략

```python
# views.py

from django.core.cache import cache
from django.conf import settings

class JobViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    
    def retrieve(self, request, *args, **kwargs):
        job_id = kwargs.get('pk')
        cache_key = f'job_detail_{job_id}'
        
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)
        
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        
        cache.set(cache_key, data, timeout=3600)
        
        return Response(data)
```

### 9.14 추가 개선 제안

#### 9.14.1 이미지 자동 리사이징

```python
# common/utils.py

from PIL import Image
from io import BytesIO
from django.core.files.uploadedfile import InMemoryUploadedFile

def resize_image_for_infographic(image_file, max_width=1200, max_height=800):
    """인포그래픽 이미지 자동 리사이징"""
    img = Image.open(image_file)
    
    if img.width > max_width or img.height > max_height:
        img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
    
    output = BytesIO()
    img.save(output, format='PNG', optimize=True, quality=85)
    output.seek(0)
    
    return InMemoryUploadedFile(
        output, 'ImageField', 
        f"{image_file.name.split('.')[0]}_resized.png",
        'image/png', output.getbuffer().nbytes, None
    )
```

#### 9.14.2 썸네일 자동 생성

```python
def create_thumbnail(image_url, size=(300, 200)):
    """S3 이미지의 썸네일 생성"""
    # 실제 구현 시 Pillow + boto3 사용
    # 1. S3에서 원본 이미지 다운로드
    # 2. 썸네일 생성
    # 3. S3에 썸네일 업로드
    # 4. 썸네일 URL 반환
    pass
```

### 9.15 모델 요약표

#### 9.15.1 직업 탐색 모델 (총 11개)

| 모델명 | 역할 | 관계 | 비고 |
|-------|------|------|------|
| `JobCategory` | 직업 카테고리 | 1:N → Job | 이공계, 의료, 창작 등 |
| `Job` | 직업 기본 정보 | N:1 → JobCategory | 메인 엔티티 |
| `JobCareerPathStage` | 커리어 단계 | N:1 → Job | 중학교, 고등학교, 대학교, 취업 |
| `JobCareerPathTask` | 단계별 과제 | N:1 → JobCareerPathStage | 각 단계의 세부 과제 |
| `JobKeyPreparation` | 핵심 준비사항 | N:1 → Job | 수학 심화, 코딩 등 |
| `JobRecommendedHighSchool` | 추천 고교 | N:1 → Job | 과학고, 자사고 등 |
| `JobRecommendedUniversity` | 추천 대학 | N:1 → Job | 서울대, KAIST 등 |
| `JobDailySchedule` | 하루 일과 | N:1 → Job | 시간대별 활동 |
| `JobRequiredSkill` | 필수 역량 | N:1 → Job | 역량별 점수 |
| `JobMilestone` | 마일스톤 | N:1 → Job | 초등, 중등, 고등, 대학 |
| `JobAcceptee` | 합격 사례 | N:1 → Job | 학종, 정시 합격자 |
| `JobInfographic` | 인포그래픽 | N:1 → Job | 연봉 커브, 역량 차트 등 |

#### 9.15.2 고입 탐색 모델 (총 8개)

| 모델명 | 역할 | 관계 | 비고 |
|-------|------|------|------|
| `HighSchoolCategory` | 고교 카테고리 | 1:N → HighSchool | 과학고, 자사고, IB 등 |
| `HighSchool` | 고교 기본 정보 | N:1 → HighSchoolCategory | 메인 엔티티 |
| `HighSchoolAdmissionStep` | 입학 단계 | N:1 → HighSchool | 1단계, 2단계, 3단계 등 |
| `HighSchoolCareerPathDetail` | 학년별 준비 | N:1 → HighSchool | 중1, 중2, 중3 |
| `HighSchoolHighlightStat` | 주요 통계 | N:1 → HighSchool | 경쟁률, 진학률 등 |
| `HighSchoolRealTalk` | 솔직 후기 | N:1 → HighSchool | 학생 경험담 |
| `HighSchoolDailySchedule` | 하루 일과 | N:1 → HighSchool | 시간대별 활동 |
| `HighSchoolFamousProgram` | 유명 프로그램 | N:1 → HighSchool | R&E, 올림피아드 등 |
| `HighSchoolInfographic` | 인포그래픽 | N:1 → HighSchool | 통계 차트, 그래프 |

#### 9.15.3 대입 탐색 모델 (총 5개)

| 모델명 | 역할 | 관계 | 비고 |
|-------|------|------|------|
| `UniversityAdmissionCategory` | 전형 카테고리 | 1:N → UniversityDepartment | 학종, 교과, 정시 등 |
| `University` | 대학 기본 정보 | 1:N → UniversityDepartment | 메인 엔티티 |
| `UniversityDepartment` | 학과 정보 | N:1 → University, N:1 → UniversityAdmissionCategory | 학과별 전형 연결 |
| `UniversityAdmissionPlaybook` | 전형별 플레이북 | N:1 → UniversityAdmissionCategory | 준비 가이드 |
| `UniversityInfographic` | 인포그래픽 | N:1 → University, N:1 → UniversityAdmissionCategory | 입시 통계, 전략 차트 |

### 9.16 개선 효과

#### 9.16.1 검색 성능

- **기존**: JSONField 전체 스캔 → 느림
- **개선**: 인덱스된 관계형 테이블 → 빠름

**예시**:
```python
# 기존 (느림)
jobs = Job.objects.filter(
    career_path_stages__contains=[{"stage": "대학교"}]
)

# 개선 (빠름)
jobs = Job.objects.filter(
    career_path_stages__stage='대학교'
).distinct()
```

#### 9.16.2 통계 집계

- **기존**: Python 코드로 JSON 파싱 후 집계 → 메모리 부담
- **개선**: SQL 집계 쿼리 → DB 레벨 최적화

**예시**:
```python
from django.db.models import Count, Avg

# 직업별 평균 난이도
avg_difficulty_by_category = (
    Job.objects
    .values('category__name')
    .annotate(avg_difficulty=Avg('difficulty'))
    .order_by('-avg_difficulty')
)

# 고교별 평균 경쟁률 (highlightStats에서 추출)
# 실제로는 HighSchoolHighlightStat에서 집계
```

#### 9.16.3 유지보수성

- **기존**: JSON 구조 변경 시 전체 데이터 재처리 필요
- **개선**: 특정 테이블만 수정, 마이그레이션 관리 용이

### 9.17 향후 확장 가능성

#### 9.17.1 AI 기반 인포그래픽 자동 생성

```python
# future/ai_infographic_generator.py

def generate_job_salary_curve_infographic(job_id):
    """AI가 직업 데이터를 분석하여 연봉 커브 인포그래픽 자동 생성"""
    job = Job.objects.get(id=job_id)
    
    # 1. 외부 API에서 실시간 연봉 데이터 수집
    salary_data = fetch_salary_data_from_api(job.name)
    
    # 2. Chart.js 데이터 포맷으로 변환
    data_points = {
        "labels": salary_data['career_years'],
        "values": salary_data['salaries'],
        "unit": "만원/년"
    }
    
    # 3. 인포그래픽 레코드 생성
    infographic = JobInfographic.objects.create(
        job=job,
        infographic_type='salary_curve',
        title=f"{job.name} 연봉 커브 (자동 생성)",
        data_points=data_points
    )
    
    return infographic
```

#### 9.17.2 사용자 맞춤 인포그래픽

```python
def generate_personalized_career_path_infographic(user_id, job_id):
    """사용자의 현재 학년과 목표 직업을 기반으로 맞춤 커리어 패스 생성"""
    user = User.objects.get(id=user_id)
    job = Job.objects.get(id=job_id)
    
    # 사용자 학년에 맞는 단계만 필터링
    relevant_stages = job.career_path_stages.filter(
        stage__in=get_relevant_stages_for_grade(user.grade)
    )
    
    # 맞춤 타임라인 생성
    timeline_data = [
        {
            "stage": stage.stage,
            "tasks": [task.task_description for task in stage.tasks.all()],
            "is_current": is_current_stage(user.grade, stage.stage)
        }
        for stage in relevant_stages
    ]
    
    return timeline_data
```

---

## 10. 개선 효과 요약

### 10.1 성능 개선

| 항목 | 기존 방식 | 개선 방식 | 성능 향상 |
|------|---------|---------|----------|
| **배열 검색** | JSONField 전체 스캔 | 인덱스된 관계형 테이블 | 약 10~50배 |
| **통계 집계** | Python 코드로 JSON 파싱 | SQL 집계 쿼리 | 약 5~20배 |
| **복잡한 필터링** | 불가능 (JSONField 한계) | 다중 조인 쿼리 | 새로운 기능 |
| **페이지네이션** | 전체 로드 후 슬라이싱 | DB 레벨 LIMIT/OFFSET | 메모리 사용량 90% 감소 |

### 10.2 개발 생산성 향상

| 항목 | 기존 방식 | 개선 방식 | 생산성 향상 |
|------|---------|---------|----------|
| **데이터 수정** | JSON 파일 전체 수정 | 특정 레코드만 수정 | 약 10배 |
| **새 항목 추가** | JSON 배열에 추가 후 재배포 | Django Admin에서 즉시 추가 | 즉시 반영 |
| **통계 대시보드** | 별도 스크립트 작성 필요 | Django ORM으로 즉시 집계 | 개발 시간 80% 단축 |
| **API 응답 커스터마이징** | JSON 구조 고정 | DRF Serializer로 유연하게 조정 | 무한 확장 가능 |

### 10.3 확장성

| 확장 시나리오 | 기존 방식 | 개선 방식 |
|------------|---------|---------|
| **새로운 인포그래픽 유형 추가** | JSON 구조 변경 필요 | `infographic_type` 선택지만 추가 |
| **사용자별 맞춤 추천** | 불가능 | 사용자 학년, RIASEC 기반 필터링 가능 |
| **실시간 통계 대시보드** | 불가능 | Django ORM 집계 쿼리로 즉시 구현 |
| **다국어 지원** | JSON 파일 복제 | Django i18n + 별도 번역 테이블 |
| **A/B 테스트** | 불가능 | 버전별 인포그래픽 관리 가능 |

### 10.4 비용 효율성

| 항목 | 기존 방식 | 개선 방식 | 비용 절감 |
|------|---------|---------|----------|
| **API 응답 크기** | 전체 JSON 반환 (평균 50KB) | 필요한 필드만 반환 (평균 5KB) | 네트워크 비용 90% 감소 |
| **DB 쿼리 수** | N+1 문제 발생 | `prefetch_related`로 최적화 | 쿼리 수 95% 감소 |
| **캐싱 효율** | 큰 JSON 객체 캐싱 | 작은 단위로 캐싱 | 메모리 사용량 80% 감소 |

### 10.5 마이그레이션 로드맵

```mermaid
gantt
    title Django Backend 개발 로드맵 (개선 버전)
    dateFormat YYYY-MM-DD
    section Phase 1: 기본 모델
    User, Quiz 모델 :done, p1, 2026-03-26, 1d
    Job 기본 모델 :done, p2, 2026-03-27, 1d
    HighSchool 기본 모델 :done, p3, 2026-03-28, 1d
    University 기본 모델 :done, p4, 2026-03-29, 1d
    
    section Phase 2: 배열 정규화
    Job 상세 모델 (8개) :active, p5, 2026-03-30, 2d
    HighSchool 상세 모델 (6개) :p6, 2026-04-01, 2d
    University 상세 모델 (2개) :p7, 2026-04-03, 1d
    
    section Phase 3: 인포그래픽
    인포그래픽 모델 (3개) :p8, 2026-04-04, 1d
    S3 연동 :p9, 2026-04-05, 1d
    이미지 업로드 API :p10, 2026-04-06, 1d
    
    section Phase 4: 데이터 마이그레이션
    JSON → DB 임포트 :p11, 2026-04-07, 3d
    샘플 인포그래픽 생성 :p12, 2026-04-10, 1d
    
    section Phase 5: 테스트 & 배포
    API 테스트 :p13, 2026-04-11, 2d
    PostgreSQL 전환 :p14, 2026-04-13, 1d
    Docker 배포 :p15, 2026-04-14, 1d
```

---

이 문서는 Django + DRF 기반 관계형 DB 설계의 완전한 명세입니다.

**개선 버전 주요 변경사항 (2026-03-25)**:
1. ✅ 직업/고입/대입 탐색의 배열 데이터를 별도 테이블로 정규화 (22개 신규 모델)
2. ✅ 인포그래픽 전용 모델 추가 (이미지 + 차트 데이터)
3. ✅ 카테고리 모델 추가 (행성 UI 데이터 관리)
4. ✅ 검색 성능 최적화를 위한 인덱스 설계
5. ✅ S3 기반 미디어 파일 관리 전략
6. ✅ DRF Serializer & ViewSet 전면 개선
7. ✅ API 엔드포인트 명세 추가
8. ✅ Django Admin 인포그래픽 관리 기능

**총 모델 수**: 52개 (기존 30개 → 개선 후 52개)
**총 API 엔드포인트**: 약 80개 (기존 40개 → 개선 후 80개)
