린트 에러 없이 깔끔하게 완료됐습니다. 최종 구조입니다.

---

## 완료된 작업

### 파일 구조 (기존 2개 → 17개로 분리)

```
frontend/data/dreammate/
├── config/               ← 설정값 (UI 동작 관련)
│   ├── colors.json       — 색상 팔레트
│   ├── itemTypes.json    — 수상·활동·프로젝트·논문 타입 정의
│   ├── autocomplete.json — 자동완성 템플릿 (제목·설명·항목·주간)
│   ├── filters.json      — 기간 필터 + 자료실 카테고리
│   ├── tabs.json         — 탭 목록
│   ├── space.json        — 스페이스 공개 옵션·모집 상태·프로그램 타입·참여 플로우
│   └── report.json       — 신고 사유 목록
│
├── content/              ← UI 텍스트 (라벨·메시지·placeholder)
│   ├── common.json       — 공통 버튼·액션 레이블
│   ├── feed.json         — 피드 탭
│   ├── library.json      — 자료실 탭
│   ├── space.json        — 스페이스 탭
│   ├── my.json           — 내 기록 탭
│   ├── roadmap.json      — 로드맵 카드·공유·신고·댓글
│   └── editor.json       — WBS 에디터·스프린트
│
└── seed/                 ← 샘플 데이터
    ├── roadmaps.json     — 실행계획 6개 (과학고·외고·KMO·세특·예술고·SW)
    ├── resources.json    — 자료실 8개
    └── spaces.json       — 스페이스 4개
```

### seed 데이터 내용
- **과학고 입시** — 탐구대회·보고서·면접 6주 방학 WBS (주차별 goal + task 상세)
- **외고·국제고** — 영어 말하기·토론 동아리·글로벌 탐구 프로젝트 학기중 WBS
- **KMO 수학올림피아드** — 수론·조합·기하·기출 8주 방과후 WBS
- **대입 세특 관리** — 과학·수학·영어 교과 연계 탐구 학기중 WBS
- **예술고 포트폴리오** — 드로잉·채색·편집·실기 8주 방학 WBS
- **SW 특기자(KOI)** — 알고리즘·앱 개발·멘토링 6주 방학 WBS