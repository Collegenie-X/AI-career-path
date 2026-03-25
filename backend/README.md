# AI Career Path — Django Backend

> **Django 5.x + Django REST Framework (DRF) 기반 API 서버**
> 
> **완성 버전 (2026-03-25)**: 전체 구조 구현 완료
> 
> **총 모델 수**: 50개 | **API 엔드포인트**: 약 80개 | **Python 파일**: 105개

---

## 빠른 시작

### 로컬 개발 환경 (SQLite3)

```bash
cd backend

# 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 패키지 설치
pip install -r requirements/local.txt

# 환경 변수 설정
cp .env.example .env

# 데이터베이스 마이그레이션
python manage.py migrate

# 슈퍼유저 생성
python manage.py createsuperuser

# 기본 데이터 임포트
python manage.py import_riasec_reports

# 개발 서버 실행
python manage.py runserver
```

**접속 주소**:
- API Root: http://localhost:8000/api/v1/
- Django Admin: http://localhost:8000/admin/
- Swagger UI: http://localhost:8000/api/docs/

---

## 프로젝트 구조

```
backend/
├── config/                          # Django 설정
│   ├── settings/
│   │   ├── base.py                  # 공통 설정
│   │   ├── local.py                 # 로컬 개발 (SQLite3)
│   │   └── production.py            # 운영 (PostgreSQL + Redis + S3)
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
│
├── apps/                            # Django 앱들 (9개)
│   ├── accounts/                    # 인증 & 회원 관리 (1개 모델)
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── admin.py
│   │   └── services/
│   │       ├── social_auth_service.py
│   │       └── jwt_service.py
│   │
│   ├── quiz/                        # 적성 검사 (4개 모델)
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── admin.py
│   │   ├── services/
│   │   │   └── riasec_calculator.py
│   │   └── management/commands/
│   │       ├── import_quiz_questions.py
│   │       └── import_riasec_reports.py
│   │
│   ├── explore/                     # 커리어 탐색 (25개 모델) ⭐
│   │   ├── models/
│   │   │   ├── job_models.py        # 11개 모델
│   │   │   ├── high_school_models.py # 8개 모델
│   │   │   ├── university_models.py  # 4개 모델
│   │   │   └── infographic_models.py # 3개 모델
│   │   ├── serializers/
│   │   │   ├── job_serializers.py
│   │   │   ├── high_school_serializers.py
│   │   │   └── university_serializers.py
│   │   ├── views/
│   │   │   ├── job_views.py
│   │   │   ├── high_school_views.py
│   │   │   └── university_views.py
│   │   ├── urls.py
│   │   ├── admin.py
│   │   └── management/commands/
│   │       ├── import_job_categories.py
│   │       ├── import_jobs.py
│   │       └── import_job_details.py
│   │
│   ├── career_path/                 # 커리어 실행 (6개 모델)
│   ├── community/                   # 커뮤니티 (6개 모델)
│   ├── career_plan/                 # 실행 계획 (4개 모델)
│   ├── resource/                    # 학습 자료 (1개 모델)
│   ├── project/                     # 프로젝트 (2개 모델)
│   └── portfolio/                   # 포트폴리오 (1개 모델)
│
├── common/                          # 공통 유틸리티
│   ├── models.py                    # TimeStampedModel, UUIDPrimaryKeyModel
│   ├── permissions.py               # IsOwnerOrReadOnly, IsGroupAdmin
│   ├── pagination.py                # 커스텀 페이지네이션
│   ├── exceptions.py                # 커스텀 예외 처리
│   ├── middleware.py                # 성능 모니터링
│   └── utils.py                     # 이미지 처리, 초대 코드 생성
│
├── requirements/
│   ├── base.txt
│   ├── local.txt
│   └── production.txt
│
├── manage.py
├── Dockerfile
├── docker-compose.yml
├── Makefile
└── README.md
```

---

## 기술 스택

| 분류 | 기술 | 버전 |
|-----|------|------|
| **프레임워크** | Django | 5.1.0 |
| **REST API** | Django REST Framework | 3.15.0 |
| **인증** | JWT + Social Login | - |
| **데이터베이스** | PostgreSQL / SQLite3 | 16 / - |
| **캐시** | Redis | 7 |
| **스토리지** | AWS S3 | - |
| **API 문서** | drf-spectacular | 0.27.2 |
| **배포** | Docker + Gunicorn + Nginx | - |

---

## 앱별 모델 요약

| Django App | 모델 수 | 주요 모델 | API 엔드포인트 |
|-----------|--------|----------|--------------|
| `accounts` | 1 | User | `/api/v1/auth/` |
| `quiz` | 4 | QuizQuestion, QuizResult, RiasecReport | `/api/v1/quiz/` |
| `explore` | **25** | Job (11개 관련), HighSchool (8개 관련), University (4개 관련), Infographic (3개) | `/api/v1/explore/` |
| `career_path` | 6 | CareerPathTemplate, UserCareerPath, School | `/api/v1/career-path/` |
| `community` | 6 | Group, SharedRoadmap, RoadmapComment | `/api/v1/community/` |
| `career_plan` | 4 | ExecutionPlan, PlanItem | `/api/v1/career-plan/` |
| `resource` | 1 | Resource | `/api/v1/resources/` |
| `project` | 2 | Project, UserProject | `/api/v1/projects/` |
| `portfolio` | 1 | PortfolioItem | `/api/v1/portfolio/` |
| **총계** | **50** | - | **약 80개** |

---

## 주요 기능

### 1. 소셜 로그인 (Google, Kakao, Naver)
- OAuth2 기반 인증
- JWT Access/Refresh Token 발급
- 자동 회원가입

### 2. 적성 검사 (RIASEC)
- 40문항 적성 검사
- RIASEC 6가지 타입 분석
- 상세 리포트 제공

### 3. 커리어 탐색 ⭐
- **직업 탐색**: 11개 모델로 상세 정보 관리
- **고입 탐색**: 8개 모델로 고교 정보 관리
- **대입 탐색**: 4개 모델로 대학 정보 관리
- **인포그래픽**: 이미지 + 차트 데이터

### 4. 커리어 패스
- 공식 템플릿 제공
- 사용자 커리어 패스 생성/관리
- 학교 그룹 기능

### 5. 커뮤니티
- 그룹 생성/가입
- 로드맵 공유
- 댓글, 좋아요, 북마크

### 6. 실행 계획
- 실행 계획 CRUD
- 세부 항목 관리
- 계획 그룹 공유

---

## 개발 현황

### ✅ 완료된 작업 (2026-03-25)

1. ✅ Django 프로젝트 기본 구조 (config, requirements)
2. ✅ 9개 Django 앱 생성 및 기본 구조
3. ✅ 공통 유틸리티 및 베이스 모델
4. ✅ 50개 모델 정의
5. ✅ DRF Serializer 작성 (30개 이상)
6. ✅ DRF ViewSet 작성 (15개 이상)
7. ✅ 80개 API 엔드포인트 구현
8. ✅ Django Admin 설정 (12개 Admin 클래스)
9. ✅ 소셜 로그인 서비스 (Google, Kakao, Naver)
10. ✅ JWT 인증 시스템
11. ✅ 권한 시스템 (4개 커스텀 권한 클래스)
12. ✅ Management Commands (10개)
13. ✅ Docker 배포 설정
14. ✅ Makefile 작성
15. ✅ 문서 작성 (5개 문서)

**총 Python 파일**: 105개  
**총 코드 라인**: 약 5,000줄

### ⏳ 진행 예정

1. ⏳ JSON 데이터 마이그레이션 실행
2. ⏳ 추가 Management Commands 작성 (고입/대입/템플릿)
3. ⏳ API 테스트 코드 작성
4. ⏳ S3 이미지 업로드 구현
5. ⏳ 프론트엔드 연동
6. ⏳ 운영 환경 배포

---

## Makefile 사용

```bash
# 도움말
make help

# 개발
make install          # 패키지 설치
make migrate          # 마이그레이션
make run              # 서버 실행
make superuser        # 슈퍼유저 생성
make shell            # Django shell

# 데이터 임포트
make import-riasec    # RIASEC 리포트
make import-quiz      # 적성 검사 문제
make import-jobs      # 직업 데이터

# 테스트
make test             # 테스트 실행
make lint             # 린터 실행
make format           # 코드 포맷팅

# Docker
make docker-build     # 이미지 빌드
make docker-up        # 컨테이너 실행
make docker-down      # 컨테이너 중지
make docker-logs      # 로그 확인

# 정리
make clean            # 캐시 파일 삭제
```

---

## API 문서

### Swagger UI
http://localhost:8000/api/docs/

### ReDoc
http://localhost:8000/api/redoc/

### OpenAPI Schema
http://localhost:8000/api/schema/

---

## 주요 API 엔드포인트

### 인증 (`/api/v1/auth/`)
- `POST /social-login/` - 소셜 로그인
- `POST /token/refresh/` - 토큰 갱신
- `POST /logout/` - 로그아웃
- `GET /me/` - 내 프로필
- `PATCH /me/` - 프로필 수정
- `DELETE /me/` - 회원 탈퇴

### 적성 검사 (`/api/v1/quiz/`)
- `GET /questions/` - 문제 목록
- `GET /questions/{id}/` - 문제 상세
- `POST /results/` - 결과 제출
- `GET /results/` - 내 결과 목록
- `GET /results/{id}/` - 결과 상세
- `GET /reports/` - RIASEC 리포트 목록
- `GET /reports/{type}/` - 특정 타입 리포트

### 커리어 탐색 (`/api/v1/explore/`)

#### 직업 탐색
- `GET /job-categories/` - 직업 카테고리 목록
- `GET /jobs/` - 직업 목록 (필터: category, difficulty, rarity)
- `GET /jobs/{id}/` - 직업 상세
- `GET /jobs/{id}/career-path-stages/` - 커리어 단계
- `GET /jobs/{id}/infographics/` - 인포그래픽
- `GET /jobs/search-by-preparation/` - 준비사항 기반 검색
- `GET /job-infographics/` - 전체 인포그래픽

#### 고입 탐색
- `GET /high-school-categories/` - 고교 카테고리
- `GET /high-schools/` - 고교 목록
- `GET /high-schools/{id}/` - 고교 상세
- `GET /high-schools/{id}/admission-steps/` - 입학 단계
- `GET /high-schools/{id}/career-path-details/` - 학년별 준비
- `GET /high-schools/compare/` - 고교 비교
- `GET /high-school-infographics/` - 전체 인포그래픽

#### 대입 탐색
- `GET /admission-categories/` - 전형 카테고리
- `GET /admission-categories/{id}/playbooks/` - 플레이북
- `GET /universities/` - 대학 목록
- `GET /universities/{id}/` - 대학 상세
- `GET /universities/{id}/departments/` - 학과 목록
- `GET /university-infographics/` - 전체 인포그래픽

### 커리어 패스 (`/api/v1/career-path/`)
- `GET /templates/` - 템플릿 목록
- `GET /templates/{id}/` - 템플릿 상세
- `POST /templates/{id}/like/` - 템플릿 좋아요
- `GET /my-paths/` - 내 패스 목록
- `POST /my-paths/` - 내 패스 생성
- `GET/PATCH/DELETE /my-paths/{id}/` - 내 패스 관리
- `GET/POST /schools/` - 학교 관리
- `POST /schools/join/` - 학교 가입

### 커뮤니티 (`/api/v1/community/`)
- `GET/POST /groups/` - 그룹
- `POST /groups/{id}/join/` - 그룹 가입
- `GET/POST /shared-roadmaps/` - 공유 로드맵
- `POST /shared-roadmaps/{id}/like/` - 좋아요
- `POST /shared-roadmaps/{id}/bookmark/` - 북마크
- `POST /shared-roadmaps/{id}/comments/` - 댓글

### 실행 계획 (`/api/v1/career-plan/`)
- `GET/POST /plans/` - 실행 계획
- `GET/PATCH/DELETE /plans/{id}/` - 계획 관리
- `GET/POST /plans/{id}/items/` - 계획 항목

---

## 문서

| 문서명 | 설명 | 용도 |
|-------|------|------|
| `QUICKSTART.md` | 1분 빠른 시작 | 즉시 실행 |
| `SETUP.md` | 상세 설치 가이드 | 단계별 설치 |
| `BACKEND_STRUCTURE.md` | 전체 구조 설명 | 구조 이해 |
| `ARCHITECTURE_COMPLETE.md` | 아키텍처 설계서 | 설계 참고 |
| `DATABASE_DESIGN_COMPLETE.md` | DB 설계서 | 모델 참고 |

---

## 코드 품질

### 설계 원칙
- ✅ 클린 코드 원칙 준수
- ✅ 명확한 함수명, 변수명 (길게 사용)
- ✅ 파일당 400줄 이하 (explore 앱은 파일 분리)
- ✅ Early return 패턴 사용
- ✅ 배열 기반 반복 처리
- ✅ TypeScript 스타일 명명 규칙

### 파일 구조
- 모델: 역할별 파일 분리
- Serializer: 도메인별 파일 분리
- Views: 도메인별 파일 분리
- 각 파일 400줄 이하 유지

---

## 성능 최적화

### 데이터베이스
- `select_related()`: ForeignKey 조인
- `prefetch_related()`: Many-to-Many 최적화
- 인덱스 설정: 검색/필터링 필드

### 캐싱
- Redis 캐시: API 응답, 세션
- 캐시 TTL: 5분 (기본)

### API
- 페이지네이션: 20개/페이지
- 압축: gzip 활성화

---

## 보안

### 운영 환경
- ✅ HTTPS 강제
- ✅ HSTS 활성화
- ✅ CSRF 보호
- ✅ XSS 필터
- ✅ Rate Limiting

---

## Docker 배포

```bash
# 빌드 및 실행
docker-compose up -d

# 마이그레이션
docker-compose exec django python manage.py migrate

# 슈퍼유저 생성
docker-compose exec django python manage.py createsuperuser

# 로그 확인
docker-compose logs -f django
```

---

## 라이선스

MIT License

---

**작성일**: 2026-03-25  
**Django 버전**: 5.1.0  
**총 Python 파일**: 105개  
**총 모델**: 50개  
**총 API 엔드포인트**: 약 80개  
**총 코드 라인**: 약 5,000줄



작업 반영했습니다. **커리어 탐색(explore)·커리어 패스·커리어 플랜**을 한 번에 채울 수 있도록 **백엔드 시드 JSON**과 **import 커맨드**를 추가했습니다.

## 1. 생성·갱신되는 JSON (`backend/data/seed/`)

| 파일 | 내용 |
|------|------|
| `kingdoms.json` | `import_job_categories`용 — `{"kingdoms": [...]}` (8개 별/왕국) |
| `jobs.json` | `import_jobs`용 — 왕국별 **42개 직업** (프론트 `jobs.json` + `job-career-routes` + 확장) |
| `job_career_routes.json` | `import_job_details`용 — 기존 루트 + **seed 확장 직업** 블록 |
| `career_path_templates.json` | 커리어 패스 템플릿 **6개** (연도·항목 다수) |
| `career_plan_blueprints.json` | 실행 계획 **블루프린트 8개** (항목 다수) |

`jobs`는 `backend/scripts/build_seed_data.py`가 프론트 데이터를 합쳐서 매번 다시 씁니다.

## 2. 한 번에 넣기 (Makefile)

`backend` 디렉터리에서:

```bash
make import-seed
```

순서: 시드 JSON 빌드 → 카테고리 → 직업 → 직업 상세 → **커리어 패스 템플릿**.

**커리어 플랜**은 사용자가 있어야 DB에 넣을 수 있어요:

```bash
python manage.py import_career_plan_blueprints --user-email 당신의이메일@example.com
```

`--clear-existing`로 해당 사용자의 기존 실행 계획을 지우고 다시 넣을 수 있습니다.

## 3. 새 management 커맨드

- `import_career_path_templates` — 기본 경로 `data/seed/career_path_templates.json`
- `import_career_plan_blueprints` — `--user-email` 필수

## 4. 비고

- 예전 `make import-jobs`는 프론트 `kingdoms.json`이 **배열만** 있어 `kingdoms` 키가 없어 카테고리 import가 맞지 않을 수 있습니다. **`make import-seed`**는 `backend/data/seed/kingdoms.json` 형식에 맞춰 있습니다.
- 직업 수를 더 늘리려면 `build_seed_data.py`의 `BUILTIN_EXTRA_JOBS`에 행을 추가한 뒤 `python scripts/build_seed_data.py`를 다시 실행하면 됩니다.

원하시면 `career_path_templates.json` / `career_plan_blueprints.json`에 **추가 템플릿만** 더 넣는 것도 같이 정리해 드리겠습니다.