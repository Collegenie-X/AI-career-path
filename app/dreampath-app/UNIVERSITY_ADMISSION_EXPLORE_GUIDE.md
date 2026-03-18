# 대입 탐색 (University Admission Explore) 개발 가이드

## 개요
고입 탐색 페이지를 참고하여 대학 입시 탐색 페이지를 제작합니다.
수시·정시·유학 전형별 입학 방법론과 교육기관(24경산 등) 소개 페이지를 포함합니다.

## 탭 구조

### 1. 입학 방법론 (Admission Methods)
- **수시 전형**
  - 학생부종합전형 (학종)
  - 학생부교과전형
  - 논술전형
  - 실기/실적전형
  - SW특기자전형
  - 창업인재전형

- **정시 전형**
  - 가군
  - 나군
  - 다군
  - 라군 (특별전형)

- **유학**
  - 미국 (SAT/ACT, AP, 에세이)
  - 영국/유럽 (A-level, IB, UCAS)
  - 아시아 (EJU, HKDSE, 가오카오)
  - 캐나다/호주 (내신, IELTS)

### 2. 교육기관 (Education Institutions)
- **24경산 (상위 24개 대학)**
  - SKY (서울대, 연세대, 고려대)
  - KAIST, POSTECH, 서울시립대
  - 성균관대, 한양대, 서강대, 이화여대
  - 중앙대, 경희대, 외대, 건국대, 동국대, 홍익대
  - 숙명여대, 숭실대, 세종대, 단국대, 아주대, 인하대, 광운대, 명지대

- **전문대학원**
  - 의학전문대학원
  - 법학전문대학원
  - 경영전문대학원

- **특수대학**
  - 사관학교 (육·해·공군)
  - 경찰대학
  - 과학기술원 (KAIST, GIST, DGIST, UNIST)
  - 한국예술종합학교

- **해외 명문대**
  - 미국 Ivy League + MIT, Stanford
  - 영국 Oxbridge, Imperial, UCL
  - 아시아 NUS, 도쿄대, HKU

### 3. 커리어 패스 템플릿 (Career Path Templates)
- 대학별·학과별 합격 커리어 패스
- 수시·정시·유학 전형별 전략
- 선배 합격 후기

## 데이터 구조

### admission-methods-config.json
```json
{
  "labels": {
    "pageTitle": "대입 탐색",
    "pageSubtitle": "나에게 맞는 대학 입학 방법을 찾아봐요",
    "introBannerTitle": "드림 경험",
    "introBannerDescription": "8개 별 왕국에서 나만의 길을 찾아봐요",
    "categorySelectTitle": "입학 전형 선택",
    "methodCountUnit": "개",
    "methodCountSuffix": "전형",
    "detailView": "자세히 보기",
    "careerPathStart": "커리어 패스 시작하기"
  },
  "categories": [
    {
      "id": "susi",
      "name": "수시",
      "emoji": "📚",
      "color": "#3B82F6",
      "description": "학생부 중심 전형",
      "methodCount": 6
    },
    {
      "id": "jeongsi",
      "name": "정시",
      "emoji": "📝",
      "color": "#EF4444",
      "description": "수능 중심 전형",
      "methodCount": 4
    },
    {
      "id": "abroad",
      "name": "유학",
      "emoji": "✈️",
      "color": "#8B5CF6",
      "description": "해외 대학 진학",
      "methodCount": 4
    }
  ]
}
```

### admission-methods-data.json
```json
[
  {
    "id": "hakjong",
    "categoryId": "susi",
    "name": "학생부종합전형",
    "shortName": "학종",
    "emoji": "📖",
    "color": "#3B82F6",
    "difficulty": 4,
    "preparationYears": "3년",
    "description": "학생부 전체를 종합 평가하는 전형",
    "keyFeatures": [
      "학생부 + 자기소개서 + 면접",
      "비교과 활동 중요",
      "세특(세부능력특기사항) 핵심"
    ],
    "targetStudents": [
      "내신 1~3등급",
      "비교과 활동 우수",
      "진로 일관성 있는 학생"
    ],
    "majorUniversities": [
      "서울대", "연세대", "고려대", "성균관대", "한양대"
    ],
    "preparationTimeline": [
      {
        "grade": "고1",
        "tasks": ["내신 관리 시작", "동아리 활동", "독서 기록"]
      },
      {
        "grade": "고2",
        "tasks": ["심화 탐구 활동", "R&E 참여", "대회 참가"]
      },
      {
        "grade": "고3",
        "tasks": ["자기소개서 작성", "면접 준비", "최종 점검"]
      }
    ]
  }
]
```

### education-institutions-data.json
```json
[
  {
    "id": "snu",
    "name": "서울대학교",
    "shortName": "서울대",
    "emoji": "🏛️",
    "color": "#0066CC",
    "tier": "SKY",
    "category": "24gyeongsan",
    "location": "서울 관악구",
    "founded": 1946,
    "type": "국립",
    "ranking": {
      "domestic": 1,
      "qs": 41
    },
    "admissionInfo": {
      "totalCapacity": 3200,
      "susiRatio": 80,
      "jeongsiRatio": 20,
      "competitionRate": 3.5
    },
    "majorDepartments": [
      {
        "name": "의과대학",
        "capacity": 135,
        "cutline": "99.5%",
        "features": ["최고 수준 의학 교육", "서울대병원 실습"]
      },
      {
        "name": "공과대학",
        "capacity": 800,
        "cutline": "98%",
        "features": ["국내 최고 공학 교육", "다양한 연구실"]
      }
    ],
    "scholarships": [
      "국가장학금",
      "교내 성적 장학금",
      "저소득층 전액 지원"
    ],
    "careerPathTemplates": [
      "tpl-admission-snu-cse-001",
      "tpl-admission-snu-law-001"
    ]
  }
]
```

## 컴포넌트 구조

### UniversityAdmissionExploreScreen.tsx
- 메인 화면
- 탭 네비게이션 (입학 방법론 / 교육기관 / 커리어 패스)
- 카테고리별 필터링

### AdmissionMethodCard.tsx
- 입학 전형 카드 컴포넌트
- 난이도, 준비 기간, 주요 특징 표시

### AdmissionMethodDetailModal.tsx
- 입학 전형 상세 모달
- 준비 타임라인, 대상 학생, 주요 대학 정보

### EducationInstitutionCard.tsx
- 교육기관 카드 컴포넌트
- 순위, 경쟁률, 주요 학과 표시

### EducationInstitutionDetailModal.tsx
- 교육기관 상세 모달
- 학과 정보, 입시 정보, 장학금, 커리어 패스 연결

### CareerPathTemplateCard.tsx
- 커리어 패스 템플릿 카드
- 대학·학과별 합격 전략
- 수시·정시·유학 전형별 구분

### CareerPathDetailModal.tsx
- 커리어 패스 상세 모달
- 선배 합격 후기
- 학년별 준비 항목

## 참고 문서
- `/documents/대학입시제도/` - 대학 입시 제도 총정리
- `/documents/실전예시/` - 실전 예시 및 커리어 패스
- `/app/dreampath-app/src/data/career-path-templates-admission.json` - 기존 커리어 패스 템플릿

## 개발 순서
1. ✅ labels.ts에 UNIVERSITY_ADMISSION_EXPLORE_LABELS 추가
2. ✅ admission-methods-config.json 생성
3. ✅ admission-methods-data.json 생성
4. ✅ education-institutions-data.json 생성
5. ✅ AdmissionMethodCard.tsx 생성
6. ✅ AdmissionMethodDetailModal.tsx 생성
7. ✅ EducationInstitutionCard.tsx 생성
8. ✅ EducationInstitutionDetailModal.tsx 생성
9. ✅ CareerPathTemplateCard.tsx 생성
10. ✅ CareerPathDetailModal.tsx 생성
11. ✅ UniversityAdmissionExploreScreen.tsx 생성
12. ✅ MainTabNavigator.tsx에 새 탭 추가
13. ✅ TabBar.tsx에 아이콘 추가
