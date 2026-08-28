// ─── Types ───────────────────────────────────────────────

import type { StarProfileTree, StarProfileLegacy } from '@/data/stars/schema';

/** 트리 구조 또는 레거시 flat 구조 (normalizeStarProfile로 통일) */
export type StarProfile = StarProfileTree | StarProfileLegacy;

export type StarData = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  bgColor: string;
  jobCount: number;
  jobs: Job[];
  starProfile?: StarProfile;
};

export type OrganizationLevel = {
  level: number;
  title: string;
  icon: string;
  yearsRange: string;
  /** 서술형: 이 직급에서 맡는 일·책임 범위 (커리어 경로 카드와 유사한 톤) */
  roleNarrative: string;
  /** 서술형: 이 단계에서 요구되는 역량·습관 */
  competencyNarrative: string;
  /** 레거시 JSON 호환: narrative 없을 때만 칩으로 표시 */
  roles?: string[];
  requiredSkills?: string[];
  avgSalary?: string;
};

export type CareerPath = {
  path: string;
  description: string;
};

export type OrganizationStructure = {
  title: string;
  description: string;
  levels: OrganizationLevel[];
  promotionCriteria: string[];
  careerPaths: CareerPath[];
};

/** JSON에 직접 넣을 때: 단계별 협업 (없으면 기본 템플릿으로 생성) */
export type AiCollaborationPlaybookStep = {
  stepTitle: string;
  humanRole: string;
  aiRole: string;
  scenarioExample: string;
  recommendedTools: string[];
};

export type AiTransformation = {
  beforeAI: string;
  afterAI: string;
  replacementRisk: 'low' | 'medium' | 'high';
  aiTools: string[];
  survivalStrategy: string[];
  /** 1~5: AI 대체 압력 (높을수록 루틴 자동화 압력). 미입력 시 replacementRisk 로 추정 */
  replacementPressure5?: 1 | 2 | 3 | 4 | 5;
  /** 1~5: AI 협업 설계·검증 역량 요구. 미입력 시 replacementRisk 로 추정 */
  aiCollaborationRequired5?: 1 | 2 | 3 | 4 | 5;
  /** 직업별 커스텀 협업 플레이북 (없으면 공통 4단계 템플릿 + job 이름·aiTools 조합) */
  collaborationPlaybook?: AiCollaborationPlaybookStep[];
};

/** 프로젝트 기반 실행 트랙 — 커리어 패스에서 방향을 찾은 뒤 직접 굴리는 3단계 프로젝트 */
export type JobProject = {
  /** 입문 / 심화 / 창직 */
  level: string;
  /** 예: '중1~중3 · 프로젝트 1' */
  stage: string;
  icon: string;
  title: string;
  /** 이 프로젝트로 무엇을 얻는가 (한 문장) */
  mission: string;
  steps: string[];
  aiStack: string[];
  deliverable: string;
  /** 완료 판정 기준 (숫자로 확인 가능한 것) */
  proof: string;
  /** 생기부·포트폴리오·창직 명함으로의 연결 */
  record: string;
  duration: string;
  cost: string;
};

export type JobProjectTrack = {
  title: string;
  why: string;
  /** 이 직업의 기본 제작 라인 (도구 조합) */
  stack: string[];
  projects: JobProject[];
};

/** 2032년 현재 — 이 직업이 실제로 어떻게 일하고 있는가 */
export type JobFuture2032DaySlot = {
  time: string;
  icon: string;
  activity: string;
  /** 이 시간대에 AI가 처리하는 일 */
  aiRole: string;
  /** 같은 시간대에 사람이 반드시 맡는 일 */
  humanRole: string;
};

export type JobFuture2032Skill = {
  name: string;
  /** 왜 2032년에 이 역량이 값을 갖는가 */
  why: string;
  /** 중·고등학생이 지금 훈련하는 방법 */
  howToTrain: string;
  /** 1~5: 이 직업에서의 비중 */
  weight: number;
};

export type JobFuture2032Tool = {
  name: string;
  /** 이 도구로 무엇을 하는가 */
  role: string;
  /** '필수' | '권장' | '심화' (JSON import 호환을 위해 string) */
  level: string;
};

export type JobFuture2032NewRole = {
  name: string;
  what: string;
  salary?: string;
};

export type JobFuture2032 = {
  /** 한 문장 결론 */
  headline: string;
  summary: string;
  roleShift: { from: string; to: string; note: string };
  dayInLife: {
    title: string;
    note?: string;
    slots: JobFuture2032DaySlot[];
  };
  /** AI 시대 필수 역량 */
  aiSkills: JobFuture2032Skill[];
  /** 실제로 쓰는 AI 도구 스택 */
  toolStack: JobFuture2032Tool[];
  /** AI가 가져간 일 */
  fading: string[];
  /** 사람 몫으로 남은 일 */
  moat: string[];
  /** 2032년에 새로 생긴 역할 */
  newRoles: JobFuture2032NewRole[];
  /** 중·고등학생이 지금 시작할 것 */
  startNow: string[];
};

export type Job = {
  id: string;
  name: string;
  icon: string;
  shortDesc: string;
  /** 입시·입학 루트 요약 (JSON, 선택) */
  admissionPath?: string;
  /** 입사·전환 경로 한 줄 — careerTimeline.milestones가 비어 있을 때 타임라인 폴백에 사용 */
  entryProcess?: string;
  description?: string;
  holland: string;
  salaryRange: string;
  futureGrowth: number;
  aiRisk: string;
  workProcess: {
    title?: string;
    description?: string;
    phases: WorkPhase[];
  };
  careerTimeline: {
    title: string;
    totalYears: string;
    totalCost: string;
    milestones: Milestone[];
    keySuccess: string[];
  };
  organizationStructure?: OrganizationStructure;
  aiTransformation?: AiTransformation;
  /** 프로젝트 기반 실행 트랙 (있는 직업만 '프로젝트' 탭 노출) */
  projectTrack?: JobProjectTrack;
  /** 2032년 현재 모습 (있는 직업만 '2032' 탭 노출) */
  future2032?: JobFuture2032;
};

export type WorkPhase = {
  id: number;
  phase: string;
  icon: string;
  title: string;
  description: string;
  duration: string;
  example?: string;
  tools: string[];
  skills: string[];
};

export type Milestone = {
  period: string;
  semester: string;
  icon: string;
  title: string;
  activities: string[];
  awards?: string[];
  setak?: string;
  achievement: string;
  cost?: string;
};

// ─── High School Admission Types ─────────────────────────────

export type AdmissionStep = {
  step: number;
  title: string;
  detail: string;
  icon: string;
};

export type AdmissionRequirements = {
  grade: string;
  extracurricular: string;
  exam: string;
};

export type TimelineItem = {
  period: string;
  tasks: string[];
  priority: 'high' | 'critical' | 'medium';
};

export type KeyActivity = {
  name: string;
  weight: number;
  description: string;
};

export type RepresentativeSchool = {
  name: string;
  location: string;
  specialty: string;
  annualAdmission: number;
};

export type HighSchoolType = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  tag: string;
  difficulty: number;
  targetUniversities: string[];
  targetJobs: string[];
  admissionProcess: AdmissionStep[];
  requirements: AdmissionRequirements;
  timeline: TimelineItem[];
  keyActivities: KeyActivity[];
  representativeSchools: RepresentativeSchool[];
  pros: string[];
  cons: string[];
  admissionTip: string;
};

export type DecisionFlowQuestion = {
  id: string;
  question: string;
  yes: string;
  no: string;
};

export type AdmissionChange2028 = {
  schoolType: string;
  change2028: string;
  reason: string;
  strategy: string;
};

export type HighSchoolAdmissionData = {
  meta: { title: string; subtitle: string; description: string };
  schoolTypes: HighSchoolType[];
  comparisonTable: {
    title: string;
    columns: string[];
    rows: { label: string; values: string[] }[];
  };
  admissionChanges2028: {
    title: string;
    description: string;
    impact: string;
    changes: AdmissionChange2028[];
  };
  decisionFlowQuestions: DecisionFlowQuestion[];
};

// ─── High School Admission V2 Types (Planet UI) ──────────────

export type SchoolPlanetConfig = {
  size: 'small' | 'medium' | 'large';
  orbitRadius: number;
  orbitSpeed: number;
  glowColor: string;
};

export type SchoolCategoryTraits = {
  aptitude: string;
  studyStyle: string;
  identity: string;
  mentalStrength: string;
  gradeRequirement: string;
  aptitudeTest: string;
  internalGradeStrategy: string;
};

export type SchoolAdmissionStep = {
  step: number;
  title: string;
  detail: string;
  icon: string;
};

export type SchoolCareerPath = {
  middle1: string;
  middle2: string;
  middle3: string;
};

export type SchoolCareerPathDetail = {
  grade: string;
  icon: string;
  tasks: string[];
  keyPoint: string;
};

export type SchoolRealTalkItem = {
  emoji: string;
  title: string;
  content: string;
};

export type SchoolDailyScheduleItem = {
  time: string;
  activity: string;
  emoji: string;
};

export type SchoolSurvivalTip = {
  emoji: string;
  tip: string;
};

export type SchoolFamousProgramDetail = {
  name: string;
  emoji: string;
  description: string;
  benefit: string;
};

export type SchoolHighlightStat = {
  label: string;
  value: string;
  emoji: string;
  color: string;
};

export type SchoolAdmissionRouteStrength = {
  route: string;
  strength: 'high' | 'medium' | 'low';
  reason: string;
  recommendedFor: string;
};

export type SchoolMajorUniversityRatio = {
  track: string;
  ratio: number;
  note?: string;
};

export type SchoolSelectionProfile = {
  profileTitle: string;
  profileSummary: string;
  curriculumHighlights: string[];
  extracurricularHighlights: string[];
  clubHighlights: string[];
  admissionRouteStrengths: SchoolAdmissionRouteStrength[];
  majorUniversityRatios: SchoolMajorUniversityRatio[];
  ratioBasisNote?: string;
  middleSchoolSelectionChecklist: string[];
};

/** 학교 기본 정보 카드 (학교 소개 탭 상단 그리드 렌더링용) */
export type SchoolInfoCard = {
  /** 선발 범위 + 교통 요약 (예: "서울시 단위 · 통학 가능") */
  regionScope: string;
  /** 연간 입학 정원 + 총 재학생 (예: "연 360명 · 총 1,080명") */
  capacity: string;
  /** 남녀 비율 (예: "남 40% · 여 60%") */
  genderRatio: string;
  /** 기숙사 유형 (예: "선택 기숙사 · 4인실") */
  dormitoryType: string;
  /** 연간 총 예상 비용 (예: "연 800~1,000만원 (기숙사 포함 시)") */
  costPerYear: string;
  /** 장학금·소득 지원 요약 (예: "기초수급자 등록금 100% · 국가장학금 신청 가능") */
  scholarship: string;
  /** 소득 하위 가정을 위한 현실 조언 */
  lowIncomeAdvice?: string;
};

/** 입학 자격 요약 (학교 소개 탭 렌더링용) */
export type SchoolAdmissionQualifications = {
  /** 필수 조건 목록 (없으면 사실상 불합격) */
  mandatory: string[];
  /** 우대 조건 목록 (있으면 유리) */
  recommended?: string[];
  /** 면접 형식 요약 */
  interviewFormat?: string;
  /** 경쟁률 (예: "약 5:1") */
  competitionRate?: string;
  /** AI 관련 전형 팁 */
  aiTip?: string;
};

export type HighSchoolDetail = {
  id: string;
  name: string;
  shortName: string;
  location: string;
  type: string;
  emoji: string;
  color: string;
  difficulty: number;
  annualAdmission: number;
  tuition: string;
  dormitory: boolean;
  ibCertified: boolean;
  specialCertification: string;
  teachingMethod: string;
  famousPrograms: string[];
  famousProgramDetails?: SchoolFamousProgramDetail[];
  studentLevel: string;
  admissionProcess: SchoolAdmissionStep[];
  careerPath: SchoolCareerPath;
  careerPathDetails?: SchoolCareerPathDetail[];
  pros: string[];
  cons: string[];
  admissionTip: string;
  targetUniversities: string[];
  alumniCareers: string[];
  highlightStats?: SchoolHighlightStat[];
  selectionProfile?: SchoolSelectionProfile;
  realTalk?: SchoolRealTalkItem[];
  dailySchedule?: SchoolDailyScheduleItem[];
  survivalTips?: SchoolSurvivalTip[];
  competitionLevel?: string;
  studyHoursPerDay?: string;
  selfStudyRatio?: string;
  socialLife?: string;
  mentalHealthNote?: string;
  aiEraStrategy?: HighSchoolAiEraStrategy;
  /** 학교 소개 한 줄 설명 (학교 소개 탭 상단) */
  description?: string;
  /** 학교 기본 정보 카드 그리드 (정원·남녀비율·등록금·기숙사·장학금) */
  schoolInfoCard?: SchoolInfoCard;
  /** 입학 자격 요약 (필수·우대 조건) */
  admissionQualifications?: SchoolAdmissionQualifications;
  /** 학습 방식 상세 설명 */
  studyStyleDetail?: string;
  /** 졸업 후 진로 요약 */
  futureOutlook?: string;
  /** 학교 공식 홈페이지 URL */
  websiteUrl?: string;
  /** 2028 개편 + AI 시대 카테고리 공통 업데이트 (학교 단위로 동일) */
  update2028AI?: {
    policy2028: string;
    aiEra: string;
    cautionPoints: string[];
  };
  /** 중학생을 위한 친근한 고입 가이드 (카테고리 공통, 학교별 homepageUrl만 다름) */
  middleSchoolGuide?: {
    oneLineAbout: string;
    goodFor: string[];
    notForYouIf: string[];
    whatToDoNow: string[];
    admissionTimeline: string;
    competitionRate: string;
    whatTheyCheck: string[];
    aiTipForMiddleSchooler: string;
    homepageMustCheck: string;
    homepageUrl: string;
  };
  /** 자공고 2.0 등 협약형 학교의 지정·협약·특화 트랙 프로필 */
  jagonggoProfile?: SchoolJagonggoProfile;
  /** 목록 카드에 노출할 특화 태그 (예: "🤖 AI", "🔬 과학중점") */
  listTags?: string[];
  /** 목록 카드에 노출할 지역 연계 프로그램 한 줄 요약 */
  regionProgramSummary?: string;
  /** 등록금·비용 구조 (그룹핑 + 과정별 트랙 비교) */
  costStructure?: SchoolCostStructure;
  /** 최신 학년도 모집인원·경쟁률 팩트 */
  admissionFacts?: SchoolAdmissionFacts;
  /** 대학 진학 추이 (서울대·서울권·해외대) */
  universityOutcomes?: SchoolUniversityOutcomes;
  /** 지역 연계·선발 범위 */
  regionalLinkage?: SchoolRegionalLinkage;
};

export type HighSchoolAiEraStrategy = {
  title: string;
  summary: string;
  keyInsights?: Array<{
    title: string;
    aiReplaces?: string[];
    humanMustDo?: string[];
    roadmap?: Array<{
      stage: string;
      focus: string;
      tools?: string[];
      projects?: string[];
      warning?: string;
      keyPoint?: string;
    }>;
    strategies?: Array<{
      strategy: string;
      why: string;
      how?: string[];
      example?: string;
    }>;
  }>;
  practicalTips?: Array<{
    emoji: string;
    category: string;
    tip: string;
    detail: string;
  }>;
  commonMistakes?: Array<{
    mistake: string;
    correct: string;
  }>;
  futureCareerInsight?: {
    title: string;
    reality: string;
    newCareers?: string[];
    preparation?: string[];
    salaryTrend?: {
      traditional: string;
      aiCollaborator: string;
      gap: string;
    };
  };
};

/** 정시·수시·면접 등 전형 트랙별 유불리와 준비 전략 */
export type HighSchoolAdmissionTrack = {
  /** 이 유형이 이 전형에서 유리한/불리한 점 */
  advantage: string;
  /** 구체적 준비 전략 (어떻게 해야 하는지) */
  strategy: string;
};

export type HighSchoolAdmissionStrategy2028 = {
  title: string;
  summary: string;
  /** 핵심 포인트 — 단순 문자열 배열 또는 라벨·상세 객체 모두 지원 */
  points: Array<
    | string
    | {
        label: string;
        detail: string;
        impact?: 'positive' | 'neutral' | 'caution';
      }
  >;
  /** 전형 트랙별(수시·정시·면접) 유불리와 전략 */
  tracks?: {
    susi?: HighSchoolAdmissionTrack;
    jeongsi?: HighSchoolAdmissionTrack;
    interview?: HighSchoolAdmissionTrack;
  };
  /** 내신 성적대별 전략 (상위권·중위권) */
  byGrade?: {
    top?: string;
    mid?: string;
  };
  /** 이 유형만의 특혜·특별전형·혜택 목록 */
  perks?: string[];
};

/** 고입 유형 설명을 트리 구조로 그룹핑한 개요 (긴 문단 대체) */
export type HighSchoolDescriptionOutline = {
  /** 중심 문장 — 한 문장 결론 */
  coreSentence: string;
  groups: Array<{
    emoji: string;
    label: string;
    /** 하위 항목 (트리 leaf) */
    points: string[];
  }>;
};

/** 관심 분야 적합도 등급 */
export type HighSchoolFitLevel = 'best' | 'good' | 'caution' | 'avoid';

/** "내 관심 분야에 이 유형을 골라도 될까?" 판정 */
export type HighSchoolInterestFit = {
  field: string;
  emoji: string;
  level: HighSchoolFitLevel;
  /** 왜 그런지 확장 설명 */
  reason: string;
  /** 이 유형에서 해당 분야로 가는 실제 경로 */
  route?: string;
};

export type HighSchoolInterestFitGuide = {
  /** 중심 문장 (요약) */
  headline: string;
  /** 요약을 확장한 설명 */
  subline?: string;
  fits: HighSchoolInterestFit[];
  /** 이과·문과·예체능·취업 등 계열별 판정 */
  trackVerdict?: Array<{ label: string; emoji?: string; detail: string }>;
};

/** 유형 차별화 축 (과목·계열 / 지역 연계 / 정부 지원금 / 등록금 / 학교 형태) */
export type HighSchoolDifferentiator = {
  key: string;
  emoji: string;
  label: string;
  /** 중심 문장 — 굵게 표시 */
  headline: string;
  /** 확장 설명 */
  detail: string;
  /** 다른 유형(주로 일반고) 대비 비교 */
  compare?: string;
};

export type HighSchoolDifferentiators = {
  coreSentence: string;
  items: HighSchoolDifferentiator[];
};

/** 내신 전략·공부 스타일 트리 */
export type HighSchoolStrategyTree = {
  /** 학년별 트리 */
  byGrade: Array<{
    stage: string;
    emoji?: string;
    goal: string;
    nodes: Array<{ label: string; emoji?: string; items: string[] }>;
  }>;
  /** 분야별 트리 */
  byField: Array<{ area: string; emoji?: string; summary: string; items: string[] }>;
};

/** 등록금 구조 트리 — "누가 내는 돈인가"로 나눈 계층 */
export type HighSchoolTuitionLayer = {
  level: number;
  emoji: string;
  label: string;
  /** free=국가 지원 0원 / paid=학부모 실비 / supported=사업비(학생 부담 없음) */
  badge: 'free' | 'paid' | 'supported';
  amount: string;
  summary: string;
  items: Array<{ name: string; cost: string; note?: string }>;
  compare?: string;
};

export type HighSchoolTuitionStructure = {
  coreSentence: string;
  howToRead?: string;
  layers: HighSchoolTuitionLayer[];
  /** IB 비용이 등록금과 어떻게 다른지 */
  ibNote?: { title?: string; headline: string; points: string[]; verdict?: string; sources?: SchoolSourceLink[] };
  /** 고교 유형별 연간 비용 비교 */
  comparison?: Array<{ type: string; emoji: string; annual: string; note?: string; highlight?: boolean }>;
  checklist?: string[];
};

/** 같은 유형 안에서 학교를 갈라 보는 그룹핑 트리 */
export type HighSchoolGroupAxis = {
  id: string;
  emoji: string;
  label: string;
  description?: string;
  groups: Array<{
    label: string;
    emoji: string;
    note?: string;
    schools: Array<{ name: string; region?: string; tag?: string }>;
  }>;
};

export type HighSchoolGroupTree = {
  coreSentence: string;
  scopeNote?: string;
  axes: HighSchoolGroupAxis[];
  pickGuide?: string[];
  /** 전국 시·도별 지정 현황 (공식 집계) */
  nationalStatus?: {
    asOf: string;
    total: string;
    headline: string;
    rows: Array<{ sido: string; count: number; detail?: string }>;
    note?: string;
  };
};

/** 자공고 2.0·외고 등 유형별 학교 프로필 (지정·협약·전공·특화) */
export type SchoolJagonggoProfile = {
  /** 프로필 카드 제목 override (미입력 시 "🏛️ 자공고 2.0 프로필") */
  profileTitle?: string;
  /** 비교 카드 제목 override (미입력 시 "🆚 다른 자공고 2.0과 무엇이 다른가") */
  vsTitle?: string;
  /** cohort 필드 라벨 override (미입력 시 "지정 차수") */
  cohortLabel?: string;
  /** designationPeriod 필드 라벨 override (미입력 시 "지정 기간") */
  designationPeriodLabel?: string;
  /** zone 필드 라벨 override (미입력 시 "권역") */
  zoneLabel?: string;
  /** requiredTask 블록 라벨 override (미입력 시 "모든 지정교 공통 필수과제") */
  requiredTaskLabel?: string;
  cohort: string;
  designationPeriod: string;
  zone?: string;
  /** 학교가 고른 선택과제 (지역연계교육·인성교육·진로교육·에듀테크 등) */
  selectiveTask?: string;
  /** 모든 지정교 공통 필수과제 */
  requiredTask?: string;
  brand?: string;
  vision?: string;
  coreCurriculum?: string[];
  signaturePrograms?: string[];
  focusTracks?: Array<{ name: string; emoji: string }>;
  partners?: Array<{ name: string; type: string; role: string }>;
  /** 이 학교가 있는 지역의 자원 (탐구 소재) */
  regionAssets?: string;
  /** 지역 협약이 특화 과목·세특을 어떻게 바꾸는지 */
  sseteukLinkage?: {
    headline: string;
    items: Array<{
      track: string;
      emoji: string;
      /** 이 트랙에서 열리는 특화 과목·프로그램 */
      subjects?: string[];
      /** 세특에 어떻게 남는지 (구체 예시) */
      how: string;
      /** 근거가 되는 지역 자원 */
      regionAsset?: string;
    }>;
  };
  /** 다른 자공고 2.0과 무엇이 다른지 */
  vsOtherJagonggo?: { headline: string; points: string[] };
  /** 선발 방식 (평준화 배정 / 비평준화 내신 선발 등) */
  admissionType?: string;
  /** 입학 인원 */
  intake?: string;
  /** 경쟁률 */
  competition?: string;
  /** 커트라인 */
  cutline?: string;
  /** 어떻게 공부해서 들어가는지 (중1~중3~입학 후 단계별) */
  howToGetIn?: Array<{ stage: string; items: string[] }>;
};

export type HighSchoolCategory = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
  planet: SchoolPlanetConfig;
  categoryTraits: SchoolCategoryTraits;
  schools: HighSchoolDetail[];
  aiEraStrategy?: HighSchoolAiEraStrategy;
  /** 2028 입시제도 정책 컨텍스트 한 줄 요약 */
  policyContext2028?: string;
  /** AI 시대 직업 변화 컨텍스트 한 줄 요약 */
  aiEraContext?: string;
  /** 2028 입시 전략 (제목·요약·핵심 포인트) */
  admissionStrategy2028?: HighSchoolAdmissionStrategy2028;
  /** 설명 문단을 트리로 그룹핑한 개요 */
  descriptionOutline?: HighSchoolDescriptionOutline;
  /** 관심 분야별 선택 가능 여부 판정 */
  interestFitGuide?: HighSchoolInterestFitGuide;
  /** 이 유형만의 차별화 포인트 */
  differentiators?: HighSchoolDifferentiators;
  /** 내신 전략·공부 스타일 트리 */
  strategyTree?: HighSchoolStrategyTree;
  /** 등록금 구조 트리 (무상교육/수익자부담/사업비 + IB 비용 구분) */
  tuitionStructure?: HighSchoolTuitionStructure;
  /** 학교 그룹핑 트리 (지정 차수·권역·특화 계열) */
  schoolGroupTree?: HighSchoolGroupTree;
  /** 유형 내 학교별 등록금 비교표 */
  costComparison?: SchoolCostComparison;
  /** 유형 내 학교별 경쟁률·모집인원 비교표 */
  admissionFactsComparison?: SchoolAdmissionFactsComparison;
  /** 특색 축(중점 분야)별 대표 중점학교 지도 — IB·과학중점·AI·지역연계 */
  featureFocus?: HighSchoolFeatureFocus;
  /** 이 유형의 지정·학과·전형을 직접 확인할 수 있는 공식 사이트 (확인처 / 무엇을 확인) */
  verifySources?: HighSchoolVerifySource[];
  /** 확인처 블록 상단 안내 문구 */
  verifyNote?: string;
  /** 수도권 지도에서 기본으로 켤 필터 — 'all' | 'meister' | 'business' (직업계고 전용) */
  seoulMapFocus?: 'all' | 'meister' | 'business';
};

/** 특색 축별 대표 중점학교 (검증된 지정·인증 사실만 수록) */
export type HighSchoolFeatureFocusSchool = {
  name: string;
  region: string;
  /** 공식 지정·인증 사실 한 줄 (연도·근거 포함) */
  fact: string;
  /** 이 유형 데이터셋에 상세 페이지가 있는 학교인지 */
  inDataset?: boolean;
};

export type HighSchoolFeatureFocusAxis = {
  id: string;
  emoji: string;
  label: string;
  /** 이 축이 무엇인지 한 줄 */
  what: string;
  /** 이 축 학교에 들어가는 방법 (배정·교내 선발 등) */
  howToEnter: string;
  /** 이 축을 고를 때 2028 입시에서 유리·불리한 점 */
  admissionNote?: string;
  scale?: string;
  schools: HighSchoolFeatureFocusSchool[];
  sources?: SchoolSourceLink[];
};

/** 지정·인증 단계를 사용자가 직접 확인할 수 있는 공식 창구 */
export type HighSchoolVerifySource = {
  label: string;
  url: string;
  /** 이 사이트에서 무엇을 확인할 수 있는지 */
  what: string;
};

export type HighSchoolFeatureFocus = {
  headline: string;
  asOf: string;
  intro?: string;
  axes: HighSchoolFeatureFocusAxis[];
  /** 고르는 순서 가이드 */
  pickGuide?: string[];
  /** 공식 확인처 (확인처 / 무엇을 확인) */
  verifySources?: HighSchoolVerifySource[];
  /** 확인처 블록 상단 안내 문구 */
  verifyNote?: string;
};

/** 등록금·비용 구조 (그룹핑 + 트리) */
export type SchoolCostItem = { label: string; amount: string; note?: string };
export type SchoolCostGroup = {
  id: string;
  emoji: string;
  label: string;
  amount: string;
  note?: string;
  items: SchoolCostItem[];
};
export type SchoolCostTrack = {
  track: string;
  emoji?: string;
  tuition: string;
  extra: string;
  yearTotal: string;
  note?: string;
};
export type SchoolSourceLink = { label: string; url: string };
/** 등록금 톤 — free: 안 내는 돈, pay: 실제로 내는 돈, get: 받는 돈 */
export type SchoolCostTone = 'free' | 'pay' | 'get';
/** 등록금 한눈 요약 타일 */
export type SchoolCostQuickTile = {
  emoji: string;
  label: string;
  value: string;
  sub?: string;
  tone?: SchoolCostTone;
};
/** 월 / 연 / 3년 환산 행 */
export type SchoolCostPeriodRow = {
  label: string;
  monthly: string;
  yearly: string;
  threeYear: string;
  tone?: SchoolCostTone;
  note?: string;
};
export type SchoolCostPeriodTable = {
  title?: string;
  rows: SchoolCostPeriodRow[];
  note?: string;
};
export type SchoolCostStructure = {
  asOf: string;
  headline: string;
  totalPerYear: string;
  totalNote?: string;
  actualPayNote?: string;
  /** 상단 한눈 요약 타일 */
  quickTiles?: SchoolCostQuickTile[];
  /** 월/연/3년 환산 표 */
  periodTable?: SchoolCostPeriodTable;
  groups?: SchoolCostGroup[];
  programTracks?: SchoolCostTrack[];
  notes?: string[];
  sources?: SchoolSourceLink[];
};

/** 입시 팩트 (모집인원·경쟁률) */
export type SchoolAdmissionTrack = {
  name: string;
  capacity?: number | null;
  applicants?: number | null;
  rate?: string;
  note?: string;
};
export type SchoolAdmissionFacts = {
  year: string;
  capacityTotal: number;
  applicantsTotal?: number | null;
  overallRate: string;
  prevYearRate?: string;
  trend?: string;
  tracks: SchoolAdmissionTrack[];
  note?: string;
  categoryAverage?: string;
  sources?: SchoolSourceLink[];
};

/** 대학 진학 추이 (직업계고는 취업 지표로 재사용 — 라벨을 갈아끼움) */
export type SchoolUniversityOutcomes = {
  /** 섹션 제목 override (미입력 시 "대학 진학 추이 (SKY·서울권·해외대)") */
  title?: string;
  headline: string;
  /** snuByYear 타일에 붙는 지표 이름 override (미입력 시 "서울대") */
  metricLabel?: string;
  snuByYear?: { year: string; count: string }[];
  /** 자유 지표 행 (취업률·진학률·유지취업률 등) */
  extraRows?: { emoji: string; label: string; value: string }[];
  overseas?: string;
  /** overseas 행 라벨 override (미입력 시 "해외대") */
  overseasLabel?: string;
  seoulAreaNote?: string;
  /** seoulAreaNote 행 라벨 override (미입력 시 "서울권") */
  seoulAreaLabel?: string;
  dataConfidence?: string;
  sources?: SchoolSourceLink[];
};

/** 지역 연계 */
export type SchoolRegionalLinkage = {
  selectionScope: string;
  regionTrack?: string;
  localTie?: string;
  commute?: string;
  sources?: SchoolSourceLink[];
};


export type IdentityTip = {
  icon: string;
  title: string;
  detail: string;
};

export type AptitudeQuestion = {
  id: string;
  question: string;
  yes: string | null;
  no: string | null;
};

export type IdentityChallengeChoice = {
  text: string;
  categoryScores: Record<string, number>;
  hint?: string;
  feedback: string;
};

export type IdentityChallengeQuestion = {
  id: string;
  theme: string;
  themeIcon: string;
  context: string;
  question: string;
  expertTip?: string;
  choices: IdentityChallengeChoice[];
};

export type IdentityChallengeData = {
  meta: {
    title: string;
    subtitle: string;
    description: string;
    totalQuestions: number;
    policyContext?: string;
    aiEraContext?: string;
    lastUpdated?: string;
    playEstimateMinutes?: number;
    scoringNote?: string;
  };
  questions: IdentityChallengeQuestion[];
  resultMessages: { single: string; multiple: string; neutral: string };
};

export type MentalChallengeChoice = {
  text: string;
  mentalScore: number;
  feedback: string;
  gainEffect?: string;
  realAction?: string;
};

export type MentalChallengeScenario = {
  id: string;
  situation: string;
  emoji: string;
  context: string;
  question: string;
  choices: MentalChallengeChoice[];
  coachTip?: string;
  recoveryStrategy?: { immediate?: string; shortTerm?: string; longTerm?: string };
  realWorldInsight?: string;
  bossInsight?: string;
};

export type MentalChallengeResultTier = {
  minScore: number;
  label: string;
  emoji: string;
  message: string;
  tagline?: string;
  actionPlan?: string[];
  recommendedResources?: string[];
  weeklyHabit?: string;
};

export type MentalChallengeData = {
  meta: {
    title: string;
    subtitle: string;
    description: string;
    totalScenarios: number;
    policyContext?: string;
    aiEraContext?: string;
    lastUpdated?: string;
    playEstimateMinutes?: number;
  };
  scenarios: MentalChallengeScenario[];
  resultTiers: MentalChallengeResultTier[];
  mentalHealthTips?: { icon: string; title: string; tip: string }[];
};

export type HighSchoolAdmissionV2Data = {
  meta: { title: string; subtitle: string; description: string };
  categories: HighSchoolCategory[];
  identityAndMentalStrength: {
    title: string;
    description: string;
    tips: IdentityTip[];
  };
  aptitudeCheckList: {
    title: string;
    description: string;
    questions: AptitudeQuestion[];
  };
};

// ─── Job Career Route Types ───────────────────────────────────

export type CareerStage = {
  stage: string;
  period: string;
  tasks: string[];
  icon: string;
};

export type RecommendedUniversity = {
  name: string;
  admissionType: string;
  difficulty: number;
};

export type JobCareerRoute = {
  id: string;
  name: string;
  emoji: string;
  company: string;
  salaryRange: string;
  difficulty: number;
  recommendedHighSchool: string[];
  recommendedHighSchoolNames: string[];
  recommendedUniversities: RecommendedUniversity[];
  careerPath: CareerStage[];
  keyPreparation: string[];
  futureOutlook: string;
};

export type JobCategory = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  jobs: JobCareerRoute[];
};

export type RoutePathway = {
  highSchool: string;
  universities: string[];
  jobs: string[];
  color: string;
};

export type RouteOverview = {
  title: string;
  description: string;
  pathways: RoutePathway[];
};

export type JobCareerRoutesData = {
  meta: { title: string; subtitle: string; description: string };
  categories: JobCategory[];
  routeOverview: RouteOverview;
};

/** 유형 내 학교별 등록금 비교표 */
export type SchoolCostComparison = {
  title: string;
  asOf: string;
  keyInsight: string;
  rows: { school: string; type: string; tuition: string; beneficiary: string; total: string; program?: string; /** 특색(AI 중점·과학중점·지역 연계 등) 한 줄 태그 */ feature?: string }[];
  cautions?: string[];
  sources?: SchoolSourceLink[];
};

/** 유형 내 학교별 경쟁률·모집인원 비교표 */
export type SchoolAdmissionFactsComparison = {
  title: string;
  summary: string;
  rows: { school: string; capacity: number; applicants?: number | null; rate: string; prev?: string; trend?: string }[];
  insights?: string[];
  sources?: SchoolSourceLink[];
};
