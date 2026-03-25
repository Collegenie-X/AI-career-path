# Django Backend 설치 및 실행 가이드

## 목차

1. [로컬 개발 환경 설정 (SQLite3)](#1-로컬-개발-환경-설정-sqlite3)
2. [데이터 마이그레이션](#2-데이터-마이그레이션)
3. [Docker 배포 (PostgreSQL)](#3-docker-배포-postgresql)
4. [API 문서 확인](#4-api-문서-확인)

---

## 1. 로컬 개발 환경 설정 (SQLite3)

### 1.1 가상환경 생성 및 패키지 설치

```bash
cd backend

python -m venv venv

source venv/bin/activate

pip install --upgrade pip
pip install -r requirements/local.txt
```

### 1.2 환경 변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열어서 필요한 값들을 설정하세요.

### 1.3 데이터베이스 마이그레이션

```bash
python manage.py makemigrations
python manage.py migrate
```

### 1.4 슈퍼유저 생성

```bash
python manage.py createsuperuser
```

### 1.5 개발 서버 실행

```bash
python manage.py runserver
```

서버가 실행되면:
- API: http://localhost:8000/api/v1/
- Admin: http://localhost:8000/admin/
- Swagger UI: http://localhost:8000/api/docs/

---

## 2. 데이터 마이그레이션

### 2.1 RIASEC 리포트 임포트

```bash
python manage.py import_riasec_reports
```

### 2.2 적성 검사 문제 임포트

```bash
python manage.py import_quiz_questions --json-path ../frontend/data/quiz-questions.json
```

### 2.3 직업 탐색 데이터 임포트

```bash
python manage.py import_job_categories --json-path ../frontend/data/kingdoms.json

python manage.py import_jobs --json-path ../frontend/data/jobs.json

python manage.py import_job_details --json-path ../frontend/data/job-career-routes.json
```

### 2.4 고입 탐색 데이터 임포트

```bash
python manage.py import_high_school_categories --json-path ../frontend/data/high-school/meta.json

python manage.py import_high_schools --json-path ../frontend/data/high-school/

python manage.py import_high_school_details --json-path ../frontend/data/high-school/
```

### 2.5 대입 탐색 데이터 임포트

```bash
python manage.py import_admission_categories --json-path ../frontend/data/university-admission/

python manage.py import_universities --json-path ../frontend/data/university-admission/

python manage.py import_university_details --json-path ../frontend/data/university-admission/
```

### 2.6 커리어 패스 템플릿 임포트

```bash
python manage.py import_career_templates --json-path ../scripts/part1_data.json
```

---

## 3. Docker 배포 (PostgreSQL)

### 3.1 환경 변수 설정

`.env` 파일을 운영 환경에 맞게 수정:

```bash
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=api.aicareerpath.com
DATABASE_URL=postgres://aicareer:password@postgres:5432/aicareerpath
```

### 3.2 Docker 이미지 빌드 및 실행

```bash
docker-compose build

docker-compose up -d
```

### 3.3 컨테이너 내부에서 마이그레이션

```bash
docker-compose exec django python manage.py migrate

docker-compose exec django python manage.py createsuperuser

docker-compose exec django python manage.py import_riasec_reports
```

### 3.4 로그 확인

```bash
docker-compose logs -f django
```

### 3.5 컨테이너 중지

```bash
docker-compose down
```

---

## 4. API 문서 확인

### 4.1 Swagger UI

http://localhost:8000/api/docs/

### 4.2 ReDoc

http://localhost:8000/api/redoc/

### 4.3 OpenAPI Schema

http://localhost:8000/api/schema/

---

## 5. 주요 API 엔드포인트

### 인증
- `POST /api/v1/auth/social-login/` - 소셜 로그인
- `POST /api/v1/auth/token/refresh/` - 토큰 갱신
- `GET /api/v1/auth/me/` - 내 프로필

### 적성 검사
- `GET /api/v1/quiz/questions/` - 문제 목록
- `POST /api/v1/quiz/results/` - 결과 제출
- `GET /api/v1/quiz/reports/` - RIASEC 리포트

### 커리어 탐색
- `GET /api/v1/explore/jobs/` - 직업 목록
- `GET /api/v1/explore/jobs/{id}/` - 직업 상세
- `GET /api/v1/explore/high-schools/` - 고교 목록
- `GET /api/v1/explore/universities/` - 대학 목록

### 커리어 패스
- `GET /api/v1/career-path/templates/` - 템플릿 목록
- `POST /api/v1/career-path/my-paths/` - 내 패스 생성
- `GET /api/v1/career-path/my-paths/` - 내 패스 목록

---

## 6. 개발 팁

### 6.1 Django Shell 실행

```bash
python manage.py shell_plus
```

### 6.2 데이터베이스 초기화

```bash
python manage.py flush
```

### 6.3 특정 앱만 마이그레이션

```bash
python manage.py makemigrations explore
python manage.py migrate explore
```

### 6.4 테스트 실행

```bash
pytest
```

---

## 7. 트러블슈팅

### 7.1 마이그레이션 충돌

```bash
python manage.py migrate --fake-initial
```

### 7.2 Static 파일 수집

```bash
python manage.py collectstatic --noinput
```

### 7.3 캐시 초기화

```bash
python manage.py shell
>>> from django.core.cache import cache
>>> cache.clear()
```

---

## 8. 프로젝트 구조

```
backend/
├── config/                 # Django 설정
│   ├── settings/
│   │   ├── base.py        # 공통 설정
│   │   ├── local.py       # 로컬 개발
│   │   └── production.py  # 운영 환경
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── apps/                   # Django 앱들 (9개)
│   ├── accounts/          # 인증 & 회원
│   ├── quiz/              # 적성 검사
│   ├── explore/           # 커리어 탐색 (25개 모델)
│   ├── career_path/       # 커리어 실행
│   ├── community/         # 커뮤니티
│   ├── career_plan/       # 실행 계획
│   ├── resource/          # 학습 자료
│   ├── project/           # 프로젝트
│   └── portfolio/         # 포트폴리오
├── common/                 # 공통 유틸리티
├── requirements/           # 패키지 의존성
├── manage.py
├── Dockerfile
└── docker-compose.yml
```

---

## 9. 다음 단계

1. ✅ Django 프로젝트 구조 생성 완료
2. ⏳ JSON 데이터 마이그레이션 실행
3. ⏳ API 테스트
4. ⏳ 프론트엔드 연동
5. ⏳ 운영 환경 배포
