'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import onboardingData from '@/data/onboarding.json';
import { resolveSlides, ICON_MAP } from '@/app/onboarding/utils';
import { storage } from '@/lib/storage';

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

function TwinklingStarsBg() {
  const stars = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => {
        const r1 = seededRandom(i * 7);
        const r2 = seededRandom(i * 13 + 11);
        const r3 = seededRandom(i * 17 + 23);
        const r4 = seededRandom(i * 19 + 37);
        const r5 = seededRandom(i * 29 + 41);
        return {
          id: i,
          left: `${r1 * 100}%`,
          top: `${r2 * 100}%`,
          size: 1 + r3 * 2.5,
          delay: r4 * 4,
          duration: 1.2 + r5 * 2.5,
        };
      }),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function ColoredDots() {
  const leftColors = ['#22C55E', '#3B82F6', '#6C5CE7'];
  const rightColors = ['#FBBF24', '#EF4444', '#14B8A6'];

  return (
    <>
      <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-0">
        {leftColors.map((c, i) => (
          <div
            key={`l-${i}`}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: c, opacity: 0.6, animation: `twinkle ${2 + i * 0.5}s ease-in-out ${i * 0.3}s infinite` }}
          />
        ))}
      </div>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-0">
        {rightColors.map((c, i) => (
          <div
            key={`r-${i}`}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: c, opacity: 0.6, animation: `twinkle ${2.5 + i * 0.5}s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
    </>
  );
}

const QUIZ_INTRO_PATH = '/quiz/intro';

export function CenterOnboardingSlider() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const touchRef = useRef<{ startX: number } | null>(null);

  const slides = useMemo(() => resolveSlides(onboardingData.slides), []);
  const slide = slides[current];
  const MainIcon = ICON_MAP[slide.iconKey];
  const isLastSlide = current === slides.length - 1;
  const accentColor = slide.color;
  const accentLight = slide.colorLight;

  const goNext = () => {
    if (current < slides.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      storage.user.set({
        id: `user_${Date.now()}`,
        nickname: '탐험가',
        school: 'general',
        grade: '',
        createdAt: new Date().toISOString(),
        onboardingCompleted: true,
      });
      router.push(QUIZ_INTRO_PATH);
    }
  };

  const goPrev = () => {
    if (current > 0) setCurrent((c) => c - 1);
  };

  const goNextRef = useRef(goNext);
  const goPrevRef = useRef(goPrev);
  goNextRef.current = goNext;
  goPrevRef.current = goPrev;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNextRef.current();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrevRef.current();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSkip = () => {
    storage.user.set({
      id: `user_${Date.now()}`,
      nickname: '탐험가',
      school: 'general',
      grade: '',
      createdAt: new Date().toISOString(),
      onboardingCompleted: true,
    });
    router.push(QUIZ_INTRO_PATH);
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
      className="min-h-screen flex flex-col items-center justify-center overflow-hidden relative px-4 py-12"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <TwinklingStarsBg />
      <ColoredDots />

      <button
        onClick={handleSkip}
        className="absolute top-4 right-4 z-20 text-sm text-white/50 hover:text-white/80 transition-colors"
      >
        건너뛰기
      </button>

      <div className="relative z-10 w-full max-w-md mx-auto">
        <div
          className="rounded-3xl p-8 text-center relative overflow-hidden border"
          style={{
            background: 'rgba(0,0,0,0.6)',
            borderColor: `${accentColor}40`,
            boxShadow: `0 0 60px ${accentColor}20`,
          }}
        >
          {/* 플로팅 아이콘 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {(slide.floatingIcons ?? []).slice(0, 4).map((fi, idx) => (
              <span
                key={idx}
                className="absolute opacity-30"
                style={{
                  left: fi.x,
                  top: fi.y,
                  fontSize: fi.size,
                  animation: `float 4s ease-in-out ${fi.delay}s infinite`,
                }}
              >
                {fi.icon}
              </span>
            ))}
          </div>

          {/* 메인 아이콘 + 점선 궤도 */}
          <div className="relative mb-6 flex justify-center">
            <div className="relative w-32 h-32">
              {/* 점선 원 궤도 */}
              <div
                className="absolute inset-0 rounded-full border-2 border-dashed opacity-40"
                style={{ borderColor: accentLight, animation: 'spin 20s linear infinite' }}
              />
              <div
                className="absolute inset-2 rounded-full border border-dashed opacity-30"
                style={{ borderColor: accentLight, animation: 'spin 25s linear infinite reverse' }}
              />
              {/* 메인 아이콘 */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${accentColor} 0%, ${accentLight} 100%)`,
                  boxShadow: `0 0 40px ${accentColor}60`,
                }}
              >
                <MainIcon className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>

          {/* STEP X/6 배지 */}
          <div
            className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-4"
            style={{ background: `${accentColor}80` }}
          >
            STEP {current + 1} / {slides.length}
          </div>

          <h2 className="text-xl min-[640px]:text-2xl font-bold text-white mb-2">
            {slide.title}
          </h2>
          <p className="text-xs uppercase tracking-wider mb-3" style={{ color: accentLight }}>
            {slide.subtitle}
          </p>
          <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">
            {slide.description}
          </p>

          {slide.steps && slide.steps.length > 0 && (
            <div className="mt-4 flex justify-center gap-2 flex-wrap">
              {slide.steps.map((s, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-1 rounded-lg border"
                  style={{ background: `${accentColor}20`, borderColor: `${accentColor}40`, color: accentLight }}
                >
                  {s.emoji} {s.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${
                i === current ? 'h-2 bg-white' : 'w-2 h-2 bg-white/30 hover:bg-white/50'
              }`}
              style={i === current ? { width: 24, backgroundColor: accentColor } : {}}
              aria-label={`슬라이드 ${i + 1}`}
            />
          ))}
        </div>

        {/* Prev/Next */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={goPrev}
            disabled={current === 0}
            className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/10 disabled:opacity-30 disabled:pointer-events-none border border-white/10"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={goNext}
            className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white w-full min-[640px]:w-auto justify-center transition-all hover:scale-105 active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${accentColor} 0%, ${accentLight} 100%)`,
              boxShadow: `0 4px 24px ${accentColor}50`,
            }}
          >
            {isLastSlide ? (
              <>
                <Sparkles className="w-5 h-5" />
                지금 시작하기
              </>
            ) : (
              <>
                다음
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
