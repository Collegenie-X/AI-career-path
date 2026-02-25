// ─── Types ───────────────────────────────────────────────

export type StarData = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  bgColor: string;
  jobCount: number;
  jobs: Job[];
  starProfile?: unknown;
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
  coreCompetencies?: string[];
  salaryRange: string;
  futureGrowth: number;
  aiRisk: string;
  workProcess: {
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
