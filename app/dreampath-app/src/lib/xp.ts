import levelsData from '../data/levels.json';
import type { LevelDefinition } from './types';

const levels = levelsData as LevelDefinition[];

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

export const XP_REWARDS = {
  COMPLETE_QUIZ: 200,
  SWIPE_CARD: 5,
  VIEW_JOB_DETAIL: 10,
  COMPLETE_SIMULATION: 100,
  COMPLETE_CAMP_DAY: 30,
  COMPLETE_CAMP: 200,
  START_CAREER_PATH: 50,
  EARN_BADGE: 50,
  DAILY_MISSION: 25,
  ENTER_KINGDOM: 30,
  FAVORITE_JOB: 10,
} as const;
