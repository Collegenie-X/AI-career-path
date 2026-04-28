'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Rocket, ArrowRight, ChevronRight, Sparkles } from 'lucide-react';
import { StarfieldCanvas } from '@/components/shared/StarfieldCanvas';
import { HeroCareerSVG } from './HeroCareerSVG';
import homeContent from '@/data/home-content.json';

const hero = homeContent.hero as typeof homeContent.hero & {
  rotatingDescriptions?: string[];
  rotatingDescriptionIntervalMs?: number;
};

export function HeroSectionLanding() {
  const rotatingLines = useMemo(
    () =>
      Array.isArray(hero.rotatingDescriptions) && hero.rotatingDescriptions.length > 0
        ? hero.rotatingDescriptions
        : [hero.description],
    []
  );
  const rotatingIntervalMs =
    typeof hero.rotatingDescriptionIntervalMs === 'number' ? hero.rotatingDescriptionIntervalMs : 5200;

  const [descriptionLineIndex, setDescriptionLineIndex] = useState(0);

  useEffect(() => {
    if (rotatingLines.length <= 1) return undefined;
    const timerId = window.setInterval(() => {
      setDescriptionLineIndex((previousIndex) => (previousIndex + 1) % rotatingLines.length);
    }, rotatingIntervalMs);
    return () => window.clearInterval(timerId);
  }, [rotatingLines.length, rotatingIntervalMs]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-black">
      <StarfieldCanvas count={90} />

      {/* Floating decorative icons */}
      {hero.floatingIcons.map((icon, i) => (
        <div
          key={i}
          className={`absolute ${icon.size} select-none hidden lg:block`}
          style={{
            top: icon.top,
            left: 'left' in icon ? icon.left : undefined,
            right: 'right' in icon ? icon.right : undefined,
            animation: `icon-float ${3 + i * 0.4}s ease-in-out ${icon.delay} infinite`,
            filter: 'drop-shadow(0 0 8px rgba(108,92,231,0.6))',
          }}
        >
          {icon.emoji}
        </div>
      ))}

      <div className="web-container relative z-10 py-20 md:py-28">
        {/* Two-column layout on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* ── Left column: text content ── */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border"
              style={{
                background: 'rgba(167,139,250,0.08)',
                borderColor: 'rgba(167,139,250,0.25)',
              }}
            >
              <Sparkles className="w-4 h-4" style={{ color: '#a78bfa' }} />
              <span className="text-sm font-bold" style={{ color: '#a78bfa' }}>
                {hero.badge.emoji}
              </span>
              <span className="text-sm font-medium text-white/60">{hero.badge.text}</span>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#a78bfa' }} />
            </motion.div>

            {/* Main heading */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-5"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-2">
                {hero.heading.line1}
              </h1>
              <h1
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent leading-[1.1] tracking-tight"
                style={{
                  backgroundImage: 'linear-gradient(110deg, #c4b5fd 0%, #a78bfa 25%, #818cf8 50%, #60a5fa 75%, #93c5fd 100%)',
                }}
              >
                {hero.heading.line2}
              </h1>
            </motion.div>

            {/* Descriptive narrative text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-4 max-w-lg"
            >
              <p className="text-sm text-white/35 leading-relaxed mb-3 font-medium uppercase tracking-widest">
                — 당신의 진로 여정은 4단계로 시작됩니다
              </p>
              <div className="flex flex-wrap gap-2 mb-4 justify-center lg:justify-start">
                {['🧭 적성검사', '🗺️ 커리어 탐색', '🤖 AI 패스 설계', '📋 실행 계획'].map((step, i) => (
                  <span
                    key={step}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full border"
                    style={{
                      background: 'rgba(108,92,231,0.08)',
                      borderColor: 'rgba(108,92,231,0.25)',
                      color: '#a78bfa',
                      animationDelay: `${i * 0.15}s`,
                    }}
                  >
                    {step}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Rotating description */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-8 max-w-lg"
            >
              <div className="min-h-[3.5rem] flex items-start">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={rotatingLines[descriptionLineIndex]}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4 }}
                    className="text-base md:text-lg text-white/55 leading-relaxed"
                  >
                    {rotatingLines[descriptionLineIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
              {rotatingLines.length > 1 && (
                <div className="flex gap-1.5 mt-2 justify-center lg:justify-start" aria-hidden>
                  {rotatingLines.map((_, index) => (
                    <span
                      key={index}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        index === descriptionLineIndex ? 'w-6 bg-purple-400/80' : 'w-1.5 bg-white/15'
                      }`}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center gap-3 mb-10 w-full sm:w-auto"
            >
              <Link
                href={hero.cta.primary.href}
                className="group flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-base text-white transition-all hover:scale-105 active:scale-95 w-full sm:w-auto justify-center"
                style={{
                  background: 'linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%)',
                  boxShadow: '0 8px 40px rgba(108,92,231,0.55)',
                }}
              >
                <Rocket className="w-4 h-4" />
                {hero.cta.primary.label}
                <ChevronRight className="w-4 h-4 animate-arrow-bounce" />
              </Link>
              <Link
                href={hero.cta.secondary.href}
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm text-white/60 border border-white/12 hover:border-white/28 hover:text-white transition-all w-full sm:w-auto justify-center"
              >
                {hero.cta.secondary.label}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Stat badges */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-sm sm:max-w-none"
            >
              {hero.statBadges.map((b) => (
                <div
                  key={b.value}
                  className="flex flex-col items-center gap-1 rounded-2xl py-3 px-2 border transition-all hover:scale-105"
                  style={{ background: `${b.color}10`, borderColor: `${b.color}30` }}
                >
                  <span className="text-xl">{b.emoji}</span>
                  <span className="text-base font-extrabold text-white leading-none">{b.value}</span>
                  <span className="text-xs font-medium" style={{ color: b.color }}>{b.sub}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Right column: animated SVG ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:flex items-center justify-center"
          >
            <HeroCareerSVG />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/30">
        <span className="text-xs tracking-widest uppercase">{hero.scrollLabel}</span>
        <div className="animate-bounce text-lg">↓</div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </section>
  );
}
