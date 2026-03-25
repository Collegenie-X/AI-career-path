import type { StarData } from '@/app/jobs/explore/types';

export const starJsonQueryKey = (kingdomId: string) => ['star-json', kingdomId] as const;

const STAR_JSON_LOADERS: Record<string, () => Promise<{ default: StarData }>> = {
  explore: () => import('@/data/stars/explore-star.json'),
  create: () => import('@/data/stars/create-star.json'),
  tech: () => import('@/data/stars/tech-star.json'),
  nature: () => import('@/data/stars/nature-star.json'),
  connect: () => import('@/data/stars/connect-star.json'),
  order: () => import('@/data/stars/order-star.json'),
  communicate: () => import('@/data/stars/communicate-star.json'),
  challenge: () => import('@/data/stars/challenge-star.json'),
};

/**
 * kingdom id(= 커리어 탐색 별 JSON 파일 키)에 해당하는 star JSON을 동적 import로 불러옵니다.
 * React Query `queryFn`에서 재사용합니다.
 */
export async function fetchStarJsonByKingdomId(kingdomId: string): Promise<StarData | null> {
  const loader = STAR_JSON_LOADERS[kingdomId];
  if (!loader) return null;
  try {
    const mod = await loader();
    return mod.default as StarData;
  } catch (e) {
    console.error('fetchStarJsonByKingdomId failed:', kingdomId, e);
    return null;
  }
}
