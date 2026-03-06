import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile, RIASECResult, XPLog } from './types';
import type { CareerPlan } from '../config/career-path';

const KEYS = {
  USER_PROFILE: 'dreampath_user_profile',
  RIASEC_RESULT: 'dreampath_riasec_result',
  XP_LOG: 'dreampath_xp_log',
  EARNED_BADGES: 'dreampath_earned_badges',
  FAVORITE_JOBS: 'dreampath_favorite_jobs',
  CAREER_PLANS: 'career_plans',
} as const;

async function getItem<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const item = await AsyncStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('AsyncStorage setItem error:', error);
  }
}

export const storage = {
  user: {
    get: () => getItem<UserProfile | null>(KEYS.USER_PROFILE, null),
    set: (profile: UserProfile) => setItem(KEYS.USER_PROFILE, profile),
  },
  riasec: {
    get: () => getItem<RIASECResult | null>(KEYS.RIASEC_RESULT, null),
    set: (result: RIASECResult) => setItem(KEYS.RIASEC_RESULT, result),
  },
  xp: {
    get: () => getItem<XPLog>(KEYS.XP_LOG, { totalXP: 0, level: 1, history: [] }),
    add: async (amount: number, action: string, source: string): Promise<XPLog> => {
      const log = await getItem<XPLog>(KEYS.XP_LOG, { totalXP: 0, level: 1, history: [] });
      log.totalXP += amount;
      log.history.push({ action, xp: amount, date: new Date().toISOString(), source });

      if (log.totalXP >= 5500) log.level = 6;
      else if (log.totalXP >= 3300) log.level = 5;
      else if (log.totalXP >= 1800) log.level = 4;
      else if (log.totalXP >= 800) log.level = 3;
      else if (log.totalXP >= 300) log.level = 2;
      else log.level = 1;

      await setItem(KEYS.XP_LOG, log);
      return log;
    },
  },
  badges: {
    getAll: () => getItem<string[]>(KEYS.EARNED_BADGES, []),
    earn: async (badgeId: string): Promise<boolean> => {
      const badges = await getItem<string[]>(KEYS.EARNED_BADGES, []);
      if (badges.includes(badgeId)) return false;
      badges.push(badgeId);
      await setItem(KEYS.EARNED_BADGES, badges);
      return true;
    },
  },
  favorites: {
    getAll: () => getItem<string[]>(KEYS.FAVORITE_JOBS, []),
    toggle: async (jobId: string): Promise<boolean> => {
      const favs = await getItem<string[]>(KEYS.FAVORITE_JOBS, []);
      const index = favs.indexOf(jobId);
      if (index >= 0) {
        favs.splice(index, 1);
        await setItem(KEYS.FAVORITE_JOBS, favs);
        return false;
      }
      favs.push(jobId);
      await setItem(KEYS.FAVORITE_JOBS, favs);
      return true;
    },
  },
  careerPlans: {
    get: () => getItem<CareerPlan[]>(KEYS.CAREER_PLANS, []),
    set: (plans: CareerPlan[]) => setItem(KEYS.CAREER_PLANS, plans),
    save: async (plan: CareerPlan): Promise<CareerPlan[]> => {
      const plans = await getItem<CareerPlan[]>(KEYS.CAREER_PLANS, []);
      const existingIndex = plans.findIndex((p) => p.id === plan.id);
      const updated = existingIndex >= 0
        ? plans.map((p, i) => (i === existingIndex ? plan : p))
        : [...plans, plan];
      await setItem(KEYS.CAREER_PLANS, updated);
      return updated;
    },
    remove: async (planId: string): Promise<CareerPlan[]> => {
      const plans = await getItem<CareerPlan[]>(KEYS.CAREER_PLANS, []);
      const updated = plans.filter((p) => p.id !== planId);
      await setItem(KEYS.CAREER_PLANS, updated);
      return updated;
    },
  },
  reset: async () => {
    const keys = Object.values(KEYS);
    await AsyncStorage.multiRemove(keys);
  },
  // 개발용: 온보딩 상태만 리셋
  resetOnboarding: async () => {
    await AsyncStorage.removeItem(KEYS.USER_PROFILE);
    await AsyncStorage.removeItem(KEYS.RIASEC_RESULT);
  },
};
