import levelsData from '@/data/levels.json';
import type { LevelDefinition } from './types';

const levels = levelsData as LevelDefinition[];

export function getLevelInfo(level: number): LevelDefinition {
  return levels.find((l) => l.level === level) || levels[0];
}

export function getLevelForXP(xp: number): LevelDefinition {
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].minXP) return levels[i];
  }
  return levels[0];
}

export function getXPProgress(xp: number): { current: number; max: number; percentage: number } {
  const level = getLevelForXP(xp);
  const current = xp - level.minXP;
  const max = level.maxXP - level.minXP;
  const percentage = Math.min(100, Math.round((current / max) * 100));
  return { current, max, percentage };
}

export function isFeatureUnlocked(level: number, feature: string): boolean {
  for (const l of levels) {
    if (l.level <= level && l.unlocks.includes(feature)) {
      return true;
    }
  }
  return false;
}

export function getNextLevelXP(currentXP: number): number {
  const currentLevel = getLevelForXP(currentXP);
  const nextLevel = levels.find((l) => l.level === currentLevel.level + 1);
  if (!nextLevel) return 0;
  return nextLevel.minXP - currentXP;
}

// XP rewards for different actions
export const XP_REWARDS = {
  COMPLETE_QUIZ: 200,
  SWIPE_CARD: 5,
  VIEW_JOB_DETAIL: 10,
  COMPLETE_SIMULATION: 100,
  COMPLETE_CAMP_DAY: 30,
  COMPLETE_CAMP: 200,
  START_CAREER_PATH: 50,
  FORM_CLUE_TEAM: 150,
  COMPLETE_KANBAN_CARD: 20,
  DEPLOY_PROJECT: 500,
  EARN_BADGE: 50,
  DAILY_MISSION: 25,
  ENTER_KINGDOM: 30,
  FAVORITE_JOB: 10,
  SALARY_GAME: 30,
} as const;
