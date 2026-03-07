import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile, RIASECResult, XPLog } from './types';
import type { CareerPlan, CareerPathComment } from '../config/career-path';

const KEYS = {
  USER_PROFILE: 'dreampath_user_profile',
  RIASEC_RESULT: 'dreampath_riasec_result',
  XP_LOG: 'dreampath_xp_log',
  EARNED_BADGES: 'dreampath_earned_badges',
  FAVORITE_JOBS: 'dreampath_favorite_jobs',
  CAREER_PLANS: 'career_plans',
  CAREER_PATH_COMMENTS: 'career_path_comments',
  CAREER_PATH_LIKED_COMMENTS: 'career_path_liked_comments',
  CAREER_PATH_LIKED_TEMPLATES: 'career_path_liked_templates',
  CAREER_PATH_BOOKMARKED_TEMPLATES: 'career_path_bookmarked_templates',
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
  templateLikes: {
    getAll: () => getItem<string[]>(KEYS.CAREER_PATH_LIKED_TEMPLATES, []),
    toggle: async (templateId: string): Promise<{ liked: boolean; likedIds: string[] }> => {
      const ids = await getItem<string[]>(KEYS.CAREER_PATH_LIKED_TEMPLATES, []);
      const idx = ids.indexOf(templateId);
      if (idx >= 0) { ids.splice(idx, 1); } else { ids.push(templateId); }
      await setItem(KEYS.CAREER_PATH_LIKED_TEMPLATES, ids);
      return { liked: idx < 0, likedIds: ids };
    },
  },
  templateBookmarks: {
    getAll: () => getItem<string[]>(KEYS.CAREER_PATH_BOOKMARKED_TEMPLATES, []),
    toggle: async (templateId: string): Promise<{ bookmarked: boolean; bookmarkedIds: string[] }> => {
      const ids = await getItem<string[]>(KEYS.CAREER_PATH_BOOKMARKED_TEMPLATES, []);
      const idx = ids.indexOf(templateId);
      if (idx >= 0) { ids.splice(idx, 1); } else { ids.push(templateId); }
      await setItem(KEYS.CAREER_PATH_BOOKMARKED_TEMPLATES, ids);
      return { bookmarked: idx < 0, bookmarkedIds: ids };
    },
  },
  careerPathComments: {
    getByTemplate: async (templateId: string): Promise<CareerPathComment[]> => {
      const all = await getItem<CareerPathComment[]>(KEYS.CAREER_PATH_COMMENTS, []);
      return all.filter((c) => c.templateId === templateId).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    add: async (comment: CareerPathComment): Promise<CareerPathComment[]> => {
      const all = await getItem<CareerPathComment[]>(KEYS.CAREER_PATH_COMMENTS, []);
      const updated = [...all, comment];
      await setItem(KEYS.CAREER_PATH_COMMENTS, updated);
      return updated.filter((c) => c.templateId === comment.templateId).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    update: async (commentId: string, content: string): Promise<CareerPathComment[]> => {
      const all = await getItem<CareerPathComment[]>(KEYS.CAREER_PATH_COMMENTS, []);
      let templateId = '';
      const updated = all.map((c) => {
        if (c.id === commentId) {
          templateId = c.templateId;
          return { ...c, content, updatedAt: new Date().toISOString() };
        }
        return c;
      });
      await setItem(KEYS.CAREER_PATH_COMMENTS, updated);
      return updated.filter((c) => c.templateId === templateId).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    remove: async (commentId: string): Promise<CareerPathComment[]> => {
      const all = await getItem<CareerPathComment[]>(KEYS.CAREER_PATH_COMMENTS, []);
      const target = all.find((c) => c.id === commentId);
      const templateId = target?.templateId ?? '';
      const updated = all.filter((c) => c.id !== commentId);
      await setItem(KEYS.CAREER_PATH_COMMENTS, updated);
      return updated.filter((c) => c.templateId === templateId).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    toggleLike: async (commentId: string): Promise<{ liked: boolean; likedIds: string[] }> => {
      const likedIds = await getItem<string[]>(KEYS.CAREER_PATH_LIKED_COMMENTS, []);
      const idx = likedIds.indexOf(commentId);
      if (idx >= 0) {
        likedIds.splice(idx, 1);
      } else {
        likedIds.push(commentId);
      }
      await setItem(KEYS.CAREER_PATH_LIKED_COMMENTS, likedIds);

      const all = await getItem<CareerPathComment[]>(KEYS.CAREER_PATH_COMMENTS, []);
      const updated = all.map((c) => {
        if (c.id === commentId) {
          return { ...c, likes: idx >= 0 ? Math.max(0, c.likes - 1) : c.likes + 1 };
        }
        return c;
      });
      await setItem(KEYS.CAREER_PATH_COMMENTS, updated);
      return { liked: idx < 0, likedIds };
    },
    getLikedIds: () => getItem<string[]>(KEYS.CAREER_PATH_LIKED_COMMENTS, []),
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
