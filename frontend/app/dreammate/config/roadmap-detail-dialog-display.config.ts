/**
 * 로드맵 상세 — 인라인 패널에서 확대 시 표시되는 모달 너비 (px)
 */
export const ROADMAP_DETAIL_EXPAND_DIALOG_WIDTH_PX = 560 as const;

/**
 * `variant="dialog"` 를 document.body 로 포털할 때 — WebHeader(z-50) 및 레이아웃 flex 쌓임보다 위
 * (커리어 커뮤니티 SharedPlanDetailDialog 와 동일 대역)
 */
export const ROADMAP_DETAIL_PORTAL_Z_INDEX = 10050 as const;

/** RoadmapReportDialog 등 2단 모달 — 본문 포털보다 위 */
export const ROADMAP_DETAIL_NESTED_OVERLAY_Z_INDEX = 10060 as const;
