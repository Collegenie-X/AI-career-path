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

export type DailyScheduleItem = {
  time: string;
  activity: string;
  detail?: string;
  icon: string;
  type: 'morning' | 'meeting' | 'work' | 'lunch' | 'review' | 'admin' | 'evening' | 'field';
};

export type DailySchedule = {
  title: string;
  basis: string;
  schedule: DailyScheduleItem[];
};

export type Job = {
  id: string;
  name: string;
  icon: string;
  shortDesc: string;
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
  dailySchedule?: DailySchedule;
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
  choices: IdentityChallengeChoice[];
};

export type IdentityChallengeData = {
  meta: { title: string; subtitle: string; description: string; totalQuestions: number };
  questions: IdentityChallengeQuestion[];
  resultMessages: { single: string; multiple: string; neutral: string };
};

export type MentalChallengeChoice = {
  text: string;
  mentalScore: number;
  feedback: string;
};

export type MentalChallengeScenario = {
  id: string;
  situation: string;
  emoji: string;
  context: string;
  question: string;
  choices: MentalChallengeChoice[];
};

export type MentalChallengeData = {
  meta: { title: string; subtitle: string; description: string; totalScenarios: number };
  scenarios: MentalChallengeScenario[];
  resultTiers: { minScore: number; label: string; emoji: string; message: string }[];
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
