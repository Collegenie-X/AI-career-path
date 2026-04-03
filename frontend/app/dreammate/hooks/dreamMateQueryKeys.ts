/** DreamMate React Query 캐시 키 — `useDreamMateRoadmapBackend` 와 동기화 */

export const DREAM_MATE_QUERY_KEYS = {
  authMe: ['dreammate', 'authMe'] as const,
  roadmapsMine: ['dreammate', 'roadmaps', 'mine'] as const,
  sharedDreamFeed: ['dreammate', 'sharedDreamRoadmaps', 'feed'] as const,
} as const;

export const DREAM_MATE_QUERY_STALE_MS = {
  roadmaps: 90_000,
  sharedFeed: 120_000,
  authMe: 300_000,
} as const;
