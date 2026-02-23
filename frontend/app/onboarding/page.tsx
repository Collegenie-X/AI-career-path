'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronRight, Sparkles, Map, Zap, Trophy, Compass, Sword, BookOpen, Crown } from 'lucide-react';

const SLIDES = [
  {
    color: '#6C5CE7',
    colorLight: '#a29bfe',
    title: '나를 발견하는 여정',
    subtitle: 'RIASEC Personality Discovery',
    description: '20개 상황형 질문에 답하면\n숨겨진 적성 유형이 깨어납니다',
    mainIcon: Sparkles,
    floatingIcons: [
      { icon: '?', x: '15%', y: '20%', size: 28, delay: 0 },
      { icon: '!', x: '78%', y: '15%', size: 24, delay: 0.5 },
      { icon: '*', x: '85%', y: '65%', size: 20, delay: 1 },
      { icon: '+', x: '10%', y: '70%', size: 22, delay: 1.5 },
    ],
  },
  {
    color: '#3B82F6',
    colorLight: '#93c5fd',
    title: '8개의 별을 탐험하세요',
    subtitle: 'Star Explorer',
    description: '기술, 과학, 예술, 사회, 경영 등\n직업의 별에서 모험을 시작하세요',
    mainIcon: Compass,
    floatingIcons: [
      { icon: '🏰', x: '12%', y: '18%', size: 28, delay: 0 },
      { icon: '🗺️', x: '82%', y: '22%', size: 24, delay: 0.3 },
      { icon: '⚔️', x: '80%', y: '68%', size: 26, delay: 0.6 },
      { icon: '🛡️', x: '15%', y: '72%', size: 22, delay: 0.9 },
    ],
  },
  {
    color: '#22C55E',
    colorLight: '#86efac',
    title: '직업을 직접 체험하세요',
    subtitle: 'Day Simulation',
    description: '실제 직업인의 하루를 시뮬레이션하고\n선택에 따라 스토리가 변화합니다',
    mainIcon: Sword,
    floatingIcons: [
      { icon: '☀️', x: '18%', y: '15%', size: 26, delay: 0 },
      { icon: '💼', x: '80%', y: '20%', size: 24, delay: 0.4 },
      { icon: '🎯', x: '85%', y: '70%', size: 22, delay: 0.8 },
      { icon: '📊', x: '12%', y: '68%', size: 20, delay: 1.2 },
    ],
  },
  {
    color: '#FBBF24',
    colorLight: '#fde68a',
    title: 'XP를 모아 레벨업',
    subtitle: 'Growth & Achievement',
    description: '활동마다 경험치를 획득하고\n뱃지를 모아 드림북을 완성하세요',
    mainIcon: Crown,
    floatingIcons: [
      { icon: '⭐', x: '14%', y: '16%', size: 26, delay: 0 },
      { icon: '🏆', x: '82%', y: '18%', size: 28, delay: 0.3 },
      { icon: '💎', x: '78%', y: '72%', size: 22, delay: 0.7 },
      { icon: '🎖️', x: '16%', y: '70%', size: 24, delay: 1 },
    ],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0); // -1 left, 1 right
  const touchRef = useRef<{ startX: number } | null>(null);

  const slide = SLIDES[current];
  const MainIcon = slide.mainIcon;

  const goNext = () => {
    if (current < SLIDES.length - 1) {
      setDirection(1);
      setCurrent(current + 1);
    } else {
      router.push('/quiz/intro');
    }
  };

  const goPrev = () => {
    if (current > 0) {
      setDirection(-1);
      setCurrent(current - 1);
    }
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
      {/* Animated background gradient */}
      <div
        className="absolute inset-0 transition-all duration-700 ease-out"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${slide.color}22 0%, transparent 70%)`,
        }}
      />

      {/* Floating particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={`p-${current}-${i}`}
          className="absolute rounded-full animate-float"
          style={{
            width: 3 + Math.random() * 3,
            height: 3 + Math.random() * 3,
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            backgroundColor: slide.color,
            opacity: 0.2 + Math.random() * 0.2,
            animationDuration: `${3 + Math.random() * 4}s`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}

      {/* Skip */}
      <div className="relative z-10 flex justify-end p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/quiz/intro')}
          className="text-white/40 hover:text-white/80 text-sm"
        >
          건너뛰기
        </Button>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center">
        {/* Floating decorative icons */}
        {slide.floatingIcons.map((fi, i) => (
          <div
            key={`fi-${current}-${i}`}
            className="absolute animate-float opacity-0"
            style={{
              left: fi.x,
              top: fi.y,
              fontSize: fi.size,
              animationDuration: `${3 + i}s`,
              animationDelay: `${fi.delay}s`,
              animationFillMode: 'forwards',
              opacity: 0.5,
            }}
          >
            {fi.icon}
          </div>
        ))}

        {/* Central icon with animated ring */}
        <div className="relative mb-8">
          {/* Outer ring */}
          <div
            className="absolute -inset-6 rounded-full animate-sparkle-spin"
            style={{
              border: `2px dashed ${slide.color}40`,
              animationDuration: '12s',
            }}
          />
          {/* Middle ring */}
          <div
            className="absolute -inset-3 rounded-full animate-sparkle-spin"
            style={{
              border: `1px solid ${slide.color}25`,
              animationDuration: '8s',
              animationDirection: 'reverse',
            }}
          />
          {/* Main icon container */}
          <div
            className="w-28 h-28 rounded-[2rem] flex items-center justify-center relative z-10 animate-scale-bounce"
            key={`icon-${current}`}
            style={{
              background: `linear-gradient(135deg, ${slide.color} 0%, ${slide.colorLight} 100%)`,
              boxShadow: `0 0 40px ${slide.color}50, 0 20px 40px ${slide.color}20`,
            }}
          >
            <MainIcon className="w-14 h-14 text-white" strokeWidth={1.5} />
          </div>
          {/* Orbiting dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-orbit" style={{ animationDuration: '6s' }}>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: slide.colorLight, boxShadow: `0 0 8px ${slide.colorLight}` }} />
            </div>
          </div>
        </div>

        {/* Step indicator badge */}
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 animate-slide-up"
          key={`badge-${current}`}
          style={{
            backgroundColor: `${slide.color}20`,
            color: slide.colorLight,
            border: `1px solid ${slide.color}30`,
          }}
        >
          Step {current + 1} / {SLIDES.length}
        </div>

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
      </div>

      {/* Bottom */}
      <div className="relative z-10 px-6 pb-10 space-y-5">
        {/* Progress dots with animation */}
        <div className="flex items-center justify-center gap-2.5">
          {SLIDES.map((s, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
              className="relative h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{
                width: i === current ? 32 : 10,
                backgroundColor: i === current ? slide.color : 'rgba(255,255,255,0.15)',
                boxShadow: i === current ? `0 0 12px ${slide.color}60` : 'none',
              }}
            >
              {i === current && (
                <div className="absolute inset-0 rounded-full animate-shimmer" />
              )}
            </button>
          ))}
        </div>

        {/* Action button */}
        <Button
          size="lg"
          className="w-full h-14 text-base font-bold rounded-2xl border-0 relative overflow-hidden transition-transform active:scale-[0.97]"
          style={{
            background: `linear-gradient(135deg, ${slide.color} 0%, ${slide.colorLight} 100%)`,
            boxShadow: `0 8px 24px ${slide.color}40`,
          }}
          onClick={goNext}
        >
          <span className="absolute inset-0 animate-shimmer" />
          <span className="relative flex items-center justify-center gap-2">
            {current < SLIDES.length - 1 ? (
              <>다음 <ChevronRight className="w-5 h-5" /></>
            ) : (
              <>적성 검사 시작 <Sparkles className="w-5 h-5" /></>
            )}
          </span>
        </Button>
      </div>
    </div>
  );
}
