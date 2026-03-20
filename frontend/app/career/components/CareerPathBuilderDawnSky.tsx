'use client';

import { CAREER_PATH_BUILDER_DIALOG } from '../config';

/** 빌더 패널 내부: 새벽 하늘 그라데이션 + 네뷸라 + 반짝이는 별 (config 기반) */
export function CareerPathBuilderDawnSky() {
  const dialogTheme = CAREER_PATH_BUILDER_DIALOG;
  const starLayers = Array.from({ length: dialogTheme.starCount }, (_, starIndex) => {
    const positionXPercent = (starIndex * 149.3) % 100;
    const positionYPercent = (starIndex * 79.7 + starIndex * 17) % 100;
    const starSizePx = 1 + (starIndex % 2);
    const twinkleDelaySeconds = (starIndex * 0.31) % 3.5;
    const twinkleDurationSeconds = 1.6 + (starIndex % 6) * 0.28;
    const tintVariant = starIndex % 5;
    const starColorPrefix =
      tintVariant === 0
        ? 'rgba(255,230,255,'
        : tintVariant === 1
          ? 'rgba(190,220,255,'
          : tintVariant === 2
            ? 'rgba(255,255,255,'
            : tintVariant === 3
              ? 'rgba(200,180,255,'
              : 'rgba(255,200,240,';
    return {
      id: starIndex,
      positionXPercent,
      positionYPercent,
      starSizePx,
      twinkleDelaySeconds,
      twinkleDurationSeconds,
      starColorPrefix,
    };
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(168deg, ${dialogTheme.skyGradientTop} 0%, ${dialogTheme.skyGradientMid} 48%, ${dialogTheme.skyGradientBottom} 100%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.5] animate-nebula"
        style={{
          background: `radial-gradient(ellipse 85% 55% at 18% 12%, ${dialogTheme.nebulaGlowA}, transparent 58%),
            radial-gradient(ellipse 75% 50% at 88% 28%, ${dialogTheme.nebulaGlowB}, transparent 52%),
            radial-gradient(ellipse 70% 48% at 52% 92%, ${dialogTheme.nebulaGlowC}, transparent 48%)`,
        }}
      />
      <div
        className="absolute -inset-[40%] opacity-[0.05]"
        style={{
          background:
            'conic-gradient(from 120deg at 50% 50%, rgba(124,77,255,0.5), transparent, rgba(100,200,255,0.35), transparent, rgba(124,77,255,0.45))',
          animation: 'nebula-drift 28s ease-in-out infinite reverse',
        }}
      />
      {starLayers.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.positionXPercent}%`,
            top: `${star.positionYPercent}%`,
            width: star.starSizePx,
            height: star.starSizePx,
            background: `${star.starColorPrefix}0.45)`,
            boxShadow: `0 0 ${Math.max(2, star.starSizePx)}px ${star.starColorPrefix}0.3)`,
            animation: `twinkle-subtle ${star.twinkleDurationSeconds}s ease-in-out ${star.twinkleDelaySeconds}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
