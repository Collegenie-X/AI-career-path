// ─── 온보딩 도메인 타입 ───────────────────────────────────────

export interface OnboardingFloatingIcon {
  icon: string;
  x: string;
  y: string;
  size: number;
  delay: number;
}

export interface OnboardingStep {
  emoji: string;
  labelKey: string;
}

export interface OnboardingSlideData {
  id: string;
  colorKey: string;
  titleKey: string;
  subtitleKey: string;
  descriptionKey: string;
  iconKey: string;
  floatingIcons: OnboardingFloatingIcon[];
  steps?: OnboardingStep[];
}

// config에서 resolve된 최종 슬라이드 타입
export interface ResolvedSlide {
  id: string;
  color: string;
  colorLight: string;
  title: string;
  subtitle: string;
  description: string;
  iconKey: string;
  floatingIcons: OnboardingFloatingIcon[];
  steps?: Array<{ emoji: string; label: string }>;
}
