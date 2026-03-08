'use client';

import { useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sparkles, ChevronRight } from 'lucide-react';

import onboardingData from '@/data/onboarding.json';
import { LABELS, ROUTES } from './config';
import { resolveSlides, ICON_MAP } from './utils';
import { storage } from '@/lib/storage';
import {
  BackgroundLayer,
  SlideIcon,
  SlideContent,
  ProgressDots,
} from './components';

/**
 * 온보딩: 앱 소개 슬라이드만 표시.
 * 프로필(닉네임·학교·학년)은 회원가입 이후 설정 페이지에서 입력.
 * 마지막 슬라이드 완료 시 최소 프로필 생성 후 퀴즈로 이동.
 */
export default function OnboardingPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const touchRef = useRef<{ startX: number } | null>(null);

  const slides = useMemo(() => resolveSlides(onboardingData.slides), []);
  const slide = slides[current];
  const MainIcon = ICON_MAP[slide.iconKey];
  const isLastSlide = current === slides.length - 1;

  const goNext = () => {
    if (current < slides.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      // 최소 프로필 생성 (학생/일반인 구분 없음, 추후 회원가입·설정에서 상세 입력)
      storage.user.set({
        id: `user_${Date.now()}`,
        nickname: '탐험가',
        school: 'general',
        grade: '',
        createdAt: new Date().toISOString(),
        onboardingCompleted: true,
      });
      router.push(ROUTES.afterOnboarding);
    }
  };

  const goPrev = () => {
    if (current > 0) setCurrent((c) => c - 1);
  };

  const handleSkip = () => {
    storage.user.set({
      id: `user_${Date.now()}`,
      nickname: '탐험가',
      school: 'general',
      grade: '',
      createdAt: new Date().toISOString(),
      onboardingCompleted: true,
    });
    router.push(ROUTES.afterOnboarding);
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
      style={{ background: 'linear-gradient(180deg, #0f0f1e 0%, #1a1a2e 100%)' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <BackgroundLayer color={slide.color} slideIndex={current} />

      <div className="relative z-10 flex justify-end p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          className="text-white/40 hover:text-white/80 text-sm"
        >
          {LABELS.btn_skip}
        </Button>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center overflow-y-auto">
        <SlideIcon
          icon={MainIcon}
          color={slide.color}
          colorLight={slide.colorLight}
          floatingIcons={slide.floatingIcons}
          slideIndex={current}
        />
        <SlideContent
          slide={slide}
          current={current}
          total={slides.length}
        />
      </div>

      <div className="relative z-10 px-6 pb-10 space-y-5">
        <ProgressDots
          total={slides.length}
          current={current}
          activeColor={slide.color}
          onDotClick={(i) => setCurrent(i)}
        />

        <Button
          size="lg"
          className="w-full h-14 text-base font-bold rounded-2xl border-0 relative overflow-hidden transition-all active:scale-[0.97]"
          style={{
            background: `linear-gradient(135deg, ${slide.color} 0%, ${slide.colorLight} 100%)`,
            boxShadow: `0 8px 24px ${slide.color}40`,
          }}
          onClick={goNext}
        >
          <span className="relative flex items-center justify-center gap-2">
            {isLastSlide ? (
              <>
                {LABELS.btn_start}
                <Sparkles className="w-5 h-5" />
              </>
            ) : (
              <>
                {LABELS.btn_next}
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </span>
        </Button>
      </div>

      <style jsx global>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
