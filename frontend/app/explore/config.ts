/**
 * 별자리 탐험(/explore) — 라벨·문구 (API 로딩/오류 포함)
 */
export const EXPLORE_CAREER_LABELS = {
  loading_title: '불러오는 중',
  loading_sub: '직업 세계 정보를 가져오고 있어요',
  error_title: '불러오지 못했어요',
  error_sub: '네트워크를 확인한 뒤 다시 시도해 주세요',
  retry: '다시 시도',
  kingdom_not_found_title: '별을 찾을 수 없어요',
  kingdom_not_found_sub: '목록으로 돌아가 다른 별을 선택해 주세요',
  back_to_list: '별 목록으로',
} as const;
