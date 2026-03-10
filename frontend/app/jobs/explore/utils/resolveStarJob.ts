/**
 * jobs.json 직업(kingdomId, id)이 stars 데이터에 존재하면
 * /jobs/explore 다이얼로그로 열 수 있는 URL을 반환합니다.
 * 없으면 null (기존 /jobs/[id] 페이지로 이동)
 */
import exploreStar from '@/data/stars/explore-star.json';
import createStar from '@/data/stars/create-star.json';
import techStar from '@/data/stars/tech-star.json';
import connectStar from '@/data/stars/connect-star.json';
import natureStar from '@/data/stars/nature-star.json';
import orderStar from '@/data/stars/order-star.json';
import communicateStar from '@/data/stars/communicate-star.json';
import challengeStar from '@/data/stars/challenge-star.json';

const ALL_STARS = [
  exploreStar,
  createStar,
  techStar,
  connectStar,
  natureStar,
  orderStar,
  communicateStar,
  challengeStar,
] as { id: string; jobs: { id: string }[] }[];

/**
 * @param jobId - 직업 id (jobs.json 또는 stars)
 * @param kingdomId - kingdom/star id (explore, create, tech 등)
 * @returns /jobs/explore?starId=X&jobId=Y 또는 null
 */
export function getExploreJobDialogUrl(
  jobId: string,
  kingdomId: string
): string | null {
  const star = ALL_STARS.find((s) => s.id === kingdomId);
  if (!star) return null;
  const hasJob = star.jobs.some((j) => j.id === jobId);
  if (!hasJob) return null;
  return `/jobs/explore?starId=${kingdomId}&jobId=${jobId}`;
}

/**
 * jobs.json Job의 kingdomId와 id로 explore 다이얼로그 URL 확인
 */
export function getJobDetailNav(
  jobId: string,
  kingdomId: string
): { type: 'dialog'; url: string } | { type: 'page'; url: string } {
  const dialogUrl = getExploreJobDialogUrl(jobId, kingdomId);
  if (dialogUrl) {
    return { type: 'dialog', url: dialogUrl };
  }
  return { type: 'page', url: `/jobs/${jobId}` };
}
