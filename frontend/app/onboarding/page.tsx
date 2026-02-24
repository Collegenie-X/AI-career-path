'use client';

import { useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

import onboardingData from '@/data/onboarding.json';
import { LABELS, ROUTES } from './config';
import { resolveSlides, ICON_MAP } from './utils';
import {
  BackgroundLayer,
  SlideIcon,
  SlideContent,
  ProgressDots,
  ActionButton,
} from './components';

export default function OnboardingPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const touchRef = useRef<{ startX: number } | null>(null);

  const slides = useMemo(
    () => resolveSlides(onboardingData.slides),
    []
  );

  const slide = slides[current];
  const MainIcon = ICON_MAP[slide.iconKey];

  const goNext = () => {
    if (current < slides.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      router.push(ROUTES.afterOnboarding);
    }
  };

  const goPrev = () => {
    if (current > 0) setCurrent((c) => c - 1);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchRef.current = { startX: e.touches[0].clientX };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchRef.current) return;
    const dx = e.changedTouches[0].clientX - touchRef.current.startX;
    if (Math.abs(dx) > 50) {
      if (dx < 0) goNext();
      else goPrev();
    }
    touchRef.current = null;
  };

  return (
    <div
      className="min-h-screen flex flex-col select-none overflow-hidden relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── 배경 레이어 ── */}
      <BackgroundLayer color={slide.color} slideIndex={current} />

      {/* ── 건너뛰기 ── */}
      <div className="relative z-10 flex justify-end p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(ROUTES.afterOnboarding)}
          className="text-white/40 hover:text-white/80 text-sm"
        >
          {LABELS.btn_skip}
        </Button>
      </div>

      {/* ── 슬라이드 메인 영역 ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center">
        {/* 아이콘 + 플로팅 데코 */}
        <SlideIcon
          icon={MainIcon}
          color={slide.color}
          colorLight={slide.colorLight}
          floatingIcons={slide.floatingIcons}
          slideIndex={current}
        />

        {/* 텍스트 + 프로세스 스텝 */}
        <SlideContent
          slide={slide}
          current={current}
          total={slides.length}
        />
      </div>

      {/* ── 하단 네비게이션 ── */}
      <div className="relative z-10 px-6 pb-10 space-y-5">
        <ProgressDots
          total={slides.length}
          current={current}
          activeColor={slide.color}
          onDotClick={(i) => setCurrent(i)}
        />
        <ActionButton
          isLast={current === slides.length - 1}
          color={slide.color}
          colorLight={slide.colorLight}
          onClick={goNext}
        />
      </div>
    </div>
  );
}
