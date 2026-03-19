import { storage } from './storage';
import badgesData from '@/data/badges.json';
import type { Badge } from './types';

const badges = badgesData as unknown as Badge[];

export interface BadgeCheckResult {
  badgeId: string;
  earned: boolean;
  isNew: boolean;
}

/**
 * 뱃지 획득 조건을 체크하고 자동으로 획득 처리
 */
export function checkAndAwardBadges(): BadgeCheckResult[] {
  const results: BadgeCheckResult[] = [];
  const earnedBadges = storage.badges.getAll();
  
  const riasecResult = storage.riasec.get();
  const swipeLogs = storage.swipes.getAll();
  const simulations = storage.simulations.getAll();
  const kingdomProgress = storage.kingdoms.getProgress();
  const careerPaths = storage.careerPaths.getAll();
  const clueTeams = storage.clueTeams.getAll();
  
  const visitedKingdoms = Object.values(kingdomProgress).filter(k => k.entered).length;
  const exploredJobsCount = swipeLogs.length;
  
  badges.forEach(badge => {
    const alreadyEarned = earnedBadges.includes(badge.id);
    let shouldEarn = false;
    
    switch (badge.id) {
      case 'first-quiz':
        shouldEarn = riasecResult !== null;
        break;
      case 'first-swipe':
        shouldEarn = swipeLogs.length >= 1;
        break;
      case 'kingdom-visitor':
        shouldEarn = visitedKingdoms >= 1;
        break;
      case 'explorer-3':
        shouldEarn = exploredJobsCount >= 3;
        break;
      case 'explorer-10':
        shouldEarn = exploredJobsCount >= 10;
        break;
      case 'first-sim':
        shouldEarn = simulations.length >= 1;
        break;
      case 'sim-master':
        shouldEarn = simulations.length >= 5;
        break;
      case 'camp-complete':
        const campProgress = storage.camp.getProgress();
        const completedCamps = Object.values(campProgress).filter(days => days.length >= 7);
        shouldEarn = completedCamps.length >= 1;
        break;
      case 'path-starter':
        shouldEarn = careerPaths.length >= 1;
        break;
      case 'clue-formed':
        shouldEarn = clueTeams.length >= 1;
        break;
      case 'project-deploy':
        const deployedProjects = clueTeams.filter(
          team => team.project.stage === 'deployment' && team.project.deployUrl
        );
        shouldEarn = deployedProjects.length >= 1;
        break;
      case 'all-kingdoms':
        shouldEarn = visitedKingdoms >= 8;
        break;
    }
    
    if (shouldEarn && !alreadyEarned) {
      const wasNew = storage.badges.earn(badge.id);
      if (wasNew) {
        storage.xp.add(badge.xpReward, `배지 획득: ${badge.name}`, 'badge');
        storage.timeline.add({
          id: `badge-${badge.id}-${Date.now()}`,
          type: 'badge',
          title: `🏅 배지 획득!`,
          description: `"${badge.name}" 배지를 획득했습니다!`,
          date: new Date().toISOString(),
          xp: badge.xpReward,
        });
      }
      results.push({ badgeId: badge.id, earned: true, isNew: wasNew });
    } else {
      results.push({ badgeId: badge.id, earned: alreadyEarned, isNew: false });
    }
  });
  
  return results;
}

/**
 * 특정 뱃지의 진행률 계산
 */
export function getBadgeProgress(badgeId: string): { current: number; required: number; percentage: number } {
  const swipeLogs = storage.swipes.getAll();
  const simulations = storage.simulations.getAll();
  const kingdomProgress = storage.kingdoms.getProgress();
  const visitedKingdoms = Object.values(kingdomProgress).filter(k => k.entered).length;
  
  switch (badgeId) {
    case 'explorer-3':
      return { current: swipeLogs.length, required: 3, percentage: Math.min((swipeLogs.length / 3) * 100, 100) };
    case 'explorer-10':
      return { current: swipeLogs.length, required: 10, percentage: Math.min((swipeLogs.length / 10) * 100, 100) };
    case 'sim-master':
      return { current: simulations.length, required: 5, percentage: Math.min((simulations.length / 5) * 100, 100) };
    case 'all-kingdoms':
      return { current: visitedKingdoms, required: 8, percentage: Math.min((visitedKingdoms / 8) * 100, 100) };
    default:
      return { current: 0, required: 1, percentage: 0 };
  }
}

/**
 * 뱃지 효과 적용 (XP 부스트 계산)
 */
export function calculateXPBoost(baseXP: number, source: string): number {
  const earnedBadges = storage.badges.getAll();
  const badgeList = badges.filter(b => earnedBadges.includes(b.id));
  
  let totalBoost = 0;
  
  badgeList.forEach(badge => {
    if (badge.effect.type === 'xp_boost') {
      const boostValue = Number(badge.effect.value);
      
      if (badge.category === 'special') {
        totalBoost += boostValue;
      } else if (badge.category === 'exploration' && source === 'exploration') {
        totalBoost += boostValue;
      } else if (badge.category === 'simulation' && source === 'simulation') {
        totalBoost += boostValue;
      }
    }
  });
  
  return Math.floor(baseXP * (1 + totalBoost / 100));
}

/**
 * 다음 획득 가능한 뱃지 추천
 */
export function getNextBadgeSuggestions(limit = 3): Badge[] {
  const earnedBadges = storage.badges.getAll();
  const unearnedBadges = badges.filter(b => !earnedBadges.includes(b.id));
  
  return unearnedBadges
    .map(badge => {
      const progress = getBadgeProgress(badge.id);
      return { badge, progress: progress.percentage };
    })
    .sort((a, b) => b.progress - a.progress)
    .slice(0, limit)
    .map(item => item.badge);
}
