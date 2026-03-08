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
