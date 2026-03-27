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

**토큰**

- `POST {{auth_prefix}}/social-login/` — body: `provider`, `code` (소셜 OAuth 코드)
- 응답의 `access_token`을 환경 변수 `access_token`에 저장

**Refresh**

- `POST {{auth_prefix}}/token/refresh/` — body: `refresh_token`

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
| `/api/v1/auth/` | accounts | 소셜 로그인, 토큰 갱신, `me/` |
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

- **Auth** 폴더: 토큰 발급·갱신·`me` (Bearer 없음)
- **Career Path / Career Plan / Community** 폴더: 대표 `GET` 목록 요청 (Bearer `{{access_token}}`)

Import 후 환경 **AI Career Path — Local**을 선택하고, 보호된 요청 전에 `access_token`을 채웁니다.
