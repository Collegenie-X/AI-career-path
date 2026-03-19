'use client';

import { StepBadge } from './StepBadge';
import { ProcessSteps } from './ProcessSteps';
import type { ResolvedSlide } from '../types';

interface SlideContentProps {
  slide: ResolvedSlide;
  current: number;
  total: number;
}

export function SlideContent({ slide, current, total }: SlideContentProps) {
  return (
    <>
      <StepBadge
        current={current}
        total={total}
        color={slide.color}
        colorLight={slide.colorLight}
      />

      {/* Title */}
      <h2
        className="text-[1.7rem] font-extrabold text-white text-balance mb-3 animate-slide-up"
        key={`title-${current}`}
        style={{ animationDelay: '0.1s' }}
      >
        {slide.title}
      </h2>

      {/* Subtitle */}
      <p
        className="text-xs font-semibold uppercase tracking-widest mb-4 animate-slide-up"
        key={`sub-${current}`}
        style={{ color: slide.colorLight, animationDelay: '0.15s' }}
      >
        {slide.subtitle}
      </p>

      {/* Description */}
      <p
        className="text-base leading-relaxed whitespace-pre-line animate-slide-up"
        key={`desc-${current}`}
        style={{ color: 'rgba(255,255,255,0.6)', animationDelay: '0.2s' }}
      >
        {slide.description}
      </p>

      {/* Process Steps (슬라이드 3, 4) */}
      {slide.steps && slide.steps.length > 0 && (
        <ProcessSteps
          steps={slide.steps}
          color={slide.color}
          colorLight={slide.colorLight}
          slideIndex={current}
        />
      )}
    </>
  );
}
