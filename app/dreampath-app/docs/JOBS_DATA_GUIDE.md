# 직업 데이터 관리 가이드

## 📁 파일 구조

```
src/
├── data/
│   ├── stars/                          # 8개 별 JSON 파일
│   │   ├── explore-star.json          # 탐구의 별 (의사, AI 연구원, 약사)
│   │   ├── create-star.json           # 창작의 별 (UX 디자이너, 웹툰 작가, 건축가, 영화감독)
│   │   ├── tech-star.json             # 기술의 별 (풀스택 개발자, 게임 개발자, 보안 전문가)
│   │   ├── connect-star.json          # 연결의 별 (교사, 사회복지사, 마케터)
│   │   ├── nature-star.json           # 자연의 별 (환경과학자, 수의사, 해양생물학자)
│   │   ├── order-star.json            # 질서의 별 (변호사, 회계사, 형사)
│   │   ├── communicate-star.json      # 소통의 별 (기자, PD, 아나운서)
│   │   ├── challenge-star.json        # 도전의 별 (창업가, 운동선수, 우주 엔지니어)
│   │   └── index.ts                   # 중앙 집중식 export
│   ├── daily-schedules.json           # 25개 직업별 일과 데이터
│   ├── jobs-explore-config.json       # UI 라벨 및 설정
│   └── jobs-metadata.json             # 직업 메타데이터 및 검증 규칙
└── lib/
    └── jobsManager.ts                 # 직업 데이터 관리 유틸리티
```

---

## 🌟 별(Star) 데이터 구조

### 필수 필드

```json
{
  "id": "explore",
  "name": "탐구의 별",
  "emoji": "🔬",
  "color": "#4A90D9",
  "bgColor": "#1a2744",
  "description": "진실을 밝히고 분석하는 탐구형 직업의 세계",
  "riasecTypes": ["I"],
  "jobCount": 3,
  "jobs": []
}
```

### 선택 필드: starProfile

```json
{
  "starProfile": {
    "tagline": "왜? 라는 질문을 멈추지 않는 사람들의 별",
    "coreTraits": [
      { "icon": "🔍", "label": "분석력", "desc": "현상의 원인을 파고드는 깊은 탐구 능력" }
    ],
    "fitPersonality": {
      "title": "이런 사람에게 딱 맞아요",
      "traits": ["왜 그럴까? 라는 질문을 자주 하는 사람"],
      "notFit": ["빠른 결과와 즉각적인 성과를 원하는 사람"]
    },
    "whyThisGroup": {
      "title": "왜 이 직업들을 묶었나요?",
      "reason": "의사·AI 연구원·약사는 모두 '탐구형(I)' RIASEC 코드를 공유합니다...",
      "commonDNA": ["과학적 지식 기반", "가설-검증 사고", "데이터 중심 판단"]
    },
    "hollandCode": "I (탐구형)",
    "keySubjects": ["생명과학", "화학", "수학", "물리학"],
    "careerKeyword": "#분석 #연구 #전문직 #과학 #데이터",
    "difficultyLevel": 5,
    "avgPreparationYears": 9
  }
}
```

---

## 💼 직업(Job) 데이터 구조

### 필수 필드

```json
{
  "id": "doctor",
  "name": "의사",
  "icon": "🩺",
  "shortDesc": "생명을 살리는 사람",
  "holland": "I+S",
  "salaryRange": "6,000~20,000만원/년",
  "futureGrowth": 5,
  "aiRisk": "낮음"
}
```

### 선택 필드

#### 1. 기본 정보
```json
{
  "description": "환자를 진단하고 치료하며 생명을 살리는 의료 전문가",
  "admissionPath": "학종+정시",
  "entryProcess": "의과대학 6년 → 인턴 1년 → 레지던트 4년 → 전문의",
  "coreCompetencies": ["과학적 사고력", "공감 능력", "체력/인내력"]
}
```

#### 2. 직무 프로세스 (workProcess)
```json
{
  "workProcess": {
    "title": "의사의 진료 프로세스",
    "description": "환자 진료부터 치료까지의 전체 과정",
    "phases": [
      {
        "id": 1,
        "phase": "진단",
        "icon": "🔍",
        "title": "환자 상태 파악",
        "description": "문진, 신체 검사, 검사 결과 분석을 통해 질병을 진단합니다",
        "duration": "30분~1시간",
        "tools": ["청진기", "혈압계", "검사 장비"],
        "skills": ["관찰력", "분석력", "의학 지식"],
        "example": "환자가 복통을 호소하면..."
      }
    ]
  }
}
```

#### 3. 커리어 패스 (careerTimeline)
```json
{
  "careerTimeline": {
    "title": "의사가 되는 커리어 패스",
    "totalYears": "초4 ~ 고3 (9년)",
    "totalCost": "약 90만원",
    "milestones": [
      {
        "period": "초4",
        "semester": "1학기",
        "icon": "🌱",
        "title": "과학 호기심 싹트기",
        "activities": ["과학 실험 키트로 놀기", "인체 도감 읽기"],
        "cost": "3만원",
        "achievement": "과학이 재미있다는 걸 알게 됨",
        "awards": [],
        "subjects": [],
        "setak": ""
      }
    ],
    "keySuccess": [
      "내신 1.2등급 (생명과학·화학 1등급)",
      "KBO(생물올림피아드) 은상"
    ]
  }
}
```

#### 4. 일과 (dailySchedule)
```json
{
  "dailySchedule": {
    "title": "의사의 하루",
    "basis": "대학병원 내과 전문의 기준",
    "schedule": [
      {
        "time": "08:00",
        "activity": "회진",
        "detail": "입원 환자 상태 확인 및 치료 계획 수립",
        "icon": "🏥",
        "type": "work"
      }
    ]
  }
}
```

#### 5. 입시 전략 (admissionStrategy)
```json
{
  "admissionStrategy": {
    "title": "의대 학종 합격 전략",
    "factors": [
      {
        "name": "학업역량",
        "importance": 5,
        "detail": "생명과학·화학·수학 1등급, 전체 1~2등급",
        "tip": "의대는 내신이 가장 중요합니다"
      }
    ]
  }
}
```

---

## 🔧 JobsManager 사용법

### 기본 사용

```typescript
import JobsManager from '@/lib/jobsManager';

// 모든 별 가져오기
const allStars = JobsManager.getAllStars();

// 특정 별 가져오기
const exploreStar = JobsManager.getStarById('explore');

// 별 순서대로 정렬
const orderedStars = JobsManager.getStarsInOrder();

// 모든 직업 가져오기
const allJobs = JobsManager.getAllJobs();

// 특정 직업 가져오기
const doctorData = JobsManager.getJobById('doctor');
// { job: StarJob, star: StarData }

// 특정 별의 모든 직업
const exploreJobs = JobsManager.getJobsByStarId('explore');
```

### RIASEC 기반 추천

```typescript
// RIASEC 타입으로 별 추천
const recommendedStars = JobsManager.getStarsByRiasecTypes(['I', 'S']);

// RIASEC 타입으로 직업 추천 (점수 포함)
const recommendedJobs = JobsManager.getJobsByRiasecTypes(['I', 'S']);
// [{ job: StarJob, star: StarData, score: number }]
```

### 통계 및 분석

```typescript
// 전체 통계
const stats = JobsManager.getStatistics();
// {
//   totalStars: 8,
//   totalJobs: 25,
//   averageJobsPerStar: 3.125,
//   starsWithProfile: 7,
//   jobsWithTimeline: 25,
//   jobsWithDailySchedule: 25
// }

// 난이도별 직업 수
const byDifficulty = JobsManager.getJobCountByDifficulty();
// { 1: 0, 2: 0, 3: 9, 4: 7, 5: 9 }

// 준비 기간별 직업 수
const byYears = JobsManager.getJobCountByPreparationYears();
// { 4: 3, 6: 3, 7: 10, 9: 6, 12: 3 }
```

### 검색 및 필터링

```typescript
import { JobsSearch } from '@/lib/jobsManager';

// 키워드 검색
const results = JobsSearch.searchJobs('의사');
// [{ job: StarJob, star: StarData, matchScore: number }]

// 연봉 필터링 (최소 5000만원)
const highSalaryJobs = JobsSearch.filterBySalaryRange(5000);

// 성장성 필터링 (최소 4점)
const highGrowthJobs = JobsSearch.filterByFutureGrowth(4);
```

### 데이터 검증

```typescript
const newJob = {
  id: 'new-job',
  name: '새 직업',
  icon: '🎯',
  shortDesc: '설명',
  holland: 'I+S',
  salaryRange: '5,000만원/년',
  futureGrowth: 5,
  aiRisk: '낮음',
};

const validation = JobsManager.validateJob(newJob);
if (!validation.valid) {
  console.error('검증 실패:', validation.errors);
}
```

---

## 📝 새 직업 추가하기

### 1단계: 별 선택
해당 직업이 속할 별을 선택합니다 (RIASEC 코드 기준).

### 2단계: 직업 데이터 작성
`src/data/stars/{star-id}.json` 파일의 `jobs` 배열에 추가:

```json
{
  "id": "new-job-id",
  "name": "새 직업",
  "icon": "🎯",
  "holland": "I+S",
  "description": "상세 설명",
  "shortDesc": "짧은 설명",
  "salaryRange": "5,000~10,000만원/년",
  "aiRisk": "낮음",
  "futureGrowth": 4,
  "admissionPath": "학종+정시",
  "entryProcess": "대학 4년 → 취업",
  "coreCompetencies": ["역량1", "역량2"],
  "workProcess": { ... },
  "careerTimeline": { ... },
  "admissionStrategy": { ... }
}
```

### 3단계: 일과 데이터 추가 (선택)
`src/data/daily-schedules.json`에 추가:

```json
{
  "new-job-id": {
    "title": "새 직업의 하루",
    "basis": "일반적인 근무 기준",
    "schedule": [...]
  }
}
```

### 4단계: 메타데이터 업데이트
`src/data/jobs-metadata.json`의 `jobsByStarId` 업데이트:

```json
{
  "jobsByStarId": {
    "explore": ["doctor", "ai-researcher", "pharmacist", "new-job-id"]
  }
}
```

### 5단계: 검증
```typescript
const validation = JobsManager.validateJob(newJobData);
console.log(validation);
```

---

## 🎨 UI 라벨 수정하기

`src/data/jobs-explore-config.json` 파일에서 모든 UI 텍스트를 수정할 수 있습니다:

```json
{
  "labels": {
    "pageTitle": "Job 간접 경험",
    "starSelectTitle": "8개 별 선택",
    ...
  }
}
```

수정 후 앱을 재시작하면 자동으로 반영됩니다.

---

## ✅ 데이터 검증 규칙

### Holland 코드
- 형식: `[RIASEC]` 또는 `[RIASEC]+[RIASEC]`
- 예시: `"I"`, `"I+S"`, `"R+I"`

### futureGrowth
- 범위: 1~5
- 1: 매우 낮음, 5: 매우 높음

### aiRisk
- 값: `"매우 낮음"`, `"낮음"`, `"중간"`, `"높음"`, `"매우 높음"`

### difficultyLevel
- 범위: 1~5
- 1: 매우 쉬움, 5: 매우 어려움

---

## 🔄 데이터 동기화

프론트엔드 `/frontend/data/stars/`와 앱 `/app/dreampath-app/src/data/stars/`의 데이터를 동기화하려면:

```bash
# 프론트엔드 → 앱
cp frontend/data/stars/*.json app/dreampath-app/src/data/stars/
cp frontend/data/daily-schedules.json app/dreampath-app/src/data/
```

---

## 📊 데이터 현황

- **총 별 수**: 8개
- **총 직업 수**: 25개
- **평균 직업/별**: 3.125개
- **starProfile 있는 별**: 7개
- **careerTimeline 있는 직업**: 25개
- **dailySchedule 있는 직업**: 25개

---

## 🚀 다음 단계

1. **직업 추가**: 각 별당 최소 3~5개 직업 목표
2. **데이터 보강**: workProcess, careerTimeline 상세화
3. **검색 기능**: 키워드, 필터링 UI 구현
4. **추천 알고리즘**: RIASEC 기반 정교화
5. **백엔드 연동**: JSON → API 전환 준비
