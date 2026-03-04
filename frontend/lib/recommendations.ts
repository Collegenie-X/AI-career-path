import type { Job, RIASECScores, SwipeLog } from './types';
import { cosineSimilarity } from './riasec';

// Behavior-weighted recommendation engine
export function getRecommendedJobs(
  userScores: RIASECScores | null,
  jobs: Job[],
  swipeLogs: SwipeLog[],
  favoriteJobs: string[],
  limit: number = 20
): { job: Job; score: number; reason: string }[] {
  if (!userScores) {
    // No RIASEC result yet, return random selection
    return jobs
      .sort(() => Math.random() - 0.5)
      .slice(0, limit)
      .map((job) => ({ job, score: 50, reason: '새로운 직업을 발견해보세요!' }));
  }

  const swipedJobIds = new Set(swipeLogs.map((l) => l.jobId));
  const likedJobIds = new Set(
    swipeLogs.filter((l) => l.action === 'like' || l.action === 'superlike').map((l) => l.jobId)
  );

  // Calculate composite scores
  const scored = jobs
    .filter((job) => !swipedJobIds.has(job.id)) // Exclude already swiped
    .map((job) => {
      // Base RIASEC similarity (0~1)
      const riasecScore = cosineSimilarity(userScores, job.riasecProfile);

      // Behavior bonus: if user liked similar jobs, boost
      let behaviorBonus = 0;
      for (const likedJobId of likedJobIds) {
        const likedJob = jobs.find((j) => j.id === likedJobId);
        if (likedJob) {
          const similarity = cosineSimilarity(likedJob.riasecProfile, job.riasecProfile);
          behaviorBonus += similarity * 0.15;
        }
      }

      // Favorite bonus
      const favoriteBonus = favoriteJobs.includes(job.id) ? 0.1 : 0;

      // Diversity penalty (reduce same kingdom overrepresentation)
      const sameKingdomCount = [...likedJobIds].filter(
        (id) => jobs.find((j) => j.id === id)?.kingdomId === job.kingdomId
      ).length;
      const diversityPenalty = sameKingdomCount * 0.03;

      const totalScore = Math.min(
        1,
        riasecScore * 0.6 + behaviorBonus + favoriteBonus - diversityPenalty
      );

      // Determine reason
      let reason = '당신의 적성과 잘 맞아요!';
      if (totalScore > 0.85) reason = '최고의 매칭! 꼭 살펴보세요';
      else if (behaviorBonus > 0.1) reason = '관심 직업과 비슷해요';
      else if (totalScore < 0.5) reason = '새로운 분야를 탐험해보세요';

      return {
        job,
        score: Math.round(totalScore * 100),
        reason,
      };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}

// Get daily recommended job
export function getDailyRecommendation(
  userScores: RIASECScores | null,
  jobs: Job[],
  exploredJobs: string[]
): { job: Job; reason: string } | null {
  if (jobs.length === 0) return null;

  const unexplored = jobs.filter((j) => !exploredJobs.includes(j.id));
  const pool = unexplored.length > 0 ? unexplored : jobs;

  if (!userScores) {
    const random = pool[Math.floor(Math.random() * pool.length)];
    return { job: random, reason: '오늘의 추천 직업을 만나보세요!' };
  }

  const scored = pool
    .map((job) => ({
      job,
      similarity: cosineSimilarity(userScores, job.riasecProfile),
    }))
    .sort((a, b) => b.similarity - a.similarity);

  // Pick from top 3 randomly for variety
  const topPick = scored[Math.floor(Math.random() * Math.min(3, scored.length))];
  return {
    job: topPick.job,
    reason: topPick.similarity > 0.7 ? '당신에게 딱 맞는 직업이에요!' : '새로운 가능성을 발견해보세요',
  };
}
