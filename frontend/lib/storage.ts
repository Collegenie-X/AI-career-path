import type {
  UserProfile,
  RIASECResult,
  SwipeLog,
  SimulationLog,
  XPLog,
  KingdomProgress,
  SavedCareerPath,
  ClueTeam,
  Portfolio,
  TimelineEvent,
  DailyMission,
  QAPost,
  RecruitPost,
} from './types';

// ============================
// LocalStorage Keys
// ============================
export type TermsAgreement = {
  terms: boolean;
  privacy: boolean;
  marketing: boolean;
  agreedAt: string;
};

export type AuthProfile = {
  email: string;
  name: string;
  grade: string;
  termsAgreed: Record<string, boolean>;
  signedUpAt: string;
};

export type DetailedUserData = {
  basicInfo: {
    email: string;
    name: string;
    grade: string;
  };
  aptitudeTestInfo: {
    riasecResult: {
      scores: Record<string, number>;
      topTypes: string[];
      completedAt: string;
    } | null;
    interestAreas: string[];
    exploredJobs: string[];
  };
  careerPathInfo: {
    savedPaths: Array<{
      jobId: string;
      pathName: string;
      completedSteps: string[];
      startedAt: string;
      lastUpdated: string;
    }>;
    learningPlans: Array<{
      id: string;
      title: string;
      milestones: Array<{
        stage: string;
        title: string;
        activities: string[];
        priority: string;
      }>;
    }>;
    admissionStrategies: Array<{
      schoolType: string;
      targetSchools: string[];
      selectedStrategy: string;
      savedAt: string;
    }>;
  };
  careerExecutionInfo: {
    portfolio: {
      projects: Array<{
        id: string;
        title: string;
        description: string;
        type: string;
        completedAt: string;
      }>;
      activities: Array<{
        id: string;
        title: string;
        category: string;
        date: string;
      }>;
      achievements: Array<{
        id: string;
        title: string;
        description: string;
        date: string;
      }>;
    };
    timeline: Array<{
      id: string;
      type: string;
      title: string;
      description: string;
      date: string;
    }>;
    dailyMissions: {
      completed: number;
      total: number;
      history: Array<{
        date: string;
        missionsCompleted: string[];
      }>;
    };
    xpAndLevel: {
      totalXP: number;
      currentLevel: number;
      earnedBadges: string[];
    };
  };
  consentInfo: {
    termsAgreed: boolean;
    privacyAgreed: boolean;
    marketingAgreed: boolean;
    agreedAt: string;
    lastUpdatedAt: string;
  };
  metadata: {
    signedUpAt: string;
    lastLoginAt: string;
    accountStatus: 'active' | 'inactive' | 'suspended';
  };
};

const RIASEC_HISTORY_MAX = 20;

const KEYS = {
  AUTH_PROFILE: 'dreampath_auth_profile',
  USER_PROFILE: 'dreampath_user_profile',
  RIASEC_RESULT: 'dreampath_riasec_result',
  RIASEC_HISTORY: 'dreampath_riasec_history',
  /** 서버 `QuizResult` UUID — 리포트 복원용 */
  LAST_QUIZ_RESULT_ID: 'dreampath_last_quiz_result_id',
  SWIPE_LOGS: 'dreampath_swipe_logs',
  SIMULATION_LOGS: 'dreampath_simulation_logs',
  XP_LOG: 'dreampath_xp_log',
  KINGDOM_PROGRESS: 'dreampath_kingdom_progress',
  CAREER_PATHS: 'dreampath_career_paths',
  CLUE_TEAMS: 'dreampath_clue_teams',
  PORTFOLIO: 'dreampath_portfolio',
  TIMELINE: 'dreampath_timeline',
  DAILY_MISSIONS: 'dreampath_daily_missions',
  EARNED_BADGES: 'dreampath_earned_badges',
  FAVORITE_JOBS: 'dreampath_favorite_jobs',
  QA_POSTS: 'dreampath_qa_posts',
  RECRUIT_POSTS: 'dreampath_recruit_posts',
  CAMP_PROGRESS: 'dreampath_camp_progress',
} as const;

// ============================
// Generic Helpers
// ============================
function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('localStorage setItem error:', e);
  }
}

// ============================
// Auth Profile (회원가입 완료 후 프로필/약관)
// ============================
export function getAuthProfile(): AuthProfile | null {
  return getItem<AuthProfile | null>(KEYS.AUTH_PROFILE, null);
}

export function setAuthProfile(profile: AuthProfile): void {
  setItem(KEYS.AUTH_PROFILE, profile);
}

export function clearAuthProfile(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(KEYS.AUTH_PROFILE);
  } catch {
    // ignore
  }
}

// ============================
// User Profile
// ============================
export function getUserProfile(): UserProfile | null {
  return getItem<UserProfile | null>(KEYS.USER_PROFILE, null);
}

export function setUserProfile(profile: UserProfile): void {
  setItem(KEYS.USER_PROFILE, profile);
}

export function isOnboardingCompleted(): boolean {
  const profile = getUserProfile();
  return profile?.onboardingCompleted ?? false;
}

// ============================
// RIASEC Result (localStorage: dreampath_riasec_result, dreampath_riasec_history)
// ============================
export function getRIASECResult(): RIASECResult | null {
  return getItem<RIASECResult | null>(KEYS.RIASEC_RESULT, null);
}

export function getRiasecHistory(): RIASECResult[] {
  return getItem<RIASECResult[]>(KEYS.RIASEC_HISTORY, []);
}

export function setRIASECResult(result: RIASECResult): void {
  const previous = getItem<RIASECResult | null>(KEYS.RIASEC_RESULT, null);
  if (previous) {
    const history = getRiasecHistory();
    const nextHistory = [previous, ...history].slice(0, RIASEC_HISTORY_MAX);
    setItem(KEYS.RIASEC_HISTORY, nextHistory);
  }
  setItem(KEYS.RIASEC_RESULT, result);

  const portfolio = getItem<Portfolio>(KEYS.PORTFOLIO, {
    riasecSummary: null,
    exploredJobs: [],
    completedSims: [],
    completedCamps: [],
    projects: [],
    earnedBadges: [],
    timeline: [],
  });
  setItem(KEYS.PORTFOLIO, { ...portfolio, riasecSummary: result });
}

/** 적성 검사 재시작 등: 현재 결과만 제거(이력 키는 유지). 포트폴리오 요약도 비움 */
export function clearRIASECResult(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(KEYS.RIASEC_RESULT);
    clearLastQuizResultId();
    const portfolio = getPortfolio();
    setItem(KEYS.PORTFOLIO, { ...portfolio, riasecSummary: null });
  } catch (e) {
    console.error('clearRIASECResult error:', e);
  }
}

export function getLastQuizResultId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEYS.LAST_QUIZ_RESULT_ID);
    return raw && raw.length > 0 ? raw : null;
  } catch {
    return null;
  }
}

export function setLastQuizResultId(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEYS.LAST_QUIZ_RESULT_ID, id);
  } catch {
    // ignore
  }
}

export function clearLastQuizResultId(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(KEYS.LAST_QUIZ_RESULT_ID);
  } catch {
    // ignore
  }
}

// ============================
// Swipe Logs
// ============================
export function getSwipeLogs(): SwipeLog[] {
  return getItem<SwipeLog[]>(KEYS.SWIPE_LOGS, []);
}

export function addSwipeLog(log: SwipeLog): void {
  const logs = getSwipeLogs();
  logs.push(log);
  setItem(KEYS.SWIPE_LOGS, logs);
}

export function getLikedJobs(): string[] {
  return getSwipeLogs()
    .filter((l) => l.action === 'like' || l.action === 'superlike')
    .map((l) => l.jobId);
}

// ============================
// Simulation Logs
// ============================
export function getSimulationLogs(): SimulationLog[] {
  return getItem<SimulationLog[]>(KEYS.SIMULATION_LOGS, []);
}

export function addSimulationLog(log: SimulationLog): void {
  const logs = getSimulationLogs();
  logs.push(log);
  setItem(KEYS.SIMULATION_LOGS, logs);
}

// ============================
// XP & Level System
// ============================
export function getXPLog(): XPLog {
  return getItem<XPLog>(KEYS.XP_LOG, { totalXP: 0, level: 1, history: [] });
}

export function addXP(amount: number, action: string, source: string): XPLog {
  const log = getXPLog();
  log.totalXP += amount;
  log.history.push({
    action,
    xp: amount,
    date: new Date().toISOString(),
    source,
  });

  // Calculate level based on XP thresholds
  if (log.totalXP >= 5500) log.level = 6;
  else if (log.totalXP >= 3300) log.level = 5;
  else if (log.totalXP >= 1800) log.level = 4;
  else if (log.totalXP >= 800) log.level = 3;
  else if (log.totalXP >= 300) log.level = 2;
  else log.level = 1;

  setItem(KEYS.XP_LOG, log);
  return log;
}

// ============================
// Kingdom Progress
// ============================
export function getKingdomProgress(): KingdomProgress {
  return getItem<KingdomProgress>(KEYS.KINGDOM_PROGRESS, {});
}

export function updateKingdomProgress(
  kingdomId: string,
  update: Partial<KingdomProgress[string]>
): void {
  const progress = getKingdomProgress();
  const current = progress[kingdomId] || {
    entered: false,
    jobsExplored: [],
    simCompleted: [],
    weekCampCompleted: [],
    level: 'none' as const,
  };
  progress[kingdomId] = { ...current, ...update };
  setItem(KEYS.KINGDOM_PROGRESS, progress);
}

export function markKingdomEntered(kingdomId: string): void {
  const progress = getKingdomProgress();
  if (!progress[kingdomId]?.entered) {
    updateKingdomProgress(kingdomId, {
      entered: true,
      firstEnteredAt: new Date().toISOString(),
    });
  }
}

export function addJobExplored(kingdomId: string, jobId: string): void {
  const progress = getKingdomProgress();
  const current = progress[kingdomId] || {
    entered: true,
    jobsExplored: [],
    simCompleted: [],
    weekCampCompleted: [],
    level: 'none' as const,
  };
  if (!current.jobsExplored.includes(jobId)) {
    current.jobsExplored.push(jobId);
    // Update kingdom level based on exploration count
    const count = current.jobsExplored.length;
    if (count >= 20) current.level = 'ambassador';
    else if (count >= 10) current.level = 'master';
    else if (count >= 5) current.level = 'explorer';
    else if (count >= 1) current.level = 'newcomer';
    progress[kingdomId] = current;
    setItem(KEYS.KINGDOM_PROGRESS, progress);
  }
}

// ============================
// Career Paths
// ============================
export function getSavedCareerPaths(): SavedCareerPath[] {
  return getItem<SavedCareerPath[]>(KEYS.CAREER_PATHS, []);
}

export function saveCareerPath(path: SavedCareerPath): void {
  const paths = getSavedCareerPaths();
  const index = paths.findIndex((p) => p.jobId === path.jobId);
  if (index >= 0) {
    paths[index] = path;
  } else {
    paths.push(path);
  }
  setItem(KEYS.CAREER_PATHS, paths);
}

// ============================
// Clue Teams
// ============================
export function getClueTeams(): ClueTeam[] {
  return getItem<ClueTeam[]>(KEYS.CLUE_TEAMS, []);
}

export function saveClueTeam(team: ClueTeam): void {
  const teams = getClueTeams();
  const index = teams.findIndex((t) => t.id === team.id);
  if (index >= 0) {
    teams[index] = team;
  } else {
    teams.push(team);
  }
  setItem(KEYS.CLUE_TEAMS, teams);
}

// ============================
// Portfolio
// ============================
export function getPortfolio(): Portfolio {
  return getItem<Portfolio>(KEYS.PORTFOLIO, {
    riasecSummary: null,
    exploredJobs: [],
    completedSims: [],
    completedCamps: [],
    projects: [],
    earnedBadges: [],
    timeline: [],
  });
}

export function updatePortfolio(update: Partial<Portfolio>): void {
  const portfolio = getPortfolio();
  setItem(KEYS.PORTFOLIO, { ...portfolio, ...update });
}

// ============================
// Timeline
// ============================
export function getTimeline(): TimelineEvent[] {
  return getItem<TimelineEvent[]>(KEYS.TIMELINE, []);
}

export function addTimelineEvent(event: TimelineEvent): void {
  const timeline = getTimeline();
  timeline.unshift(event);
  setItem(KEYS.TIMELINE, timeline);
}

// ============================
// Daily Missions
// ============================
export function getDailyMissions(): DailyMission[] {
  return getItem<DailyMission[]>(KEYS.DAILY_MISSIONS, []);
}

export function setDailyMissions(missions: DailyMission[]): void {
  setItem(KEYS.DAILY_MISSIONS, missions);
}

// ============================
// Badges
// ============================
export function getEarnedBadges(): string[] {
  return getItem<string[]>(KEYS.EARNED_BADGES, []);
}

export function earnBadge(badgeId: string): boolean {
  const badges = getEarnedBadges();
  if (badges.includes(badgeId)) return false;
  badges.push(badgeId);
  setItem(KEYS.EARNED_BADGES, badges);
  return true;
}

// ============================
// Favorite Jobs
// ============================
export function getFavoriteJobs(): string[] {
  return getItem<string[]>(KEYS.FAVORITE_JOBS, []);
}

export function toggleFavoriteJob(jobId: string): boolean {
  const favs = getFavoriteJobs();
  const index = favs.indexOf(jobId);
  if (index >= 0) {
    favs.splice(index, 1);
    setItem(KEYS.FAVORITE_JOBS, favs);
    return false; // removed
  } else {
    favs.push(jobId);
    setItem(KEYS.FAVORITE_JOBS, favs);
    return true; // added
  }
}

// ============================
// QA Posts
// ============================
export function getQAPosts(): QAPost[] {
  return getItem<QAPost[]>(KEYS.QA_POSTS, []);
}

export function addQAPost(post: QAPost): void {
  const posts = getQAPosts();
  posts.unshift(post);
  setItem(KEYS.QA_POSTS, posts);
}

export function updateQAPost(post: QAPost): void {
  const posts = getQAPosts();
  const index = posts.findIndex((p) => p.id === post.id);
  if (index >= 0) {
    posts[index] = post;
    setItem(KEYS.QA_POSTS, posts);
  }
}

// ============================
// Recruit Posts
// ============================
export function getRecruitPosts(): RecruitPost[] {
  return getItem<RecruitPost[]>(KEYS.RECRUIT_POSTS, []);
}

export function addRecruitPost(post: RecruitPost): void {
  const posts = getRecruitPosts();
  posts.unshift(post);
  setItem(KEYS.RECRUIT_POSTS, posts);
}

// ============================
// Camp Progress
// ============================
export function getCampProgress(): Record<string, number[]> {
  return getItem<Record<string, number[]>>(KEYS.CAMP_PROGRESS, {});
}

export function completeCampDay(jobId: string, day: number): void {
  const progress = getCampProgress();
  if (!progress[jobId]) progress[jobId] = [];
  if (!progress[jobId].includes(day)) {
    progress[jobId].push(day);
  }
  setItem(KEYS.CAMP_PROGRESS, progress);
}

// ============================
// Data Reset
// ============================
export function resetAllData(): void {
  if (typeof window === 'undefined') return;
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}

// ============================
// Organized API Export
// ============================
export const storage = {
  auth: {
    get: getAuthProfile,
    set: setAuthProfile,
    clear: clearAuthProfile,
  },
  user: {
    get: getUserProfile,
    set: setUserProfile,
    isOnboardingCompleted,
  },
  riasec: {
    get: getRIASECResult,
    set: setRIASECResult,
    getHistory: getRiasecHistory,
    clear: clearRIASECResult,
  },
  quiz: {
    getLastResultId: getLastQuizResultId,
    setLastResultId: setLastQuizResultId,
    clearLastResultId: clearLastQuizResultId,
  },
  swipes: {
    getAll: getSwipeLogs,
    add: addSwipeLog,
    getLiked: getLikedJobs,
  },
  simulations: {
    getAll: getSimulationLogs,
    add: addSimulationLog,
  },
  xp: {
    get: getXPLog,
    add: addXP,
  },
  kingdoms: {
    getProgress: getKingdomProgress,
    update: updateKingdomProgress,
    markEntered: markKingdomEntered,
    addJobExplored,
  },
  careerPaths: {
    getAll: getSavedCareerPaths,
    save: saveCareerPath,
  },
  clueTeams: {
    getAll: getClueTeams,
    save: saveClueTeam,
  },
  portfolio: {
    get: getPortfolio,
    update: updatePortfolio,
  },
  timeline: {
    getAll: getTimeline,
    add: addTimelineEvent,
  },
  missions: {
    get: getDailyMissions,
    set: setDailyMissions,
  },
  badges: {
    getAll: getEarnedBadges,
    earn: earnBadge,
  },
  favorites: {
    getAll: getFavoriteJobs,
    toggle: toggleFavoriteJob,
  },
  qa: {
    getAll: getQAPosts,
    add: addQAPost,
    update: updateQAPost,
  },
  recruit: {
    getAll: getRecruitPosts,
    add: addRecruitPost,
  },
  camp: {
    getProgress: getCampProgress,
    completeDay: completeCampDay,
  },
  reset: resetAllData,
};
