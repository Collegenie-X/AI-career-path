export type RIASECType = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

export interface RIASECScores {
  R: number;
  I: number;
  A: number;
  S: number;
  E: number;
  C: number;
}

export interface RIASECResult {
  scores: RIASECScores;
  topTypes: [RIASECType, RIASECType];
  keywords: string[];
  completedAt: string;
}

export interface LevelDefinition {
  level: number;
  name: string;
  minXP: number;
  maxXP: number;
  unlocks: string[];
  icon: string;
}

export interface UserProfile {
  id: string;
  nickname: string;
  grade: string;
  createdAt: string;
  onboardingCompleted: boolean;
}

export interface XPLog {
  totalXP: number;
  level: number;
  history: { action: string; xp: number; date: string; source: string }[];
}

export interface SavedPlan {
  id: string;
  title: string;
  type: 'activity' | 'award' | 'certification';
  grade: string;
  targetMonth: number;
  kingdomId: string;
  kingdomName: string;
  color: string;
}

export interface WorkPhase {
  id: number;
  phase: string;
  icon: string;
  title: string;
  description: string;
  duration: string;
  tools: string[];
  skills: string[];
  example?: string;
}

export interface WorkProcess {
  title: string;
  description: string;
  phases: WorkPhase[];
}

export type CareerItemType = 'activity' | 'award' | 'certification';

export interface CareerItem {
  icon: string;
  name: string;
  type: CareerItemType;
  description?: string;
  duration?: string;
  cost?: string;
  difficulty?: number;
  organization?: string;
}

export interface CareerMilestone {
  period: string;
  semester: string;
  icon: string;
  title: string;
  goals?: string[];
  items?: CareerItem[];
  activities: string[];
  awards?: string[];
  subjects?: string[];
  setak?: string;
  cost?: string;
  achievement: string;
}

export interface CareerGradeGroup {
  gradeLabel: string;
  gradeCode: string;
  itemCount: number;
  description?: string;
  goals: string[];
  items: CareerItem[];
}

export interface CareerTimeline {
  title: string;
  totalYears: string;
  totalCost: string;
  milestones: CareerMilestone[];
  gradeGroups?: CareerGradeGroup[];
  keySuccess: string[];
}

export interface AdmissionFactor {
  name: string;
  importance: number;
  detail: string;
  tip: string;
}

export interface AdmissionStrategy {
  title: string;
  factors: AdmissionFactor[];
}

export interface DailyScheduleItem {
  time: string;
  activity: string;
  detail?: string;
  icon: string;
  type: string;
}

export interface DailySchedule {
  title: string;
  basis: string;
  schedule: DailyScheduleItem[];
}

export interface StarJob {
  id: string;
  name: string;
  icon: string;
  shortDesc: string;
  holland: string;
  salaryRange: string;
  futureGrowth: number;
  aiRisk: string;
  description?: string;
  admissionPath?: string;
  entryProcess?: string;
  coreCompetencies?: string[];
  workProcess?: WorkProcess;
  careerTimeline?: CareerTimeline;
  admissionStrategy?: AdmissionStrategy;
  dailySchedule?: DailySchedule;
}

export interface StarCoreTrait {
  icon: string;
  label: string;
  desc: string;
}

export interface StarProfile {
  tagline: string;
  coreTraits: StarCoreTrait[];
  fitPersonality: {
    title: string;
    traits: string[];
    notFit: string[];
  };
  whyThisGroup: {
    title: string;
    reason: string;
    commonDNA: string[];
  };
  hollandCode: string;
  keySubjects: string[];
  careerKeyword: string;
  difficultyLevel: number;
  avgPreparationYears: number;
}

export interface StarData {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
  riasecTypes?: string[];
  jobCount?: number;
  starProfile?: StarProfile;
  jobs: StarJob[];
}
