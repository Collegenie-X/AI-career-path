/** 그룹(0) → 학교 공간(1) 방향으로 전환 시 슬라이드 방향 */
export const COMMUNITY_SUB_TAB_ORDER = { groups: 0, school: 1 } as const;

export function getCommunitySubTabSlideDirection(
  from: keyof typeof COMMUNITY_SUB_TAB_ORDER,
  to: keyof typeof COMMUNITY_SUB_TAB_ORDER,
): number {
  return COMMUNITY_SUB_TAB_ORDER[to] > COMMUNITY_SUB_TAB_ORDER[from] ? 1 : -1;
}

/** 콘텐츠 패널: 앞으로 갈 때 오른쪽에서 들어오고 이전 패널은 왼쪽으로 나감 */
export const communitySubTabContentVariants = {
  enter: (direction: number) => ({
    x: direction >= 0 ? 28 : -28,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction >= 0 ? -28 : 28,
    opacity: 0,
  }),
};

export const COMMUNITY_SUB_TAB_CONTENT_TRANSITION = {
  duration: 0.32,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

export const COMMUNITY_SUB_TAB_HIGHLIGHT_SPRING = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 34,
};
