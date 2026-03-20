import type { CSSProperties } from 'react';

/** 경험·패스·실행 상단 통합 테두리 패널 (탭 + 히어로 + 본문) */
export const SECTION_SHELL_FRAME_STYLE: CSSProperties = {
  borderColor: 'rgba(255,255,255,0.12)',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
  boxShadow: '0 18px 50px rgba(0,0,0,0.4)',
};

/** 스티키 페이지 제목줄 배경 */
export const SECTION_STICKY_HEADER_SURFACE_STYLE: CSSProperties = {
  backgroundColor: 'rgba(10,10,30,0.92)',
  backdropFilter: 'blur(20px)',
};

/** 셸 내부 탭 네비게이션 래퍼 (career / dreammate / explore 공통) */
export const SECTION_SHELL_TAB_NAVIGATION_AREA_CLASS_NAME =
  'border-b border-white/[0.08] px-4 pt-4 pb-3 md:px-5 md:pt-5 md:pb-3.5';

export const SECTION_SHELL_TAB_NAVIGATION_AREA_STYLE: CSSProperties = {
  backgroundColor: 'rgba(255,255,255,0.02)',
};
