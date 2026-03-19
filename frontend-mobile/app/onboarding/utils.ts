import { COLOR_PALETTE, ICON_MAP, LABELS } from './config';
import type { OnboardingSlideData, ResolvedSlide } from './types';

/**
 * JSON 슬라이드 데이터를 config의 색상·라벨·아이콘으로 resolve합니다.
 */
export function resolveSlides(rawSlides: OnboardingSlideData[]): ResolvedSlide[] {
  return rawSlides.map((raw) => {
    const palette = COLOR_PALETTE[raw.colorKey] ?? COLOR_PALETTE.purple;

    const steps = raw.steps?.map((s) => ({
      emoji: s.emoji,
      label: LABELS[s.labelKey] ?? s.labelKey,
    }));

    return {
      id: raw.id,
      color: palette.base,
      colorLight: palette.light,
      title: LABELS[raw.titleKey] ?? raw.titleKey,
      subtitle: LABELS[raw.subtitleKey] ?? raw.subtitleKey,
      description: LABELS[raw.descriptionKey] ?? raw.descriptionKey,
      iconKey: raw.iconKey,
      floatingIcons: raw.floatingIcons,
      steps,
    };
  });
}

/**
 * 아이콘 key를 Lucide 컴포넌트로 변환합니다.
 */
export { ICON_MAP };
