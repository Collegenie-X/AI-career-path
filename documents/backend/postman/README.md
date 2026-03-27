# Postman에서 API 테스트하기

저장소 기준 경로: `documents/backend/postman/`

| 파일 | 설명 |
|------|------|
| `Local.postman_environment.json` | 로컬 서버·API prefix·JWT용 환경 변수 |
| `AI-Career-Path.postman_collection.json` | 자주 쓰는 엔드포인트 스타터 컬렉션 (선택) |

전체 API는 **OpenAPI 스키마 Import**가 가장 정확합니다. 아래 1)을 권장합니다.

---

## 1) OpenAPI로 컬렉션 만들기 (권장)

서버를 띄운 뒤 스키마를 가져옵니다.

| 항목 | URL |
|------|-----|
| Swagger UI | `http://127.0.0.1:8000/api/docs/` |
| ReDoc | `http://127.0.0.1:8000/api/redoc/` |
| OpenAPI 스키마 (JSON) | `http://127.0.0.1:8000/api/schema/` |

**Postman Import**

1. **Import** → **Link** → `http://127.0.0.1:8000/api/schema/`
2. **Import** → **File** → `documents/backend/postman/Local.postman_environment.json` 선택 후 활성화
3. 인증이 필요한 요청: 컬렉션 또는 폴더 **Authorization** → **Bearer Token** → `{{access_token}}`

**토큰 획득**

- `POST {{auth_prefix}}/email-signup/` — body: `email`, `password`, `name`, `grade`, `emoji` (회원가입)
- `POST {{auth_prefix}}/email-login/` — body: `email`, `password` (이메일 로그인)
- `POST {{auth_prefix}}/social-login/` — body: `provider`, `code` (소셜 OAuth 코드)
- 응답의 `access_token`을 환경 변수 `access_token`에 저장

**Refresh**

- `POST {{auth_prefix}}/token/refresh/` — body: `refresh_token`

**테스트 계정**

- 이메일: `test@example.com`
- 비밀번호: `password123`

---

## 2) 오프라인으로 스키마 파일 생성

`backend` 디렉터리에서:

```bash
cd backend
make openapi-export PYTHON=./venv/bin/python
```

생성물: `backend/postman/openapi.json` — Postman **Import** → **File**에서 선택

---

## 3) 환경 변수 요약

| 변수 | 예시 값 | 용도 |
|------|---------|------|
| `base_url` | `http://127.0.0.1:8000` | 호스트 |
| `api_prefix` | `{{base_url}}/api/v1` | API 루트 |
| `auth_prefix` | `{{api_prefix}}/auth` | 로그인·토큰·프로필 |
| `career_path_prefix` | `{{api_prefix}}/career-path` | 커리어 패스 (/career) |
| `career_plan_prefix` | `{{api_prefix}}/career-plan` | 커리어 실행 DreamMate (/dreammate) |
| `community_prefix` | `{{api_prefix}}/community` | 그룹·공유 로드맵(커리어 패스 연동) |
| `explore_prefix` | `{{api_prefix}}/explore` | 직업·학교·대학 탐색 |
| `access_token` | (비워두고 로그인 후 채움) | Bearer JWT |
| `refresh_token` | (선택) | 리프레시 토큰 |

---

## 4) API URL 요약 (`/api/v1/`)

| Prefix | 앱 | 비고 |
|--------|-----|------|
| `/api/v1/auth/` | accounts | 이메일 회원가입·로그인, 소셜 로그인, 토큰 갱신, `me/` |
| `/api/v1/quiz/` | quiz | 적성 검사 |
| `/api/v1/explore/` | explore | 직업·고교·대학 + `career-kingdoms/` 등 JSON 뷰 |
| `/api/v1/career-path/` | career_path | 커리어 패스 CRUD, 학교, 템플릿·공유 패스 |
| `/api/v1/career-plan/` | career_plan | DreamMate 로드맵·드림 라이브러리·스페이스 |
| `/api/v1/community/` | community | 그룹, **커리어 패스용** `shared-roadmaps` |
| `/api/v1/resources/` | resource | 학습 자료 |
| `/api/v1/projects/` | project | 프로젝트 |
| `/api/v1/portfolio/` | portfolio | 포트폴리오 |

공개·읽기 전용 API는 JWT 없이 동작하는 경우가 있고, 사용자 데이터·쓰기는 **Bearer JWT**가 필요합니다.

---

## 5) `career-path` 라우터 (커리어 패스)

Base: `{{career_path_prefix}}/` (예: `/api/v1/career-path/`)

| Resource | 경로 |
|----------|------|
| 학교 | `schools/` |
| 그룹 | `groups/` |
| 커리어 패스 | `career-plans/` |
| 학년 | `plan-years/` |
| 목표 그룹 | `goal-groups/` |
| 계획 항목 | `plan-items/` |
| 하위 항목 | `sub-items/` |
| 공유 패스 | `shared-plans/` |

DRF 라우터 규칙: 목록 `GET .../`, 생성 `POST .../`, 상세 `.../{id}/`, 커스텀 액션은 ViewSet 정의에 따름.

**공유 패스 특수 엔드포인트:**
- `POST /api/v1/career-path/career-plans/{id}/use_template/` - 템플릿 복사 (body: `{"title": "제목"}`)
- `GET /api/v1/career-path/shared-plans/by-career-plan/{career_plan_id}/` - 커리어 패스 ID로 공유 패스 조회
- `POST /api/v1/career-path/shared-plans/{id}/like/` - 좋아요 (응답: `{"like_count": N}`)
- `POST /api/v1/career-path/shared-plans/{id}/bookmark/` - 북마크 (응답: `{"bookmark_count": N}`)

---

## 6) `career-plan` 라우터 (커리어 실행 / DreamMate)

Base: `{{career_plan_prefix}}/` (예: `/api/v1/career-plan/`)

| 영역 | Resource | 경로 |
|------|----------|------|
| 로드맵 | Roadmap | `roadmaps/` |
| 활동 | RoadmapItem | `roadmap-items/` |
| TODO | RoadmapTodo | `roadmap-todos/` |
| 마일스톤 | RoadmapMilestone | `roadmap-milestones/` |
| 드림 라이브러리 | DreamResource | `dream-resources/` |
| 자료 섹션 | ResourceSection | `resource-sections/` |
| 드림 스페이스 | DreamSpace | `dream-spaces/` |
| 스페이스 참여 | SpaceParticipant | `space-participants/` |
| 공유 드림 로드맵 | SharedDreamRoadmap | `shared-dream-roadmaps/` |

`community.SharedRoadmap`(테이블 `shared_roadmaps`)은 **커리어 패스** 공유용이고, DreamMate 쪽 공유는 **`shared-dream-roadmaps`** 로 구분됩니다.

---

## 7) `community` 라우터

Base: `{{community_prefix}}/` (예: `/api/v1/community/`)

| Resource | 경로 |
|----------|------|
| 그룹 | `groups/` |
| 공유 로드맵 (CareerPlan 연동) | `shared-roadmaps/` |

---

## 8) 스타터 컬렉션 (`AI-Career-Path.postman_collection.json`)

- **Auth (no Bearer)** 폴더: 
  - `POST email-signup/` - 이메일 회원가입
  - `POST email-login/` - 이메일 로그인
  - `POST social-login/` - 소셜 로그인
  - `POST token/refresh/` - 토큰 갱신
- **Auth (Bearer)** 폴더:
  - `GET me/` - 현재 사용자 정보
- **Career Path / Career Plan / Community** 폴더: 대표 `GET` 목록 요청 (Bearer `{{access_token}}`)

Import 후 환경 **AI Career Path — Local**을 선택하고, 보호된 요청 전에 `access_token`을 채웁니다.



완료되었습니다! 이메일/패스워드 기반 로그인 및 회원가입 시스템을 백엔드와 프론트엔드에 모두 구현했습니다.

## 구현 내용

### 백엔드 (`backend/apps/accounts/`)

1. **Serializers** (`serializers.py`):
   - `EmailSignupRequestSerializer`: 회원가입 요청 (이메일, 비밀번호, 이름, 학년, 이모지)
   - `EmailSignupResponseSerializer`: 회원가입 응답 (토큰 + 사용자 정보)
   - `EmailLoginRequestSerializer`: 로그인 요청 (이메일, 비밀번호)
   - `EmailLoginResponseSerializer`: 로그인 응답 (토큰 + 사용자 정보)

2. **Views** (`views.py`):
   - `email_signup_view`: 회원가입 엔드포인트
     - 이메일 중복 체크
     - 비밀번호 해시화 저장
     - JWT 토큰 발급
   - `email_login_view`: 로그인 엔드포인트
     - 이메일/비밀번호 검증
     - 계정 활성화 상태 확인
     - JWT 토큰 발급

3. **URLs** (`urls.py`):
   - `POST /api/v1/auth/email-signup/`
   - `POST /api/v1/auth/email-login/`

### 프론트엔드 (`frontend/`)

1. **API Client** (`lib/auth/authApi.ts`):
   - `emailSignupApi()`: 회원가입 API 호출
   - `emailLoginApi()`: 로그인 API 호출
   - TypeScript 타입 정의

2. **로그인 페이지** (`app/auth/login/page.tsx`):
   - 로그인/회원가입 토글 UI
   - 이메일, 비밀번호 입력
   - 회원가입 시 이름, 학년, 이모지 선택
   - 에러 처리 및 로딩 상태
   - 성공 시 자동으로 `/career` 페이지로 이동
   - JWT 토큰 자동 저장

3. **API 설정** (`lib/config/api.ts`):
   - 인증 API 경로 추가

### 문서

1. **AUTH_GUIDE.md**: 인증 시스템 전체 가이드
2. **TESTING_GUIDE.md**: 테스트 방법 업데이트
3. **Postman 컬렉션**: 이메일 회원가입/로그인 요청 추가
4. **Postman README**: 인증 섹션 업데이트

### 테스트 계정

백엔드에 테스트 계정이 생성되었습니다:
- **이메일**: `test@example.com`
- **비밀번호**: `password123`

## 사용 방법

### 1. 프론트엔드에서 로그인

```
http://localhost:3000/auth/login
```

1. 테스트 계정으로 로그인하거나
2. 새 계정을 만들어서 회원가입
3. 로그인 성공 시 자동으로 `/career` 페이지로 이동
4. JWT 토큰이 자동으로 저장되어 백엔드 API 호출 가능

### 2. Postman으로 테스트

```json
POST http://127.0.0.1:8000/api/v1/auth/email-login/
{
  "email": "test@example.com",
  "password": "password123"
}
```

응답에서 `access_token`을 받아 다른 API 호출 시 사용

## 주요 기능

- 이메일/패스워드 기반 회원가입
- 이메일/패스워드 로그인
- JWT 토큰 자동 저장 및 관리
- 학년 선택 (초4~고3)
- 프로필 이모지 선택
- 에러 처리 및 사용자 피드백
- 로그인 없이 둘러보기 옵션

모든 기능이 정상적으로 작동하며, 백엔드와 프론트엔드가 완전히 통합되었습니다.