# Career Path App - 커리어 패스 앱

> **작성일**: 2026-03-27  
> **Django 앱**: `apps.career_path`  
> **설계 문서**: `/documents/backend/커리어패스_Career_Django_DB_설계서.md`

---

## 개요

커리어 패스 앱은 학생들이 장기 진로 계획(3년 이상)을 수립하고, 학년별·월별 활동을 관리하며, 학교·그룹 커뮤니티와 공유하는 기능을 제공합니다.

### 핵심 기능

1. **커리어 패스 CRUD** - 개인 진로 계획 생성·수정·삭제
2. **학년별 계획** - 학년별로 목표와 활동 관리
3. **목표-활동 그룹핑** - 목표별로 활동 그룹화
4. **활동 관리** - 활동·수상·작품·자격증 관리
5. **하위 체크리스트** - 활동을 작은 단위로 쪼개서 관리
6. **템플릿 시스템** - 관리자가 생성한 템플릿 복사
7. **커뮤니티 공유** - 학교·그룹에 커리어 패스 공유
8. **학교 관리** - 선생님이 학교 생성, 학생 가입
9. **그룹 관리** - 학생이 그룹 생성, 초대 코드로 가입

---

## 모델 구조

### 1. Community Models (커뮤니티)

#### School (학교)
- 선생님이 생성
- 학생들은 학교 코드로 가입
- 학교 공간에서 같은 학교 학생들의 공유 패스 조회

**필드**:
- `name`: 학교 이름
- `code`: 학교 가입 코드 (UNIQUE)
- `operator`: 학교 운영자 (선생님)
- `grades`: 관리 학년 목록 (ArrayField)
- `member_count`: 소속 학생 수
- `school_type`: 학교 유형 (elementary, middle, high)
- `region`: 지역

#### Group (그룹)
- `apps.community.Group` 사용 (기존 모델 재사용)
- 학생이 자유롭게 생성
- 초대 코드로 가입

#### GroupMember (그룹 멤버)
- `apps.community.GroupMember` 사용 (기존 모델 재사용)
- M:N 중간 테이블

---

### 2. Career Plan Models (커리어 패스)

#### CareerPlan (커리어 패스)
개인 진로 계획의 최상위 모델

**필드**:
- `user`: 소유자 (FK → User)
- `title`: 커리어 패스 제목
- `description`: 커리어 패스 설명
- `job_id`, `job_name`, `job_emoji`: 직업 정보
- `star_id`, `star_name`, `star_emoji`, `star_color`: 적성(별) 정보
- `is_template`: 템플릿 여부
- `template_category`: 템플릿 카테고리

**관계**:
- `years` (1:N) → PlanYear

#### PlanYear (학년별 계획)
한 커리어 패스 내 학년별 계획

**필드**:
- `career_plan`: 소속 커리어 패스 (FK)
- `grade_id`: 학년 ID (예: mid1, high2)
- `grade_label`: 학년 라벨 (예: 중1, 고2)
- `semester`: 학기 옵션 (both, first, second, split)
- `sort_order`: 정렬 순서

**관계**:
- `goal_groups` (1:N) → GoalGroup
- `items` (1:N) → PlanItem

#### GoalGroup (목표-활동 그룹)
한 학년 내에서 목표별로 활동을 그룹핑

**필드**:
- `plan_year`: 소속 학년 (FK)
- `goal`: 목표 (TEXT)
- `semester_id`: 학기 구분 (first, second, '')
- `sort_order`: 정렬 순서

**관계**:
- `items` (1:N) → PlanItem

#### PlanItem (활동·수상·작품·자격증)
실제 활동 항목

**필드**:
- `plan_year`: 소속 학년 (FK)
- `goal_group`: 소속 목표 그룹 (FK, NULL 가능)
- `type`: 활동 유형 (activity, award, portfolio, certification)
- `title`: 활동 제목
- `months`: 실행 월 목록 (ArrayField)
- `difficulty`: 난이도 (1~5)
- `cost`: 비용
- `organizer`: 주최 기관
- `url`: 관련 URL
- `description`: 상세 설명
- `category_tags`: 카테고리 태그 (ArrayField)
- `activity_subtype`: 활동 세부 유형
- `sort_order`: 정렬 순서

**관계**:
- `sub_items` (1:N) → SubItem
- `links` (1:N) → ItemLink

#### SubItem (하위 실행 항목)
큰 활동을 작은 단위로 쪼갠 체크리스트

**필드**:
- `plan_item`: 소속 활동 (FK)
- `title`: 하위 항목 제목
- `is_done`: 완료 여부
- `url`: 관련 URL
- `description`: 상세 설명
- `sort_order`: 정렬 순서

#### ItemLink (활동 참고 링크)
한 활동에 여러 참고 링크 첨부

**필드**:
- `plan_item`: 소속 활동 (FK)
- `title`: 링크 제목
- `url`: 링크 URL
- `kind`: 링크 종류 (official, application, reference, portfolio, result)
- `sort_order`: 정렬 순서

---

### 3. Shared Plan Models (공유된 커리어 패스)

#### SharedPlan (공유된 커리어 패스)
개인 커리어 패스를 커뮤니티에 공유

**필드**:
- `career_plan`: 원본 커리어 패스 (FK)
- `user`: 공유자 (FK)
- `school`: 소속 학교 (FK, NULL 가능)
- `share_type`: 공유 유형 (private, public, school, group)
- `description`: 공유 설명
- `tags`: 태그 (ArrayField)
- `like_count`, `bookmark_count`, `view_count`, `comment_count`: 통계
- `shared_at`: 공유 일시
- `is_hidden`: 숨김 여부

**관계**:
- `group_links` (M:N) → Group (via SharedPlanGroup)

#### SharedPlanGroup (공유 패스-그룹 연결)
한 공유 패스를 여러 그룹에 동시 공유

**필드**:
- `shared_plan`: 공유 패스 (FK)
- `group`: 그룹 (FK)

---

## API 엔드포인트

### Community

- `GET /api/v1/career-path/schools/` - 학교 목록
- `POST /api/v1/career-path/schools/` - 학교 생성
- `GET /api/v1/career-path/schools/{id}/` - 학교 상세
- `POST /api/v1/career-path/schools/join/` - 학교 가입 (코드)
- `GET /api/v1/career-path/groups/` - 그룹 목록
- `POST /api/v1/career-path/groups/` - 그룹 생성
- `POST /api/v1/career-path/groups/join/` - 그룹 가입 (초대 코드)
- `GET /api/v1/career-path/groups/{id}/members/` - 그룹 멤버 목록

### Career Plans

- `GET /api/v1/career-path/career-plans/` - 커리어 패스 목록
- `POST /api/v1/career-path/career-plans/` - 커리어 패스 생성
- `GET /api/v1/career-path/career-plans/{id}/` - 커리어 패스 상세
- `PUT /api/v1/career-path/career-plans/{id}/` - 커리어 패스 수정
- `DELETE /api/v1/career-path/career-plans/{id}/` - 커리어 패스 삭제
- `POST /api/v1/career-path/career-plans/{id}/use_template/` - 템플릿 복사

### Plan Years

- `GET /api/v1/career-path/plan-years/` - 학년별 계획 목록
- `POST /api/v1/career-path/plan-years/` - 학년별 계획 생성
- `PUT /api/v1/career-path/plan-years/{id}/` - 학년별 계획 수정

### Goal Groups

- `GET /api/v1/career-path/goal-groups/` - 목표 그룹 목록
- `POST /api/v1/career-path/goal-groups/` - 목표 그룹 생성
- `PUT /api/v1/career-path/goal-groups/{id}/` - 목표 그룹 수정

### Plan Items

- `GET /api/v1/career-path/plan-items/` - 활동 항목 목록
- `POST /api/v1/career-path/plan-items/` - 활동 항목 생성
- `PUT /api/v1/career-path/plan-items/{id}/` - 활동 항목 수정
- `DELETE /api/v1/career-path/plan-items/{id}/` - 활동 항목 삭제

### Sub Items

- `GET /api/v1/career-path/sub-items/` - 하위 항목 목록
- `POST /api/v1/career-path/sub-items/` - 하위 항목 생성
- `POST /api/v1/career-path/sub-items/{id}/toggle_done/` - 완료 여부 토글

### Shared Plans

- `GET /api/v1/career-path/shared-plans/` - 공유 패스 목록
- `POST /api/v1/career-path/shared-plans/` - 공유 패스 생성
- `GET /api/v1/career-path/shared-plans/{id}/` - 공유 패스 상세
- `PATCH /api/v1/career-path/shared-plans/{id}/` - 공유 패스 수정
- `DELETE /api/v1/career-path/shared-plans/{id}/` - 공유 패스 삭제
- `GET /api/v1/career-path/shared-plans/by-career-plan/{career_plan_id}/` - 커리어 패스 ID로 공유 패스 조회
- `POST /api/v1/career-path/shared-plans/{id}/like/` - 좋아요
- `POST /api/v1/career-path/shared-plans/{id}/bookmark/` - 북마크

---

## 사용 예시

### 1. 커리어 패스 생성

```python
POST /api/v1/career-path/career-plans/

{
  "title": "소프트웨어 개발자 커리어 패스",
  "description": "프론트엔드 개발자를 목표로 하는 3년 계획",
  "job_id": "app-developer",
  "job_name": "소프트웨어 개발자",
  "job_emoji": "💻",
  "star_id": "tech",
  "star_name": "기술의 별",
  "star_emoji": "⚙️",
  "star_color": "#6C5CE7",
  "years": [
    {
      "grade_id": "mid1",
      "grade_label": "중1",
      "semester": "both",
      "sort_order": 0,
      "goal_groups": [
        {
          "goal": "프로그래밍 기초 완성",
          "sort_order": 0,
          "items": [
            {
              "type": "activity",
              "title": "Python 기초 강의 수강",
              "months": [3, 4, 5],
              "difficulty": 2,
              "cost": "무료",
              "organizer": "코드잇",
              "url": "https://www.codeit.kr",
              "description": "Python 기초 문법 학습",
              "category_tags": ["project"],
              "activity_subtype": "general",
              "sort_order": 0,
              "sub_items": [
                {
                  "title": "1주차: 변수와 자료형",
                  "is_done": false,
                  "sort_order": 0
                },
                {
                  "title": "2주차: 조건문과 반복문",
                  "is_done": false,
                  "sort_order": 1
                }
              ],
              "links": [
                {
                  "title": "코드잇 Python 강의",
                  "url": "https://www.codeit.kr/courses/python",
                  "kind": "official",
                  "sort_order": 0
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

### 2. 템플릿 복사

```python
POST /api/v1/career-path/career-plans/{template_id}/use_template/

{
  "title": "나만의 소프트웨어 개발자 커리어 패스"
}
```

### 3. 커리어 패스 공유

```python
POST /api/v1/career-path/shared-plans/

{
  "career_plan": "career-plan-uuid",
  "share_type": "group",
  "description": "IT 개발자를 꿈꾸는 친구들과 공유합니다",
  "tags": ["SW", "코딩", "프론트엔드"],
  "group_ids": ["group-uuid-1", "group-uuid-2"]
}
```

---

## 권한 관리

### 인증

- 모든 API는 `IsAuthenticated` 권한 필요
- JWT 토큰 기반 인증

### 소유권 검증

- 커리어 패스: 본인 패스만 조회·수정·삭제
- 템플릿: 모든 사용자 조회 가능
- 공유 패스: 공유 유형에 따라 조회 권한 다름
  - `public`: 모두 조회 가능
  - `school`: 같은 학교 학생만
  - `group`: 같은 그룹 멤버만

---

## 성능 최적화

### N+1 문제 해결

```python
# CareerPlanViewSet.retrieve()
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
            ),
            Prefetch(
                'items',
                queryset=PlanItem.objects.prefetch_related(
                    'sub_items',
                    'links',
                )
            )
        )
    ),
)
```

### 인덱스

- 사용자별 커리어 패스: `(user, -created_at)`
- 직업별 패스: `(job_id)`
- 적성별 패스: `(star_id)`
- 공유 패스: `(share_type)`, `(school)`, `(-like_count)`

---

## 마이그레이션

```bash
# 마이그레이션 생성
python manage.py makemigrations career_path

# 마이그레이션 적용
python manage.py migrate career_path

# 마이그레이션 롤백
python manage.py migrate career_path 0001
```

---

## 데모 시드

프론트엔드가 백엔드 API만 사용할 때, 로컬에 학교·그룹·공개 공유 패스를 채우려면:

```bash
cd backend && source venv/bin/activate
python manage.py seed_career_path_demo
# 기존 시드 데모 계정을 지우고 다시 만들 때
python manage.py seed_career_path_demo --reset
```

- 로그인: `seed.demo@example.com` / `seed12345`
- 생성 내용: 학교 2곳, 공개 그룹 3개, 공개 `SharedPlan` 3건 (각각 `CareerPlan` 포함)

---

## 다음 단계

1. **Comment 모델 추가** - 공유 패스에 댓글 기능
2. **Reaction 모델 추가** - 좋아요·북마크 기능 구현
3. **Report 모델 추가** - 신고 기능
4. **Notification 모델 추가** - 알림 기능
5. **Redis 캐싱** - 공유 패스 조회 성능 개선
6. **Celery 비동기 작업** - 템플릿 복사 등

---

**작성자**: AI Assistant  
**최종 수정일**: 2026-03-27
