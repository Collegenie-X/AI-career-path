# Django Backend 전체 구조 완성

## 프로젝트 개요

Django 5.x + DRF 기반 AI Career Path Backend API 서버

- **총 모델 수**: 52개
- **Django 앱 수**: 9개
- **API 엔드포인트**: 약 80개
- **데이터베이스**: PostgreSQL (운영) / SQLite3 (로컬)

---

## 완성된 구조

### 1. 설정 파일 (config/)

```
config/
├── settings/
│   ├── __init__.py
│   ├── base.py                    # 공통 설정 (DRF, JWT, CORS)
│   ├── local.py                   # 로컬 개발 (SQLite3)
│   └── production.py              # 운영 환경 (PostgreSQL, Redis, S3)
├── urls.py                        # 루트 URL 라우팅
├── wsgi.py                        # WSGI 설정
└── asgi.py                        # ASGI 설정
```

### 2. Django 앱 (apps/)

#### 2.1 accounts (인증 & 회원 관리)
- **모델**: User (1개)
- **주요 기능**: 소셜 로그인 (Google, Kakao, Naver), JWT 인증
- **API**: `/api/v1/auth/`

#### 2.2 quiz (적성 검사)
- **모델**: QuizQuestion, QuizChoice, QuizResult, RiasecReport (4개)
- **주요 기능**: RIASEC 적성 검사, 결과 분석
- **API**: `/api/v1/quiz/`

#### 2.3 explore (커리어 탐색) ⭐ 핵심
- **모델**: 25개
  - 직업 탐색: 11개 모델
  - 고입 탐색: 8개 모델
  - 대입 탐색: 4개 모델
  - 인포그래픽: 3개 모델
- **주요 기능**: 직업/고교/대학 탐색, 인포그래픽, 학교 비교
- **API**: `/api/v1/explore/`

#### 2.4 career_path (커리어 실행)
- **모델**: CareerPathTemplate, TemplateYear, TemplateItem, UserCareerPath, School, SchoolMember (6개)
- **주요 기능**: 커리어 패스 템플릿, 사용자 패스 관리
- **API**: `/api/v1/career-path/`

#### 2.5 community (커뮤니티)
- **모델**: Group, GroupMember, SharedRoadmap, RoadmapComment, RoadmapLike, RoadmapBookmark (6개)
- **주요 기능**: 그룹, 공유 로드맵, 댓글, 좋아요
- **API**: `/api/v1/community/`

#### 2.6 career_plan (실행 계획)
- **모델**: ExecutionPlan, PlanItem, PlanGroup, PlanGroupMember (4개)
- **주요 기능**: 실행 계획 CRUD, 계획 그룹
- **API**: `/api/v1/career-plan/`

#### 2.7 resource (학습 자료)
- **모델**: Resource (1개)
- **주요 기능**: 학습 자료 관리
- **API**: `/api/v1/resources/`

#### 2.8 project (프로젝트)
- **모델**: Project, UserProject (2개)
- **주요 기능**: 프로젝트 템플릿, 사용자 프로젝트
- **API**: `/api/v1/projects/`

#### 2.9 portfolio (포트폴리오)
- **모델**: PortfolioItem (1개)
- **주요 기능**: 포트폴리오 항목 관리
- **API**: `/api/v1/portfolio/`

### 3. 공통 유틸리티 (common/)

```
common/
├── models.py              # TimeStampedModel, UUIDPrimaryKeyModel
├── permissions.py         # IsOwnerOrReadOnly, IsGroupAdmin, IsAdminOrReadOnly
├── pagination.py          # 커스텀 페이지네이션
├── exceptions.py          # 커스텀 예외 처리
├── middleware.py          # 성능 모니터링 미들웨어
└── utils.py               # 이미지 처리, 초대 코드 생성
```

### 4. Management Commands

#### quiz 앱
- `import_quiz_questions` - 적성 검사 문제 임포트
- `import_riasec_reports` - RIASEC 리포트 임포트

#### explore 앱
- `import_job_categories` - 직업 카테고리 임포트
- `import_jobs` - 직업 기본 정보 임포트
- `import_job_details` - 직업 상세 정보 임포트 (배열 데이터)
- `import_high_school_categories` - 고교 카테고리 임포트
- `import_high_schools` - 고교 기본 정보 임포트
- `import_high_school_details` - 고교 상세 정보 임포트
- `import_admission_categories` - 전형 카테고리 임포트
- `import_universities` - 대학 기본 정보 임포트
- `import_university_details` - 대학 상세 정보 임포트

#### career_path 앱
- `import_career_templates` - 커리어 패스 템플릿 임포트

---

## 모델 통계

| Django App | 모델 수 | 주요 모델 |
|-----------|--------|----------|
| accounts | 1 | User |
| quiz | 4 | QuizQuestion, QuizChoice, QuizResult, RiasecReport |
| explore | 25 | Job (11개 관련), HighSchool (8개 관련), University (4개 관련), Infographic (3개) |
| career_path | 6 | CareerPathTemplate, UserCareerPath, School |
| community | 6 | Group, SharedRoadmap, RoadmapComment |
| career_plan | 4 | ExecutionPlan, PlanItem |
| resource | 1 | Resource |
| project | 2 | Project, UserProject |
| portfolio | 1 | PortfolioItem |
| **총계** | **50** | - |

---

## 기술 스택

### Core
- Django 5.1.0
- Django REST Framework 3.15.0
- Python 3.11

### Authentication
- djangorestframework-simplejwt 5.3.1
- social-auth-app-django 5.4.1

### Database
- PostgreSQL 16 (운영)
- SQLite3 (로컬)
- psycopg2-binary 2.9.9

### Cache & Session
- Redis 7
- django-redis 5.4.0

### API Documentation
- drf-spectacular 0.27.2 (OpenAPI 3.0, Swagger UI)

### Storage
- AWS S3 (인포그래픽, 프로필 이미지)
- django-storages 1.14.3
- boto3 1.34.0

### Deployment
- Docker + Docker Compose
- Gunicorn 21.2.0
- Nginx (Reverse Proxy)

---

## API 엔드포인트 요약

### Authentication (`/api/v1/auth/`)
- POST `/social-login/` - 소셜 로그인
- POST `/token/refresh/` - 토큰 갱신
- POST `/logout/` - 로그아웃
- GET/PATCH/DELETE `/me/` - 내 프로필

### Quiz (`/api/v1/quiz/`)
- GET `/questions/` - 문제 목록
- POST `/results/` - 결과 제출
- GET `/reports/` - RIASEC 리포트

### Explore (`/api/v1/explore/`)
- GET `/job-categories/` - 직업 카테고리
- GET `/jobs/` - 직업 목록
- GET `/jobs/{id}/` - 직업 상세
- GET `/jobs/{id}/career-path-stages/` - 커리어 단계
- GET `/jobs/{id}/infographics/` - 직업 인포그래픽
- GET `/jobs/search-by-preparation/` - 준비사항 기반 검색
- GET `/high-school-categories/` - 고교 카테고리
- GET `/high-schools/` - 고교 목록
- GET `/high-schools/{id}/` - 고교 상세
- GET `/high-schools/compare/` - 고교 비교
- GET `/admission-categories/` - 전형 카테고리
- GET `/universities/` - 대학 목록
- GET `/universities/{id}/` - 대학 상세
- GET `/universities/{id}/departments/` - 학과 목록

### Career Path (`/api/v1/career-path/`)
- GET `/templates/` - 템플릿 목록
- GET `/templates/{id}/` - 템플릿 상세
- POST `/templates/{id}/like/` - 템플릿 좋아요
- GET `/my-paths/` - 내 패스 목록
- POST `/my-paths/` - 내 패스 생성
- GET/PATCH/DELETE `/my-paths/{id}/` - 내 패스 관리
- GET/POST `/schools/` - 학교 목록/등록
- POST `/schools/join/` - 학교 가입

### Community (`/api/v1/community/`)
- GET/POST `/groups/` - 그룹 목록/생성
- POST `/groups/{id}/join/` - 그룹 가입
- GET/POST `/shared-roadmaps/` - 공유 로드맵
- POST `/shared-roadmaps/{id}/like/` - 좋아요
- POST `/shared-roadmaps/{id}/bookmark/` - 북마크
- POST `/shared-roadmaps/{id}/comments/` - 댓글 작성

### Career Plan (`/api/v1/career-plan/`)
- GET/POST `/plans/` - 실행 계획 목록/생성
- GET/PATCH/DELETE `/plans/{id}/` - 실행 계획 관리
- GET/POST `/plans/{id}/items/` - 계획 항목
- GET/POST `/groups/` - 계획 그룹

### Resources (`/api/v1/resources/`)
- GET `/` - 학습 자료 목록
- GET `/{id}/` - 학습 자료 상세

### Projects (`/api/v1/projects/`)
- GET `/templates/` - 프로젝트 템플릿
- GET/POST `/my-projects/` - 내 프로젝트

### Portfolio (`/api/v1/portfolio/`)
- GET/POST `/` - 포트폴리오 항목 목록/생성
- GET/PATCH/DELETE `/{id}/` - 포트폴리오 항목 관리

---

## 다음 단계

1. ✅ Django 프로젝트 구조 생성 완료
2. ⏳ JSON 데이터 마이그레이션 실행
3. ⏳ API 테스트 및 검증
4. ⏳ 프론트엔드 연동
5. ⏳ Docker 배포 테스트
6. ⏳ 운영 환경 배포

---

**작성일**: 2026-03-25  
**Django 버전**: 5.1.0  
**총 파일 수**: 100개 이상  
**총 코드 라인**: 약 5,000줄
