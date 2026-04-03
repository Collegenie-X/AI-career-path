# Career Plan (DreamMate) App

**커리어 실행 (DreamMate)** 앱입니다.

설계 문서: `documents/backend/커리어실행_DreamMate_Django_DB_설계서.md`

---

## 개요

이 앱은 **단기 실행 계획 (로드맵)**을 관리하고, **드림 라이브러리 (자료)**와 **드림 스페이스 (그룹 프로그램)**를 제공합니다.

### 주요 기능

1. **로드맵 (Roadmap)**
   - 방과후·방학·학기 단위 실행 계획
   - 활동·수상·프로젝트·논문 관리
   - 주차별 TODO 관리
   - 마일스톤 기록

2. **드림 라이브러리 (Dream Resource)**
   - 포트폴리오·가이드·템플릿 공유
   - 파일 업로드 (S3)
   - 좋아요·북마크·다운로드

3. **드림 스페이스 (Dream Space)**
   - 그룹 내 프로그램 운영
   - 수업형·프로젝트형·멘토링형
   - 참여자 모집·승인·진행 체크

4. **공유 로드맵 (Shared Roadmap)**
   - 로드맵 커뮤니티 공유
   - 전체 공유·그룹 공유
   - 좋아요·북마크·조회·댓글·**신고** (`career_path.SharedPlan`과 동일한 통계 필드 패턴)
   - DB 제약: **로드맵(`Roadmap`)당 `SharedDreamRoadmap` 1행** (중복 공유 행 마이그레이션 시 병합)

---

## 모델 구조

### 1. Roadmap (로드맵)

```
Roadmap (로드맵)
├── RoadmapItem (활동)
│   └── RoadmapTodo (주차별 TODO)
└── RoadmapMilestone (마일스톤)
```

#### Roadmap

- `user`: 소유자
- `title`: 로드맵 제목
- `description`: 로드맵 설명
- `period`: 실행 기간 (방과후·방학·학기)
- `star_color`: 적성 색상
- `focus_item_types`: 집중 활동 유형 (JSON 배열)
- `final_result_*`: 최종 결과물 정보

#### RoadmapItem

- `roadmap`: 소속 로드맵
- `type`: 활동 유형 (활동·수상·프로젝트·논문)
- `title`: 활동 제목
- `months`: 실행 월 (JSON 배열)
- `difficulty`: 난이도 (1-5)
- `target_output`: 목표 산출물
- `success_criteria`: 성공 기준

#### RoadmapTodo

- `roadmap_item`: 소속 활동
- `week_label`: 주차 라벨
- `week_number`: 주차 번호
- `entry_type`: 항목 유형 (goal·task)
- `title`: TODO 제목
- `is_done`: 완료 여부
- `note`: 메모
- `output_ref`: 산출물 참조

#### RoadmapMilestone

- `roadmap`: 소속 로드맵
- `title`: 마일스톤 제목
- `description`: 마일스톤 설명
- `month_week_label`: 월·주차 라벨
- `time_log`: 투입 시간
- `result_url`: 결과물 URL
- `image_url`: 이미지 URL
- `recorded_at`: 기록 일시

### 2. DreamResource (드림 자료)

```
DreamResource (드림 자료)
└── ResourceSection (섹션)
```

#### DreamResource

- `user`: 작성자
- `type`: 자료 유형 (포트폴리오·가이드·템플릿)
- `title`: 자료 제목
- `description`: 자료 설명
- `file_url`: 파일 URL
- `thumbnail_url`: 썸네일 URL
- `tags`: 태그 (JSON 배열)
- `like_count`, `bookmark_count`, `download_count`, `view_count`, `comment_count`: 통계
- `share_type`: 공유 유형 (비공개·전체·그룹)
- `is_hidden`: 숨김 여부

#### ResourceSection

- `resource`: 소속 자료
- `title`: 섹션 제목
- `content`: 섹션 내용
- `sort_order`: 정렬 순서

### 3. DreamSpace (드림 스페이스)

```
DreamSpace (드림 스페이스)
└── SpaceParticipant (참여자)
```

#### DreamSpace

- `group`: 소속 그룹 (from `apps.community`)
- `title`: 프로그램 제목
- `description`: 프로그램 설명
- `program_type`: 프로그램 유형 (수업형·프로젝트형·멘토링형)
- `recruitment_status`: 모집 상태 (모집중·모집마감)
- `max_participants`: 최대 참여자 수
- `current_participants`: 현재 참여자 수
- `start_date`, `end_date`: 일정

#### SpaceParticipant

- `space`: 소속 스페이스
- `user`: 참여자
- `status`: 참여 상태 (신청·승인·참여 확정·진행 체크)
- `applied_at`, `approved_at`, `confirmed_at`: 타임스탬프

### 4. SharedRoadmap (공유 로드맵)

```
SharedRoadmap (공유 로드맵)
└── SharedRoadmapGroup (그룹 연결)
```

#### SharedRoadmap (`SharedDreamRoadmap`)

- `roadmap`: 원본 로드맵 (**FK 유일 제약 — 로드맵당 공유 설정 1건**)
- `user`: 공유자
- `share_type`: 공유 유형 (비공개·전체·그룹)
- `description`: 공유 설명
- `tags`: 태그 (JSON 배열)
- `like_count`, `bookmark_count`, `view_count`, `comment_count`, `report_count`: 통계 (비정규화)
- `shared_at`: 공유 일시
- `is_hidden`: 숨김 여부

#### SharedRoadmapGroup

- `shared_roadmap`: 공유 로드맵
- `group`: 그룹 (M:N 연결)

---

## API 엔드포인트

### Roadmap

- `GET /api/career-plan/roadmaps/` - 로드맵 목록
- `POST /api/career-plan/roadmaps/` - 로드맵 생성
- `GET /api/career-plan/roadmaps/{id}/` - 로드맵 상세
- `PATCH /api/career-plan/roadmaps/{id}/` - 로드맵 수정
- `DELETE /api/career-plan/roadmaps/{id}/` - 로드맵 삭제
- `POST /api/career-plan/roadmaps/{id}/add_item/` - 활동 추가
- `POST /api/career-plan/roadmaps/{id}/add_milestone/` - 마일스톤 추가

### RoadmapItem

- `GET /api/career-plan/roadmap-items/` - 활동 목록
- `POST /api/career-plan/roadmap-items/` - 활동 생성
- `GET /api/career-plan/roadmap-items/{id}/` - 활동 상세
- `PATCH /api/career-plan/roadmap-items/{id}/` - 활동 수정
- `DELETE /api/career-plan/roadmap-items/{id}/` - 활동 삭제
- `POST /api/career-plan/roadmap-items/{id}/add_todo/` - TODO 추가
- `POST /api/career-plan/roadmap-items/{id}/reorder_todos/` - TODO 순서 재정렬

### RoadmapTodo

- `GET /api/career-plan/roadmap-todos/` - TODO 목록
- `POST /api/career-plan/roadmap-todos/` - TODO 생성
- `GET /api/career-plan/roadmap-todos/{id}/` - TODO 상세
- `PATCH /api/career-plan/roadmap-todos/{id}/` - TODO 수정
- `DELETE /api/career-plan/roadmap-todos/{id}/` - TODO 삭제
- `POST /api/career-plan/roadmap-todos/{id}/toggle_done/` - TODO 완료 토글

### RoadmapMilestone

- `GET /api/career-plan/roadmap-milestones/` - 마일스톤 목록
- `POST /api/career-plan/roadmap-milestones/` - 마일스톤 생성
- `GET /api/career-plan/roadmap-milestones/{id}/` - 마일스톤 상세
- `PATCH /api/career-plan/roadmap-milestones/{id}/` - 마일스톤 수정
- `DELETE /api/career-plan/roadmap-milestones/{id}/` - 마일스톤 삭제

### DreamResource

- `GET /api/career-plan/dream-resources/` - 자료 목록
- `POST /api/career-plan/dream-resources/` - 자료 생성
- `GET /api/career-plan/dream-resources/{id}/` - 자료 상세
- `PATCH /api/career-plan/dream-resources/{id}/` - 자료 수정
- `DELETE /api/career-plan/dream-resources/{id}/` - 자료 삭제
- `POST /api/career-plan/dream-resources/{id}/add_section/` - 섹션 추가
- `POST /api/career-plan/dream-resources/{id}/like/` - 좋아요
- `POST /api/career-plan/dream-resources/{id}/bookmark/` - 북마크
- `POST /api/career-plan/dream-resources/{id}/download/` - 다운로드 (카운트 증가)
- `POST /api/career-plan/dream-resources/{id}/view/` - 조회 (카운트 증가)

### ResourceSection

- `GET /api/career-plan/resource-sections/` - 섹션 목록
- `POST /api/career-plan/resource-sections/` - 섹션 생성
- `GET /api/career-plan/resource-sections/{id}/` - 섹션 상세
- `PATCH /api/career-plan/resource-sections/{id}/` - 섹션 수정
- `DELETE /api/career-plan/resource-sections/{id}/` - 섹션 삭제

### DreamSpace

- `GET /api/career-plan/dream-spaces/` - 스페이스 목록
- `POST /api/career-plan/dream-spaces/` - 스페이스 생성
- `GET /api/career-plan/dream-spaces/{id}/` - 스페이스 상세
- `PATCH /api/career-plan/dream-spaces/{id}/` - 스페이스 수정
- `DELETE /api/career-plan/dream-spaces/{id}/` - 스페이스 삭제
- `POST /api/career-plan/dream-spaces/{id}/apply/` - 참여 신청
- `POST /api/career-plan/dream-spaces/{id}/approve_participant/` - 참여자 승인
- `POST /api/career-plan/dream-spaces/{id}/confirm_participant/` - 참여 확정

### SpaceParticipant

- `GET /api/career-plan/space-participants/` - 참여자 목록 (읽기 전용)
- `GET /api/career-plan/space-participants/{id}/` - 참여자 상세

### SharedDreamRoadmap

- `GET /api/career-plan/shared-dream-roadmaps/` - 공유 드림 로드맵 목록
- `POST /api/career-plan/shared-dream-roadmaps/` - 공유 드림 로드맵 생성
- `GET /api/career-plan/shared-dream-roadmaps/{id}/` - 공유 드림 로드맵 상세
- `PATCH /api/career-plan/shared-dream-roadmaps/{id}/` - 공유 드림 로드맵 수정
- `DELETE /api/career-plan/shared-dream-roadmaps/{id}/` - 공유 드림 로드맵 삭제
- `POST /api/career-plan/shared-dream-roadmaps/{id}/like/` - 좋아요
- `POST /api/career-plan/shared-dream-roadmaps/{id}/bookmark/` - 북마크
- `POST /api/career-plan/shared-dream-roadmaps/{id}/view/` - 조회 (카운트 증가)

---

## 사용 예시

### 1. 로드맵 생성 (전체 중첩 구조)

```json
POST /api/career-plan/roadmaps/

{
  "title": "여름방학 프로젝트 로드맵",
  "description": "AI 챗봇 개발 프로젝트",
  "period": "vacation",
  "star_color": "#6C5CE7",
  "focus_item_types": ["project", "paper"],
  "items": [
    {
      "type": "project",
      "title": "AI 챗봇 개발",
      "months": [7, 8],
      "difficulty": 4,
      "target_output": "실제 동작하는 챗봇 웹앱",
      "success_criteria": "사용자 만족도 80% 이상",
      "sort_order": 0,
      "todos": [
        {
          "week_label": "1주차",
          "week_number": 1,
          "entry_type": "goal",
          "title": "요구사항 분석 완료",
          "sort_order": 0
        },
        {
          "week_label": "1주차",
          "week_number": 1,
          "entry_type": "task",
          "title": "사용자 인터뷰 5명",
          "sort_order": 1
        }
      ]
    }
  ],
  "milestones": [
    {
      "title": "프로토타입 완성",
      "description": "기본 기능 구현 완료",
      "month_week_label": "7월 2주차",
      "time_log": "40시간",
      "sort_order": 0
    }
  ]
}
```

### 2. TODO 완료 토글

```json
POST /api/career-plan/roadmap-todos/{id}/toggle_done/

Response:
{
  "id": "uuid",
  "title": "사용자 인터뷰 5명",
  "is_done": true,
  ...
}
```

### 3. 드림 자료 생성

```json
POST /api/career-plan/dream-resources/

{
  "type": "portfolio",
  "title": "AI 챗봇 포트폴리오",
  "description": "여름방학 프로젝트 결과물",
  "file_url": "https://s3.amazonaws.com/...",
  "thumbnail_url": "https://s3.amazonaws.com/...",
  "tags": ["AI", "챗봇", "Python"],
  "share_type": "public",
  "sections": [
    {
      "title": "프로젝트 개요",
      "content": "...",
      "sort_order": 0
    },
    {
      "title": "기술 스택",
      "content": "...",
      "sort_order": 1
    }
  ]
}
```

### 4. 드림 스페이스 참여 신청

```json
POST /api/career-plan/dream-spaces/{id}/apply/

Response:
{
  "id": "uuid",
  "user": "user-uuid",
  "user_name": "홍길동",
  "status": "applied",
  "applied_at": "2026-03-27T10:00:00Z"
}
```

### 5. 로드맵 공유

```json
POST /api/career-plan/shared-dream-roadmaps/

{
  "roadmap": "roadmap-uuid",
  "share_type": "space",
  "description": "여름방학 프로젝트 공유합니다",
  "tags": ["AI", "프로젝트"],
  "group_ids": ["group-uuid-1", "group-uuid-2"]
}
```

---

## 권한 관리

### 기본 권한

- 모든 API는 `IsAuthenticated` 필요
- 본인이 생성한 데이터만 수정·삭제 가능

### 공유 자료 접근

- **DreamResource**: 본인 자료 + 공개 자료 조회 가능
- **SharedRoadmap**: 본인 공유 + 전체 공유 조회 가능
- **DreamSpace**: 본인이 속한 그룹의 스페이스만 조회 가능

---

## 성능 최적화

### 쿼리 최적화

- `select_related()`: `user`, `roadmap`, `group` 등 ForeignKey
- `prefetch_related()`: `items`, `todos`, `milestones`, `sections`, `participants` 등 역참조

### 인덱스

- 사용자별 조회: `(user, -created_at)`
- 기간별 조회: `(period)`
- 유형별 조회: `(type)`, `(program_type)`, `(share_type)`
- 통계 정렬: `(-like_count)`, `(-view_count)`
- 완료 상태: `(is_done)`
- 주차별 조회: `(week_number)`

---

## 마이그레이션

### 초기 마이그레이션

```bash
# 가상환경 활성화
source venv/bin/activate

# 마이그레이션 생성
python3 manage.py makemigrations career_plan

# 마이그레이션 적용
python3 manage.py migrate career_plan
```

### 주의사항

- `Group` 모델은 `apps.community`에서 import하여 사용
- `JSONField`는 SQLite와 PostgreSQL 모두 호환
- `ArrayField` 대신 `JSONField` 사용 (로컬 개발 SQLite 호환)

---

## 다음 단계

1. **Comment 모델 추가** - 공유 자료·로드맵에 댓글 기능
2. **Reaction 모델 추가** - 좋아요·북마크 기능 구현
3. **Report 모델 추가** - 신고 기능
4. **Notification 모델 추가** - 알림 기능
5. **파일 업로드** - S3 연동
6. **검색 기능** - Elasticsearch 연동
7. **캐싱** - Redis 연동
8. **테스트 코드** - pytest 작성

---

## 참고

- 설계 문서: `documents/backend/커리어실행_DreamMate_Django_DB_설계서.md`
- 프론트·백 통합 요약: `backend/apps/career_plan/INTEGRATION.md`
- Career Path 앱: `backend/apps/career_path/` (공유·통계 패턴 참조)
- Community 앱: `backend/apps/community/`
