# 8개 별(Star) JSON 구조

각 별마다 15개 이상의 직업을 포함하며, 직업 프로세스 중심으로 구성되어 있습니다.

## 파일 구조

```
stars/
├── explore-star.json      # 🔬 탐구의 별 (15개 직업)
├── create-star.json       # 🎨 창작의 별 (15개 직업)
├── tech-star.json         # 💻 기술의 별 (15개 직업)
├── nature-star.json       # 🌱 자연의 별 (15개 직업)
├── connect-star.json      # 🤝 연결의 별 (15개 직업)
├── order-star.json        # ⚖️ 질서의 별 (15개 직업)
├── communicate-star.json  # 📡 소통의 별 (15개 직업)
└── challenge-star.json    # 🚀 도전의 별 (15개 직업)
```

## 직업 데이터 구조

각 직업은 다음 정보를 포함합니다:

### 기본 정보
- `id`, `name`, `icon`, `holland` (Holland 유형)
- `description`: 직업 설명
- `salaryRange`: 연봉 범위
- `aiRisk`: AI 대체 위험도
- `futureGrowth`: 미래 성장성 (1~5)
- `admissionPath`: 대입 경로
- `entryProcess`: 입직 프로세스

### 핵심 역량
- `coreCompetencies`: 필요한 핵심 역량 배열

### 직업 프로세스 (workProcess)
직업을 하나의 프로젝트로 보고, 단계별 프로세스를 정의:
- `phase`: 단계명
- `title`: 단계 제목
- `description`: 상세 설명
- `duration`: 소요 시간
- `tools`: 사용 도구
- `skills`: 필요 스킬

### 커리어 패스 (careerPath)
초등·중등·고등 단계별 로드맵:
- `activities`: 핵심 활동
- `awards`: 수상 경력
- `subjects`: 선택 과목 (고등)
- `setak`: 세특 예시 (고등)
- `cost`: 예상 비용
- `achievement`: 달성 목표

### 성공 지표 (successMetrics)
각 학교급별 구체적 성과 지표

## 사용 예시

```typescript
import exploreStar from '@/data/stars/explore-star.json';

// 별 정보
const star = exploreStar;
console.log(star.name); // "탐구의 별"

// 직업 목록
const jobs = star.jobs;

// 특정 직업의 프로세스
const doctor = jobs.find(j => j.id === 'doctor');
const workProcess = doctor.workProcess;
// [진단 → 치료 계획 → 치료 실행 → 경과 관찰 → 환자 교육]
```

## 직업 프로세스 시각화

각 직업의 `workProcess`는 다음과 같이 시각화됩니다:

1. **진단** (30분~1시간)
   - 도구: 청진기, 혈압계, EMR
   - 스킬: 관찰력, 분석력

2. **치료 계획** (15~30분)
   - 도구: 진료 가이드라인
   - 스킬: 의학 지식, 판단력

3. **치료 실행** (10분~수시간)
   - 도구: 수술 도구, 처방전
   - 스킬: 기술력, 집중력

...

## 커리어 패스 예시

### 의사 (doctor)

**초등 (씨앗 심기)**
- 활동: 과학 실험 키트, 인체 도감, 병원 견학
- 비용: 5만원
- 목표: 과학 호기심 형성

**중등 (싹 틔우기)**
- 활동: 생물·화학 심화, 과학 동아리, 봉사 시작
- 수상: 과학경시 참가
- 비용: 10만원
- 목표: 기초 과학 역량

**고등 (열매 맺기)**
- 활동: 생명과학Ⅱ·화학Ⅱ 1등급, 의료 봉사 120시간, R&E
- 수상: KBO(생물올림피아드) 수상
- 과목: 생명과학Ⅱ, 화학Ⅱ, 보건, 심리학
- 세특: "지역사회 건강 불평등 데이터 분석"
- 비용: 30만원
- 목표: 의대 학종 합격

## 데이터 확장 계획

현재 3개 직업만 샘플로 작성되어 있으며, 각 별마다 15개씩 총 120개 직업으로 확장 예정입니다.
