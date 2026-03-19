'use client';

import { useMemo } from 'react';
import { Sparkles } from 'lucide-react';

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function TwinklingStarsBg() {
  const stars = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: `${seededRandom(i * 3 + 100) * 100}%`,
        top: `${seededRandom(i * 7 + 101) * 100}%`,
        size: 1 + seededRandom(i * 5 + 102) * 2.5,
        delay: seededRandom(i * 11 + 103) * 5,
        duration: 2 + seededRandom(i * 13 + 104) * 4,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white/60"
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

export function AboutHeroSection() {
  return (
    <section className="relative py-28 md:py-40 overflow-hidden bg-black">
      <TwinklingStarsBg />

      {/* Glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #6C5CE7, transparent)' }}
      />

      <div className="web-container relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-sm font-medium text-white/70">DreamPath 소개</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
          모든 학생의 꿈을
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(135deg, #a29bfe 0%, #6C5CE7 50%, #3B82F6 100%)' }}
          >
            현실로 만들기 위해
          </span>
        </h1>

        <p className="text-lg md:text-xl text-white/55 max-w-2xl mx-auto leading-relaxed">
          DreamPath는 AI 기술과 게이미피케이션을 결합하여 학생들이 자신의 진로를 탐색하고,
          체계적으로 준비할 수 있는 플랫폼입니다.
        </p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </section>
  );
}
