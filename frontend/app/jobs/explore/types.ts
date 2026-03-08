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
