import type { RIASECScores, RIASECType, StarData, StarJob } from './types';
import { calculateCosineSimilarity } from './riasec';

import connectStar from '../data/stars/connect-star.json';
import exploreStar from '../data/stars/explore-star.json';
import createStar from '../data/stars/create-star.json';
import techStar from '../data/stars/tech-star.json';

const ALL_STARS: StarData[] = [connectStar, exploreStar, createStar, techStar] as unknown as StarData[];

export interface RecommendedJob {
  job: StarJob;
  starName: string;
  starColor: string;
  score: number;
}

function buildJobRiasecProfile(hollandCode: string): RIASECScores {
  const profile: RIASECScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  const types = hollandCode.replace(/[^RIASEC+]/g, '').split('+');

  types.forEach((type, index) => {
    const key = type as RIASECType;
    if (key in profile) {
      profile[key] = index === 0 ? 1.0 : 0.6;
    }
  });

  return profile;
}

export function getRecommendedJobsFromStars(
  userScores: RIASECScores,
  limit: number = 5
): RecommendedJob[] {
  const allJobs: { job: StarJob; starName: string; starColor: string; profile: RIASECScores }[] = [];

  for (const star of ALL_STARS) {
    for (const job of star.jobs) {
      allJobs.push({
        job,
        starName: star.name,
        starColor: star.color ?? '#6C5CE7',
        profile: buildJobRiasecProfile(job.holland),
      });
    }
  }

  const scored = allJobs
    .map(({ job, starName, starColor, profile }) => {
      const similarity = calculateCosineSimilarity(userScores, profile);
      return {
        job,
        starName,
        starColor,
        score: Math.round(similarity * 100),
      };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}

export function getMatchingStarForType(topType: RIASECType): StarData | undefined {
  return ALL_STARS.find(
    (star) => (star as unknown as { riasecTypes?: string[] }).riasecTypes?.includes(topType)
  );
}

export function getAllStars(): StarData[] {
  return ALL_STARS;
}
