// ─── Types ───────────────────────────────────────────────

export type StarProfile = {
  tagline?: string;
  coreTraits?: { icon: string; label: string; desc: string }[];
  fitPersonality?: {
    title: string;
    traits: string[];
    notFit?: string[];
  };
  whyThisGroup?: {
    title: string;
    reason: string;
    commonDNA: string[];
  };
  hollandCode?: string;
  keySubjects?: string[];
  careerKeyword?: string;
  difficultyLevel?: number;
  avgPreparationYears?: number;
};

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
  /** 상세 직업 소개 (2~4문장, 직무 프로세스 상단에 표시) */
  detailedIntroduction?: string;
  holland: string;
  coreCompetencies?: string[];
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
