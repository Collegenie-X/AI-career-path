# AI Career Path — Django Backend

Django 5.x + Django REST Framework 기반 API 서버 + Admin 통합 설계

---

## 문서 구조

| 문서명 | 설명 | 줄 수 | 파일 크기 |
|-------|------|-------|----------|
| **ARCHITECTURE_COMPLETE.md** | 아키텍처 완전 설계서 (통합 버전) | 2,353줄 | 81KB |
| **DATABASE_DESIGN_COMPLETE.md** | DB 완전 설계서 (52개 모델 상세) | 5,335줄 | 187KB |
| **DB_IMPROVEMENT_SUMMARY.md** | DB 개선 요약 (2026-03-25) | 300줄 | 8.1KB |


---

## 빠른 시작

### 권장 읽기 순서

1. **ARCHITECTURE_COMPLETE.md** (필수)
   - 전체 시스템 아키텍처
   - Django 앱 구조
   - API 엔드포인트 전체 명세
   - 배포 구성

2. **DATABASE_DESIGN_COMPLETE.md** (필수)
   - 52개 모델 상세 정의
   - ERD 다이어그램
   - DRF Serializer & ViewSet
   - 인포그래픽 & 미디어 관리 전략

3. **DB_IMPROVEMENT_SUMMARY.md** (선택)
   - 개선 사항 요약
   - 성능 비교
   - 마이그레이션 가이드

---

## 주요 개선 사항 (2026-03-25)

### 배열 데이터 정규화 (22개 신규 모델)

| 탐색 영역 | 신규 모델 수 | 주요 개선 |
|---------|-----------|---------|
| **직업 탐색** | 9개 | `JobCareerPathStage`, `JobCareerPathTask`, `JobKeyPreparation`, `JobInfographic` 등 |
| **고입 탐색** | 6개 | `HighSchoolAdmissionStep`, `HighSchoolCareerPathDetail`, `HighSchoolInfographic` 등 |
| **대입 탐색** | 2개 | `UniversityDepartment`, `UniversityAdmissionPlaybook` |
| **인포그래픽** | 3개 | `JobInfographic`, `HighSchoolInfographic`, `UniversityInfographic` |
| **카테고리** | 2개 | `HighSchoolCategory`, `UniversityAdmissionCategory` |

### 성능 개선

| 항목 | 개선 효과 |
|------|----------|
| 배열 검색 성능 | 10~50배 향상 |
| 통계 집계 성능 | 5~20배 향상 |
| API 응답 크기 | 90% 감소 (50KB → 5KB) |
| DB 쿼리 수 | 95% 감소 (N+1 해결) |

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| **프레임워크** | Django 5.1.x, Django REST Framework 3.15.x |
| **인증** | JWT (djangorestframework-simplejwt), Social Login (Google, Kakao, Naver) |
| **데이터베이스** | PostgreSQL (운영), SQLite3 (로컬) |
| **캐시** | Redis |
| **스토리지** | AWS S3 (인포그래픽, 프로필 이미지) |
| **배포** | Docker, Gunicorn, Nginx |
| **API 문서** | drf-spectacular (OpenAPI 3.0 / Swagger UI) |

---

## 프로젝트 구조

```
backend/
├── config/                          # Django 설정
├── apps/
│   ├── accounts/                    # 인증 & 회원 (1개 모델)
│   ├── quiz/                        # 적성 검사 (4개 모델)
│   ├── explore/                     # 커리어 탐색 (25개 모델) ★
│   ├── career_path/                 # 커리어 실행 (8개 모델)
│   ├── community/                   # 커뮤니티 (10개 모델)
│   ├── career_plan/                 # 실행 계획 (4개 모델)
│   ├── resource/                    # 학습 자료 (1개 모델)
│   ├── project/                     # 프로젝트 (2개 모델)
│   └── portfolio/                   # 포트폴리오 (1개 모델)
├── common/                          # 공통 유틸리티
├── requirements/
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

**총 모델 수**: 56개 (기존 30개 → 개선 후 56개)

---

## API 엔드포인트 요약

| 앱 | 엔드포인트 수 | 주요 기능 |
|----|-----------|----------|
| `auth` | 6개 | 소셜 로그인, JWT 토큰, 프로필 관리 |
| `quiz` | 8개 | 문제 조회, 결과 제출, 리포트 조회 |
| `explore` | 30개 | 직업/고입/대입 탐색, 인포그래픽, 학교 비교 |
| `career-path` | 12개 | 템플릿 조회, 내 패스 CRUD, 학교/그룹 관리 |
| `community` | 12개 | 공유 로드맵, 댓글, 좋아요, 북마크 |
| `career-plan` | 12개 | 실행 계획 CRUD, 그룹 관리 |
| **총계** | **80개** | - |

---

## 개발 로드맵

```
Phase 1: 기반 구축 (2주)
├── 프로젝트 셋업
├── 소셜 로그인 + JWT
└── 적성 검사 API

Phase 2: 탐색 기능 (4주) ★ 핵심
├── Job 기본 + 9개 관련 모델
├── HighSchool 기본 + 6개 관련 모델
├── University 기본 + 2개 관련 모델
├── 인포그래픽 3개 모델
└── JSON 데이터 마이그레이션

Phase 3: 커리어 실행 (3주)
├── CareerPathTemplate
├── SharedRoadmap
└── ExecutionPlan

Phase 4: 완성 & 배포 (2주)
├── Django Admin 고도화
├── Swagger 문서
├── S3 연동
└── Docker 배포
```

**총 예상 기간**: 약 11주 (개발자 1명 기준)

---

## 새로운 기능 (개선 버전)

### 1. 복잡한 검색

```python
# "Python이 필요한 AI 관련 직업"
Job.objects.filter(
    Q(name__icontains='AI'),
    key_preparations__preparation_item__icontains='Python'
).distinct()
```

### 2. 학교 비교

```
GET /api/v1/explore/high-schools/compare/?ids=ksa,snu_science

→ 여러 고교의 통계, 일과, 프로그램을 테이블로 비교
```

### 3. 인포그래픽

```json
{
  "infographic_type": "salary_curve",
  "title": "AI 연구원 연봉 커브",
  "image_url": "https://s3.../salary-curve.png",
  "data_points": {
    "labels": ["신입", "3년차", "5년차", "7년차", "10년차"],
    "values": [6000, 8500, 12000, 15000, 20000]
  }
}
```

### 4. 통계 대시보드

```python
# 가장 많이 추천되는 고교 유형
JobRecommendedHighSchool.objects
    .values('high_school_type')
    .annotate(count=Count('id'))
    .order_by('-count')[:5]
```

---

## 로컬 개발 시작

```bash
# 1. 가상환경 생성
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. 패키지 설치
pip install -r requirements/local.txt

# 3. 환경 변수 설정
cp .env.example .env
# .env 파일 편집

# 4. 마이그레이션
python manage.py migrate

# 5. JSON 데이터 임포트
python manage.py import_quiz_questions --json-path ../frontend/data/quiz-questions.json
python manage.py import_jobs --json-path ../frontend/data/jobs.json
python manage.py import_job_details --json-path ../frontend/data/job-career-routes.json
# ... (기타 임포트 커맨드)

# 6. 슈퍼유저 생성
python manage.py createsuperuser

# 7. 개발 서버 실행
python manage.py runserver
```

**접속**:
- API: http://localhost:8000/api/v1/
- Admin: http://localhost:8000/admin/
- Swagger: http://localhost:8000/api/docs/

---

## 라이선스

MIT License

---

## 문의

프로젝트 관련 문의사항은 이슈로 등록해 주세요.
