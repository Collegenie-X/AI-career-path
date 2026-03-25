# Django Backend 빠른 시작 가이드

## 1분 안에 시작하기

### 1단계: 가상환경 및 패키지 설치

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements/local.txt
```

### 2단계: 환경 변수 설정

```bash
cp .env.example .env
```

### 3단계: 데이터베이스 마이그레이션

```bash
python manage.py migrate
```

### 4단계: 슈퍼유저 생성

```bash
python manage.py createsuperuser
```

### 5단계: 기본 데이터 임포트

```bash
python manage.py import_riasec_reports
```

### 6단계: 서버 실행

```bash
python manage.py runserver
```

---

## 접속 주소

- **API Root**: http://localhost:8000/api/v1/
- **Django Admin**: http://localhost:8000/admin/
- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/

---

## 주요 API 테스트

### 1. 적성 검사 문제 조회

```bash
curl http://localhost:8000/api/v1/quiz/questions/
```

### 2. RIASEC 리포트 조회

```bash
curl http://localhost:8000/api/v1/quiz/reports/
```

### 3. 직업 목록 조회

```bash
curl http://localhost:8000/api/v1/explore/jobs/
```

### 4. 커리어 패스 템플릿 조회

```bash
curl http://localhost:8000/api/v1/career-path/templates/
```

---

## Docker로 실행하기

```bash
docker-compose up -d

docker-compose exec django python manage.py migrate

docker-compose exec django python manage.py createsuperuser

docker-compose logs -f django
```

---

## 다음 단계

1. JSON 데이터 마이그레이션: `SETUP.md` 참고
2. API 문서 확인: http://localhost:8000/api/docs/
3. Django Admin 접속: http://localhost:8000/admin/

---

**문제가 발생하면 `SETUP.md` 또는 `BACKEND_STRUCTURE.md`를 참고하세요.**
