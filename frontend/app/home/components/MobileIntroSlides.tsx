'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import onboardingData from '@/data/onboarding.json';
import { resolveSlides, ICON_MAP } from '@/app/onboarding/utils';
import { storage } from '@/lib/storage';

const STAR_EMOJIS = ['⭐', '✨', '🌟', '💫', '🔮'];

function TwinklingStars() {
  const stars = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: `${(i * 37) % 100}%`,
        top: `${(i * 23 + 11) % 100}%`,
        size: 2 + (i % 3),
        delay: (i * 0.3) % 3,
        duration: 2 + (i % 3),
      })),
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

function OrbitingPlanets() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48">
        <div className="absolute inset-0" style={{ animation: 'orbit 12s linear infinite' }}>
          <div className="w-4 h-4 rounded-full bg-purple-400/80 shadow-lg shadow-purple-400/50" />
        </div>
        <div className="absolute inset-0" style={{ animation: 'orbit-reverse 15s linear infinite' }}>
          <div className="w-3 h-3 rounded-full bg-blue-400/70 shadow-lg shadow-blue-400/40" style={{ marginLeft: -6 }} />
        </div>
        <div className="absolute inset-0" style={{ animation: 'orbit 18s linear infinite', animationDelay: '-4s' }}>
          <div className="w-2 h-2 rounded-full bg-amber-400/90 shadow-lg shadow-amber-400/50" style={{ marginLeft: -4 }} />
        </div>
      </div>
    </div>
  );
}

export function MobileIntroSlides() {
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
      storage.user.set({
        id: `user_${Date.now()}`,
        nickname: '탐험가',
        school: 'general',
        grade: '',
        createdAt: new Date().toISOString(),
        onboardingCompleted: true,
      });
      router.push('/dashboard');
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
    router.push('/dashboard');
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
      className="min-h-screen flex flex-col items-center justify-center bg-black overflow-hidden relative px-4"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <TwinklingStars />
      <OrbitingPlanets />

      {/* Skip */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-4 z-20 text-sm text-white/50 hover:text-white/80"
      >
        건너뛰기
      </button>

      {/* Center Card - 한 슬라이드씩 설명 */}
      <div className="relative z-10 w-full max-w-sm">
        <div
          className="rounded-3xl p-8 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(108,92,231,0.2) 0%, rgba(59,130,246,0.1) 100%)',
            border: '1px solid rgba(108,92,231,0.4)',
            boxShadow: '0 0 40px rgba(108,92,231,0.2)',
          }}
        >
          {/* 플로팅 별 아이콘 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {(slide.floatingIcons ?? []).slice(0, 4).map((fi, idx) => (
              <span
                key={idx}
                className="absolute opacity-20 animate-float"
                style={{
                  left: fi.x,
                  top: fi.y,
                  fontSize: fi.size,
                  animationDelay: `${fi.delay}s`,
                }}
              >
                {fi.icon}
              </span>
            ))}
          </div>

          {/* 메인 아이콘 - 행성/별 느낌 */}
          <div className="relative mb-6">
            <div
              className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center animate-pulse-glow"
              style={{
                background: 'linear-gradient(135deg, #6C5CE7 0%, #a29bfe 50%, #6C5CE7 100%)',
                boxShadow: '0 0 30px rgba(108,92,231,0.5)',
              }}
            >
              <MainIcon className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 text-2xl" style={{ animation: 'twinkle 2s ease-in-out infinite' }}>
              {STAR_EMOJIS[current % STAR_EMOJIS.length]}
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mb-2">
            {slide.title}
          </h2>
          <p className="text-xs text-purple-300 mb-3">
            {slide.subtitle}
          </p>
          <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">
            {slide.description}
          </p>

          {slide.steps && slide.steps.length > 0 && (
            <div className="mt-4 flex justify-center gap-2 flex-wrap">
              {slide.steps.map((s: { emoji: string; label: string }, i: number) => (
                <span
                  key={i}
                  className="text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10"
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
              className={`w-2 h-2 rounded-full transition-all ${
                i === current ? 'bg-purple-400 w-6' : 'bg-white/30'
              }`}
              aria-label={`슬라이드 ${i + 1}`}
            />
          ))}
        </div>

        {/* Prev/Next */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={goPrev}
            disabled={current === 0}
            className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/10 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={goNext}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%)',
              boxShadow: '0 4px 20px rgba(108,92,231,0.5)',
            }}
          >
            {isLastSlide ? (
              <>
                <Sparkles className="w-5 h-5" />
                시작하기
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
