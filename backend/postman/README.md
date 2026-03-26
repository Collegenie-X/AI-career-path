# Postman에서 API 테스트하기

## 1) OpenAPI로 컬렉션 만들기 (권장)

서버를 띄운 뒤 브라우저/Postman에서 스키마를 가져옵니다.

| 항목 | URL |
|------|-----|
| Swagger UI | `http://127.0.0.1:8000/api/docs/` |
| ReDoc | `http://127.0.0.1:8000/api/redoc/` |
| OpenAPI 스키마 (YAML) | `http://127.0.0.1:8000/api/schema/` |

**Postman Import**

1. **Import** → **Link** → `http://127.0.0.1:8000/api/schema/`  
   (또는 파일로 받으려면 아래 `make openapi-export` 참고)
2. 환경 변수: `postman/Local.postman_environment.json` Import 후 선택
3. 인증이 필요한 요청: **Authorization** → Type **Bearer Token** → Token에 `access_token` 값 입력  
   또는 환경 변수 `access_token`을 채운 뒤, 컬렉션에서 `Authorization`을 Bearer `{{access_token}}`으로 설정

**토큰 발급**

- `POST {{api_prefix}}/auth/social-login/` — body: `provider`, `code` (소셜 OAuth 코드)
- 응답의 `access_token`을 환경 변수에 저장

**Refresh**

- `POST {{api_prefix}}/auth/token/refresh/` — body: `refresh_token`

---

## 2) 오프라인으로 스키마 파일 생성

저장소 루트에서 Django 설정이 로드되는 `backend` 디렉터리 기준:

```bash
cd backend
make openapi-export PYTHON=./venv/bin/python
```

생성물: `backend/postman/openapi.json` — Postman **Import** → **File**에서 선택

---

## 3) API URL 요약

모든 REST 엔드포인트는 **`/api/v1/`** 아래에 있습니다.

| Prefix | 앱 |
|--------|-----|
| `/api/v1/auth/` | 로그인·토큰·프로필 |
| `/api/v1/quiz/` | 적성 검사 |
| `/api/v1/explore/` | 직업·고교·대학 탐색 |
| `/api/v1/career-path/` | 커리어 패스 템플릿·내 패스 |
| `/api/v1/career-plan/` | 실행 계획·그룹 |
| `/api/v1/community/` | 커뮤니티 |
| `/api/v1/resources/` | 학습 자료 |
| `/api/v1/projects/` | 프로젝트 |
| `/api/v1/portfolio/` | 포트폴리오 |

읽기 전용 공개 API는 로그인 없이 호출 가능한 경우가 많고, 사용자 데이터는 **Bearer JWT**가 필요합니다.
