/**
 * 커리어 패스 타임라인 재사용 컴포넌트 타입 정의
 */

export type CareerPathTimelineMilestone = {
  period: string;
  semester: string;
  icon: string;
  title: string;
  activities: string[];
  awards?: string[];
  setak?: string;
  achievement: string;
  cost?: string;
};

export type CareerPathTimelineSummary = {
  title: string;
  totalYears: string;
  totalCost: string;
};

export type CareerPathTimelineTheme = {
  /** 타임라인 라인·아이콘 테두리 색 (glowing blue) */
  accentColor: string;
  /** 비용 아이콘 색 (gold) */
  costColor: string;
  /** 성공/체크마크 색 (green) */
  successColor: string;
  /** 세특 포인트 박스 배경/테두리 */
  setakBgColor: string;
  setakBorderColor: string;
  setakLabelColor: string;
};

export const CAREER_PATH_TIMELINE_DEFAULT_THEME: CareerPathTimelineTheme = {
  accentColor: '#38bdf8',
  costColor: '#fbbf24',
  successColor: '#22c55e',
  setakBgColor: 'rgba(108,92,231,0.12)',
  setakBorderColor: 'rgba(108,92,231,0.4)',
  setakLabelColor: '#a78bfa',
};
