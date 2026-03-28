import type { SharedPlan } from './types';

export type CommunityBrowseSortId = 'recent' | 'likes';

/** 학교 공간·그룹 상세에서 공유 패스 목록 검색·유형·정렬 */
export function filterSharedPlansForCommunityBrowse(
  plans: SharedPlan[],
  opts: {
    readonly shareTypeFilter: string;
    readonly searchQuery: string;
    readonly sortBy: CommunityBrowseSortId;
    readonly likeCounts: Record<string, number>;
  },
): SharedPlan[] {
  let result = [...plans];
  if (opts.shareTypeFilter !== 'all') {
    result = result.filter((p) => p.shareType === opts.shareTypeFilter);
  }
  const q = opts.searchQuery.trim().toLowerCase();
  if (q) {
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.ownerName.toLowerCase().includes(q) ||
        p.jobName.toLowerCase().includes(q),
    );
  }
  if (opts.sortBy === 'likes') {
    result.sort((a, b) => (opts.likeCounts[b.id] ?? b.likes) - (opts.likeCounts[a.id] ?? a.likes));
  } else {
    result.sort((a, b) => new Date(b.sharedAt).getTime() - new Date(a.sharedAt).getTime());
  }
  return result;
}
