// ============================
// DreamPath - Core TypeScript Types
// ============================

// --- RIASEC Types ---
export type RIASECType = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

export interface RIASECScores {
  R: number; // Realistic (실행형)
  I: number; // Investigative (탐구형)
  A: number; // Artistic (예술형)
  S: number; // Social (사회형)
  E: number; // Enterprising (진취형)
  C: number; // Conventional (관습형)
}

export interface RIASECResult {
  scores: RIASECScores;
  topTypes: [RIASECType, RIASECType];
  keywords: string[];
  completedAt: string;
}

// --- Quiz Types ---
export interface QuizChoice {
  id: string;
  text: string;
  riasecScores: Partial<RIASECScores>;
}

export interface QuizQuestion {
  id: number;
  situation: string;
  description: string;
  choices: QuizChoice[];
}

// --- Kingdom Types ---
export type KingdomId = 'explore' | 'create' | 'tech' | 'nature' | 'connect' | 'order' | 'communicate' | 'challenge';

export interface Kingdom {
  id: KingdomId;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
  riasecTypes: RIASECType[];
  jobCount: number;
}

// --- Job Types ---
export type Rarity = 'normal' | 'rare' | 'epic' | 'legend';

export interface JobL1 {
  keywords: string[];
  matchingTip: string;
}

export interface DailyScheduleItem {
  time: string;
  activity: string;
}

export interface JobL2 {
  dailySchedule: DailyScheduleItem[];
  salaryRange: { min: number; max: number; unit: string };
  salaryCurve: string;
  outlook: number; // 1~5 stars
  outlookDescription: string;
}

export interface SkillScore {
  name: string;
  score: number; // 1~5
}

export interface JobL3 {
  interviewQuote: string;
  interviewerName: string;
  interviewerTitle: string;
  requiredSkills: SkillScore[];
  stressLevel: number; // 1~5
  freedomLevel: number; // 1~5
  rewardLevel: number; // 1~5
  entryPath: string;
}

export interface CareerMilestone {
  stage: string;
  title: string;
  description: string;
  icon: string;
}

export interface JobL4 {
  milestones: CareerMilestone[];
  urgencyNote: string;
}

export interface VirtualAcceptee {
  type: string; // 학종, 정시, 특기자
  name: string;
  school: string;
  gpa: string;
  activities: string[];
  essay: string;
  tip: string;
}

export interface JobL5 {
  acceptees: VirtualAcceptee[];
}

export interface Job {
  id: string;
  name: string;
  nameEn: string;
  kingdomId: KingdomId;
  icon: string;
  rarity: Rarity;
  riasecProfile: RIASECScores;
  description: string;
  shortDescription: string;
  l1: JobL1;
  l2: JobL2;
  l3: JobL3;
  l4: JobL4;
  l5: JobL5;
}

// --- Simulation Types ---
export interface SimulationChoice {
  id: string;
  text: string;
  result: string;
  scoreImpact: { stress: number; freedom: number; reward: number };
  xpReward: number;
}

export interface SimulationScene {
  id: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  title: string;
  description: string;
  image?: string;
  choices: SimulationChoice[];
}

export interface SimulationScenario {
  jobId: string;
  intro: string;
  scenes: SimulationScene[];
  summary: {
    coreSkills: string[];
    realityCheck: string;
  };
}

// --- Weekly Camp Types ---
export interface CampMission {
  day: number;
  title: string;
  description: string;
  type: 'quiz' | 'activity' | 'reflection' | 'challenge' | 'project' | 'review' | 'presentation';
  xpReward: number;
  details: string;
}

export interface WeeklyCamp {
  jobId: string;
  title: string;
  missions: CampMission[];
  completionBadge: string;
  totalXP: number;
}

// --- Career Path Types ---
export interface PathStep {
  id: string;
  stage: string; // 초등, 중등, 고등, 대학
  title: string;
  description: string;
  activities: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface CareerPathTemplate {
  jobId: string;
  steps: PathStep[];
  priorityActions: string[];
}

// --- Badge Types ---
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: Rarity;
  condition: string;
  xpReward: number;
  category: 'exploration' | 'simulation' | 'career' | 'clue' | 'special';
  effect: {
    type: 'xp_boost' | 'unlock';
    value: number | string;
    description: string;
  };
}

// --- Level Types ---
export interface LevelDefinition {
  level: number;
  name: string;
  minXP: number;
  maxXP: number;
  unlocks: string[];
  icon: string;
}

// --- User Data (localStorage) Types ---
export interface UserProfile {
  id: string;
  nickname: string;
  grade: string;
  createdAt: string;
  onboardingCompleted: boolean;
}

export interface SwipeLog {
  jobId: string;
  action: 'like' | 'pass' | 'superlike';
  timestamp: string;
}

export interface SimulationLog {
  jobId: string;
  choices: string[];
  scores: { stress: number; freedom: number; reward: number };
  totalXP: number;
  completedAt: string;
}

export interface XPLog {
  totalXP: number;
  level: number;
  history: { action: string; xp: number; date: string; source: string }[];
}

export interface KingdomProgress {
  [kingdomId: string]: {
    entered: boolean;
    firstEnteredAt?: string;
    jobsExplored: string[];
    simCompleted: string[];
    weekCampCompleted: string[];
    level: 'none' | 'newcomer' | 'explorer' | 'master' | 'ambassador';
  };
}

export interface SavedCareerPath {
  jobId: string;
  completedSteps: string[];
  startedAt: string;
  lastUpdated: string;
}

export interface ClueMember {
  id: string;
  nickname: string;
  riasecType: [RIASECType, RIASECType];
  grade: string;
  role: string;
}

export interface KanbanCard {
  id: string;
  title: string;
  description: string;
  assignee: string;
  status: 'todo' | 'in-progress' | 'done';
  dueDate?: string;
  createdAt: string;
}

export interface ShadowProject {
  id: string;
  title: string;
  type: string;
  stage: 'planning' | 'design' | 'development' | 'deployment';
  kanbanCards: KanbanCard[];
  deployUrl?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface ClueTeam {
  id: string;
  name: string;
  members: ClueMember[];
  project: ShadowProject;
  chatMessages: ChatMessage[];
  createdAt: string;
}

export interface QAPost {
  id: string;
  title: string;
  content: string;
  category: string;
  authorId: string;
  authorName: string;
  isPublic: boolean;
  answers: QAAnswer[];
  createdAt: string;
}

export interface QAAnswer {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  upvotes: number;
  createdAt: string;
}

export interface RecruitPost {
  id: string;
  title: string;
  description: string;
  type: 'recruit' | 'join' | 'idea';
  kingdoms: KingdomId[];
  positions: string[];
  authorId: string;
  authorName: string;
  maxMembers: number;
  currentMembers: number;
  createdAt: string;
}

export interface Portfolio {
  riasecSummary: RIASECResult | null;
  exploredJobs: string[];
  completedSims: string[];
  completedCamps: string[];
  projects: ShadowProject[];
  earnedBadges: string[];
  timeline: TimelineEvent[];
}

export interface TimelineEvent {
  id: string;
  type: 'quiz' | 'explore' | 'simulation' | 'camp' | 'clue' | 'badge' | 'levelup';
  title: string;
  description: string;
  date: string;
  xp?: number;
}

// --- Daily Mission Types ---
export interface DailyMission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  type: 'explore' | 'simulation' | 'path' | 'clue';
  completed: boolean;
  date: string;
}
